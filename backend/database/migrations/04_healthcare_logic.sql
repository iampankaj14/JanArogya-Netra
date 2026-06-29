-- 04_healthcare_logic.sql
-- Healthcare Modules Triggers and Transactional Logic

-- -----------------------------------------------------
-- Atomic Stock Transfer Processing Transaction
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.process_medicine_transfer(
    transfer_uuid UUID, 
    action_status VARCHAR, -- 'APPROVED', 'DELIVERED', 'REJECTED', 'CANCELLED'
    actor_uuid UUID,
    reject_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    t_record RECORD;
BEGIN
    -- Lock the transfer row for update
    SELECT * INTO t_record FROM public.medicine_transfers WHERE id = transfer_uuid FOR UPDATE;
    IF t_record IS NULL THEN
        RAISE EXCEPTION 'Transfer request not found.';
    END IF;
    
    IF t_record.status IN ('DELIVERED', 'CANCELLED', 'REJECTED') THEN
        RAISE EXCEPTION 'Transfer is already in a terminal state.';
    END IF;
    
    IF action_status = 'APPROVED' THEN
        -- Move transfer status to EN_ROUTE
        UPDATE public.medicine_transfers 
        SET status = 'EN_ROUTE', updated_by = actor_uuid
        WHERE id = transfer_uuid;
        
        -- Insert approval record log
        INSERT INTO public.approvals (entity_type, entity_id, approved_by, status, reason)
        VALUES ('MEDICINE_REQUEST', transfer_uuid, actor_uuid, 'APPROVED', 'Transfer approved and en route');
        
        -- Create notification for target PHC staff
        INSERT INTO public.notifications (user_id, title, message, type)
        SELECT u.id, 'Redistribution Shipped', 
               format('A shipment of %s %s is en route to your PHC.', t_record.quantity, (SELECT name FROM public.medicine_master WHERE id = t_record.medicine_id)),
               'INFO'
        FROM public.users u
        WHERE u.phc_id = t_record.target_phc_id AND u.status = 'ACTIVE' AND u.soft_delete = FALSE;
        
    ELSIF action_status = 'DELIVERED' THEN
        -- 1. Complete transfer status
        UPDATE public.medicine_transfers 
        SET status = 'DELIVERED', updated_by = actor_uuid
        WHERE id = transfer_uuid;
        
        -- 2. Add stock to target PHC
        INSERT INTO public.medicine_stock (phc_id, medicine_id, current_stock, min_required_stock)
        VALUES (t_record.target_phc_id, t_record.medicine_id, t_record.quantity, 0)
        ON CONFLICT (phc_id, medicine_id) 
        DO UPDATE SET current_stock = public.medicine_stock.current_stock + t_record.quantity;
        
        -- 3. Log stock inward history
        INSERT INTO public.medicine_stock_history (phc_id, medicine_id, quantity_changed, change_type, reason)
        VALUES (t_record.target_phc_id, t_record.medicine_id, t_record.quantity, 'INWARD', format('Received from transfer %s', transfer_uuid));
        
        -- Create notification for target PHC staff
        INSERT INTO public.notifications (user_id, title, message, type)
        SELECT u.id, 'Redistribution Delivered', 
               format('Successfully received %s units of medicine.', t_record.quantity),
               'INFO'
        FROM public.users u
        WHERE u.phc_id = t_record.target_phc_id AND u.status = 'ACTIVE' AND u.soft_delete = FALSE;
        
    ELSIF action_status IN ('REJECTED', 'CANCELLED') THEN
        -- 1. Terminate transfer status
        UPDATE public.medicine_transfers 
        SET status = action_status, updated_by = actor_uuid
        WHERE id = transfer_uuid;
        
        -- 2. Refund stock to source PHC (since it was deducted on transfer request creation)
        UPDATE public.medicine_stock 
        SET current_stock = current_stock + t_record.quantity 
        WHERE phc_id = t_record.source_phc_id AND medicine_id = t_record.medicine_id;
        
        -- 3. Log stock inward history (refund type)
        INSERT INTO public.medicine_stock_history (phc_id, medicine_id, quantity_changed, change_type, reason)
        VALUES (t_record.source_phc_id, t_record.medicine_id, t_record.quantity, 'INWARD', format('Refund for transfer %s (%s)', transfer_uuid, action_status));
        
        -- Insert approval record log (for rejections)
        IF action_status = 'REJECTED' THEN
            INSERT INTO public.approvals (entity_type, entity_id, approved_by, status, reason)
            VALUES ('MEDICINE_REQUEST', transfer_uuid, actor_uuid, 'REJECTED', reject_reason);
        END IF;
        
        -- Create notification for source PHC staff
        INSERT INTO public.notifications (user_id, title, message, type)
        SELECT u.id, format('Transfer %s', action_status), 
               format('Redistribution of %s units was %s. Stock has been refunded.', t_record.quantity, LOWER(action_status)),
               'WARNING'
        FROM public.users u
        WHERE u.phc_id = t_record.source_phc_id AND u.status = 'ACTIVE' AND u.soft_delete = FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ language plpgsql security definer;

-- -----------------------------------------------------
-- Automated Trigger: Notification on Transfer Creation
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION notify_on_transfer_request()
RETURNS TRIGGER AS $$
DECLARE
    src_name VARCHAR;
    tgt_name VARCHAR;
    med_name VARCHAR;
BEGIN
    SELECT name INTO src_name FROM public.phcs WHERE id = NEW.source_phc_id;
    SELECT name INTO tgt_name FROM public.phcs WHERE id = NEW.target_phc_id;
    SELECT name INTO med_name FROM public.medicine_master WHERE id = NEW.medicine_id;

    -- Alert district DHO and target block BMO
    INSERT INTO public.notifications (user_id, title, message, type)
    SELECT u.id, 'New Transfer Request Pending',
           format('%s is requesting %s units of %s from %s.', tgt_name, NEW.quantity, med_name, src_name),
           'APPROVAL'
    FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE (r.name = 'DHO' AND u.district_id = (SELECT district_id FROM public.users WHERE phc_id = NEW.target_phc_id))
       OR (r.name = 'BMO' AND u.block_id = (SELECT block_id FROM public.users WHERE phc_id = NEW.target_phc_id));
    RETURN NEW;
END;
$$ language plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_on_transfer_request ON public.medicine_transfers;
CREATE TRIGGER trigger_notify_on_transfer_request
    AFTER INSERT ON public.medicine_transfers
    FOR EACH ROW EXECUTE FUNCTION notify_on_transfer_request();

-- -----------------------------------------------------
-- Automated Trigger: Notification on Low Stock Threshold
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION notify_on_low_stock()
RETURNS TRIGGER AS $$
DECLARE
    med_name VARCHAR;
BEGIN
    IF NEW.current_stock < NEW.min_required_stock THEN
        SELECT name INTO med_name FROM public.medicine_master WHERE id = NEW.medicine_id;
        
        -- Alert local PHC staff
        INSERT INTO public.notifications (user_id, title, message, type)
        SELECT u.id, 'Critical Medicine Shortage',
               format('Stock of %s is at %s, which is below the minimum limit of %s.', med_name, NEW.current_stock, NEW.min_required_stock),
               'CRITICAL'
        FROM public.users u
        WHERE u.phc_id = NEW.phc_id AND u.status = 'ACTIVE' AND u.soft_delete = FALSE;
    END IF;
    RETURN NEW;
END;
$$ language plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_on_low_stock ON public.medicine_stock;
CREATE TRIGGER trigger_notify_on_low_stock
    AFTER INSERT OR UPDATE OF current_stock ON public.medicine_stock
    FOR EACH ROW EXECUTE FUNCTION notify_on_low_stock();

-- -----------------------------------------------------
-- Automated Trigger: Notification on Outbreak Alert (>5 cases)
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION notify_on_outbreak()
RETURNS TRIGGER AS $$
DECLARE
    phc_name VARCHAR;
BEGIN
    IF NEW.case_count > 5 THEN
        SELECT name INTO phc_name FROM public.phcs WHERE id = NEW.phc_id;
        
        -- Alert DHO and BMO
        INSERT INTO public.notifications (user_id, title, message, type)
        SELECT u.id, 'Potential Outbreak Alert',
               format('PHC %s registered %s active cases of %s on %s.', phc_name, NEW.case_count, NEW.disease_name, NEW.report_date),
               'CRITICAL'
        FROM public.users u
        JOIN public.roles r ON u.role_id = r.id
        WHERE (r.name = 'DHO' AND u.district_id = (SELECT district_id FROM public.users WHERE phc_id = NEW.phc_id))
           OR (r.name = 'BMO' AND u.block_id = (SELECT block_id FROM public.users WHERE phc_id = NEW.phc_id));
    END IF;
    RETURN NEW;
END;
$$ language plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_on_outbreak ON public.disease_cases;
CREATE TRIGGER trigger_notify_on_outbreak
    AFTER INSERT OR UPDATE OF case_count ON public.disease_cases
    FOR EACH ROW EXECUTE FUNCTION notify_on_outbreak();
