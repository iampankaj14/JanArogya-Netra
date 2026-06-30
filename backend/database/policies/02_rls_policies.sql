-- 02_rls_policies.sql
-- Enable Row Level Security (RLS) and define granular access policies

-- -----------------------------------------------------
-- Scope Verification Helper Functions
-- -----------------------------------------------------

-- Check if user has access to a specific district
CREATE OR REPLACE FUNCTION public.check_district_scope(user_uuid UUID, check_district_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_role VARCHAR;
    user_dist UUID;
BEGIN
    user_role := public.get_user_role(user_uuid);
    IF user_role = 'SUPER_ADMIN' THEN
        RETURN TRUE;
    END IF;
    
    SELECT district_id INTO user_dist FROM public.users WHERE id = user_uuid;
    RETURN user_dist = check_district_id;
END;
$$ language plpgsql security definer;

-- Check if user has access to a specific block
CREATE OR REPLACE FUNCTION public.check_block_scope(user_uuid UUID, check_block_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_role VARCHAR;
    user_dist UUID;
    user_blk UUID;
    block_dist UUID;
BEGIN
    user_role := public.get_user_role(user_uuid);
    IF user_role = 'SUPER_ADMIN' THEN
        RETURN TRUE;
    END IF;
    
    SELECT district_id, block_id INTO user_dist, user_blk FROM public.users WHERE id = user_uuid;
    
    -- DHO: verify block is in DHO's district
    IF user_role = 'DHO' THEN
        SELECT district_id INTO block_dist FROM public.blocks WHERE id = check_block_id;
        RETURN user_dist = block_dist;
    END IF;
    
    -- BMO: verify block matches
    IF user_role = 'BMO' THEN
        RETURN user_blk = check_block_id;
    END IF;
    
    -- Lower roles: check if their assigned facility maps to this block
    RETURN FALSE;
END;
$$ language plpgsql security definer;

-- Check if user has access to a specific PHC
CREATE OR REPLACE FUNCTION public.check_phc_scope(user_uuid UUID, check_phc_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_role VARCHAR;
    user_dist UUID;
    user_blk UUID;
    user_phc UUID;
    phc_blk UUID;
    phc_dist UUID;
BEGIN
    user_role := public.get_user_role(user_uuid);
    IF user_role = 'SUPER_ADMIN' THEN
        RETURN TRUE;
    END IF;
    
    SELECT district_id, block_id, phc_id INTO user_dist, user_blk, user_phc FROM public.users WHERE id = user_uuid;
    
    -- DHO: check district of PHC
    IF user_role = 'DHO' THEN
        SELECT b.district_id INTO phc_dist 
        FROM public.phcs p 
        JOIN public.blocks b ON p.block_id = b.id 
        WHERE p.id = check_phc_id;
        RETURN user_dist = phc_dist;
    END IF;
    
    -- BMO: check block of PHC
    IF user_role = 'BMO' THEN
        SELECT block_id INTO phc_blk FROM public.phcs WHERE id = check_phc_id;
        RETURN user_blk = phc_blk;
    END IF;
    
    -- PHC_STAFF: match phc_id
    RETURN user_phc = check_phc_id;
END;
$$ language plpgsql security definer;

-- Check if user has access to a specific Sub Center
CREATE OR REPLACE FUNCTION public.check_sub_center_scope(user_uuid UUID, check_sc_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    sc_phc_id UUID;
BEGIN
    SELECT phc_id INTO sc_phc_id FROM public.sub_centers WHERE id = check_sc_id;
    IF sc_phc_id IS NULL THEN
        RETURN FALSE;
    END IF;
    RETURN public.check_phc_scope(user_uuid, sc_phc_id);
END;
$$ language plpgsql security definer;

-- Check if user has access to a specific Village
CREATE OR REPLACE FUNCTION public.check_village_scope(user_uuid UUID, check_vil_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    vil_sc_id UUID;
BEGIN
    SELECT sub_center_id INTO vil_sc_id FROM public.villages WHERE id = check_vil_id;
    IF vil_sc_id IS NULL THEN
        RETURN FALSE;
    END IF;
    RETURN public.check_sub_center_scope(user_uuid, vil_sc_id);
END;
$$ language plpgsql security definer;

-- -----------------------------------------------------
-- Enable RLS on All Tables
-- -----------------------------------------------------

DO $$
DECLARE
    t TEXT;
    tables TEXT[] := ARRAY[
        'roles', 'districts', 'blocks', 'phcs', 'sub_centers', 'villages', 'users', 
        'permissions', 'role_permissions', 'settings', 'audit_logs', 'activity_logs', 
        'notifications', 'uploaded_documents', 'rate_limits', 'doctors', 'doctor_attendance', 
        'patients', 'patient_visits', 'medicine_master', 'medicine_stock', 'medicine_stock_history', 
        'medicine_requests', 'medicine_transfers', 'resource_requests', 'resource_allocations', 
        'disease_cases', 'disease_predictions', 'dashboard_metrics', 'chat_history', 
        'ai_recommendations', 'missions', 'approvals', 'reports'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    END LOOP;
END;
$$;

-- -----------------------------------------------------
-- RLS Policy Declarations
-- -----------------------------------------------------

-- Helper to check if Super Admin
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.get_user_role(auth.uid()) = 'SUPER_ADMIN';
END;
$$ language plpgsql security definer;

-- 1. Roles, Permissions, Role Permissions Policies
CREATE POLICY "Roles read by all authenticated" ON public.roles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Roles managed by Super Admin" ON public.roles FOR ALL USING (public.is_admin());

CREATE POLICY "Permissions read by all authenticated" ON public.permissions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Permissions managed by Super Admin" ON public.permissions FOR ALL USING (public.is_admin());

CREATE POLICY "Role permissions read by all authenticated" ON public.role_permissions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Role permissions managed by Super Admin" ON public.role_permissions FOR ALL USING (public.is_admin());

-- 2. Districts Policies
CREATE POLICY "Districts select" ON public.districts FOR SELECT 
    USING (public.has_permission(auth.uid(), 'districts:read') AND public.check_district_scope(auth.uid(), id) AND (soft_delete = FALSE OR public.is_admin()));
CREATE POLICY "Districts write" ON public.districts FOR ALL 
    USING (public.has_permission(auth.uid(), 'districts:write') AND (soft_delete = FALSE OR public.is_admin()));

-- 3. Blocks Policies
CREATE POLICY "Blocks select" ON public.blocks FOR SELECT 
    USING (public.has_permission(auth.uid(), 'blocks:read') AND public.check_block_scope(auth.uid(), id) AND (soft_delete = FALSE OR public.is_admin()));
CREATE POLICY "Blocks write" ON public.blocks FOR ALL 
    USING (public.has_permission(auth.uid(), 'blocks:write') AND public.check_district_scope(auth.uid(), district_id) AND (soft_delete = FALSE OR public.is_admin()));

-- 4. PHCs Policies
CREATE POLICY "PHCs select" ON public.phcs FOR SELECT 
    USING (public.has_permission(auth.uid(), 'phcs:read') AND public.check_phc_scope(auth.uid(), id) AND (soft_delete = FALSE OR public.is_admin()));
CREATE POLICY "PHCs write" ON public.phcs FOR ALL 
    USING (public.has_permission(auth.uid(), 'phcs:write') AND public.check_block_scope(auth.uid(), block_id) AND (soft_delete = FALSE OR public.is_admin()));

-- 5. Sub Centers Policies
CREATE POLICY "Sub Centers select" ON public.sub_centers FOR SELECT 
    USING (public.has_permission(auth.uid(), 'sub_centers:read') AND public.check_sub_center_scope(auth.uid(), id) AND (soft_delete = FALSE OR public.is_admin()));
CREATE POLICY "Sub Centers write" ON public.sub_centers FOR ALL 
    USING (public.has_permission(auth.uid(), 'sub_centers:write') AND public.check_phc_scope(auth.uid(), phc_id) AND (soft_delete = FALSE OR public.is_admin()));

-- 6. Villages Policies
CREATE POLICY "Villages select" ON public.villages FOR SELECT 
    USING (public.has_permission(auth.uid(), 'villages:read') AND public.check_village_scope(auth.uid(), id) AND (soft_delete = FALSE OR public.is_admin()));
CREATE POLICY "Villages write" ON public.villages FOR ALL 
    USING (public.has_permission(auth.uid(), 'villages:write') AND public.check_sub_center_scope(auth.uid(), sub_center_id) AND (soft_delete = FALSE OR public.is_admin()));

-- 7. Users Policies
CREATE POLICY "Users select" ON public.users FOR SELECT 
    USING (
        public.has_permission(auth.uid(), 'users:read') AND 
        (
            id = auth.uid() OR
            public.is_admin() OR
            (public.get_user_role(auth.uid()) = 'DHO' AND district_id = (SELECT district_id FROM public.users WHERE id = auth.uid())) OR
            (public.get_user_role(auth.uid()) = 'BMO' AND block_id = (SELECT block_id FROM public.users WHERE id = auth.uid())) OR
            (public.get_user_role(auth.uid()) = 'PHC_STAFF' AND phc_id = (SELECT phc_id FROM public.users WHERE id = auth.uid()))
        ) AND (soft_delete = FALSE OR public.is_admin())
    );
CREATE POLICY "Users update self or admin manage" ON public.users FOR UPDATE 
    USING (
        (id = auth.uid() OR public.has_permission(auth.uid(), 'users:write')) AND 
        (soft_delete = FALSE OR public.is_admin())
    );

-- 8. Settings Policies
CREATE POLICY "Settings read" ON public.settings FOR SELECT USING (public.has_permission(auth.uid(), 'settings:read') AND (soft_delete = FALSE OR public.is_admin()));
CREATE POLICY "Settings write" ON public.settings FOR ALL USING (public.has_permission(auth.uid(), 'settings:write') AND (soft_delete = FALSE OR public.is_admin()));

-- 9. Audit and Activity Logs Policies
CREATE POLICY "Audit logs select" ON public.audit_logs FOR SELECT USING (public.has_permission(auth.uid(), 'audit:read'));
CREATE POLICY "Activity logs select" ON public.activity_logs FOR SELECT USING (public.has_permission(auth.uid(), 'audit:read') OR user_id = auth.uid());

-- 10. Notifications Policies
CREATE POLICY "Notifications self manage" ON public.notifications FOR ALL USING (user_id = auth.uid() AND (soft_delete = FALSE OR public.is_admin()));

-- 11. Uploaded Documents Policies
CREATE POLICY "Uploaded documents select" ON public.uploaded_documents FOR SELECT 
    USING (
        public.has_permission(auth.uid(), 'uploaded_documents:read') AND 
        (phc_id IS NULL OR public.check_phc_scope(auth.uid(), phc_id)) AND 
        (soft_delete = FALSE OR public.is_admin())
    );
CREATE POLICY "Uploaded documents write" ON public.uploaded_documents FOR ALL 
    USING (
        public.has_permission(auth.uid(), 'uploaded_documents:write') AND 
        (phc_id IS NULL OR public.check_phc_scope(auth.uid(), phc_id)) AND 
        (soft_delete = FALSE OR public.is_admin())
    );

-- 12. Rate Limits Policy
CREATE POLICY "Rate limits self insert/update" ON public.rate_limits FOR ALL USING (TRUE);

-- 13. Doctors & Attendance Policies
CREATE POLICY "Doctors select" ON public.doctors FOR SELECT 
    USING (public.has_permission(auth.uid(), 'doctors:read') AND public.check_phc_scope(auth.uid(), phc_id) AND (soft_delete = FALSE OR public.is_admin()));
CREATE POLICY "Doctors write" ON public.doctors FOR ALL 
    USING (public.has_permission(auth.uid(), 'doctors:write') AND public.check_phc_scope(auth.uid(), phc_id) AND (soft_delete = FALSE OR public.is_admin()));

CREATE POLICY "Attendance select" ON public.doctor_attendance FOR SELECT 
    USING (public.has_permission(auth.uid(), 'attendance:read') AND doctor_id IN (SELECT id FROM public.doctors WHERE public.check_phc_scope(auth.uid(), phc_id)) AND (soft_delete = FALSE OR public.is_admin()));
CREATE POLICY "Attendance write" ON public.doctor_attendance FOR ALL 
    USING (public.has_permission(auth.uid(), 'attendance:write') AND doctor_id IN (SELECT id FROM public.doctors WHERE public.check_phc_scope(auth.uid(), phc_id)) AND (soft_delete = FALSE OR public.is_admin()));

-- 14. Patients & Visits Policies
CREATE POLICY "Patients select" ON public.patients FOR SELECT 
    USING (public.has_permission(auth.uid(), 'patients:read') AND (soft_delete = FALSE OR public.is_admin()));
CREATE POLICY "Patients write" ON public.patients FOR ALL 
    USING (public.has_permission(auth.uid(), 'patients:write') AND (soft_delete = FALSE OR public.is_admin()));

CREATE POLICY "Visits select" ON public.patient_visits FOR SELECT 
    USING (public.has_permission(auth.uid(), 'visits:read') AND public.check_phc_scope(auth.uid(), phc_id) AND (soft_delete = FALSE OR public.is_admin()));
CREATE POLICY "Visits write" ON public.patient_visits FOR ALL 
    USING (public.has_permission(auth.uid(), 'visits:write') AND public.check_phc_scope(auth.uid(), phc_id) AND (soft_delete = FALSE OR public.is_admin()));

-- 15. Medicine Master and Stock Policies
CREATE POLICY "Medicine master read" ON public.medicine_master FOR SELECT USING (public.has_permission(auth.uid(), 'medicine:read'));
CREATE POLICY "Medicine master write" ON public.medicine_master FOR ALL USING (public.is_admin());

CREATE POLICY "Medicine stock select" ON public.medicine_stock FOR SELECT 
    USING (public.has_permission(auth.uid(), 'medicine:read') AND public.check_phc_scope(auth.uid(), phc_id) AND (soft_delete = FALSE OR public.is_admin()));
CREATE POLICY "Medicine stock write" ON public.medicine_stock FOR ALL 
    USING (public.has_permission(auth.uid(), 'medicine:write') AND public.check_phc_scope(auth.uid(), phc_id) AND (soft_delete = FALSE OR public.is_admin()));

CREATE POLICY "Medicine stock history select" ON public.medicine_stock_history FOR SELECT 
    USING (public.has_permission(auth.uid(), 'medicine:read') AND public.check_phc_scope(auth.uid(), phc_id) AND (soft_delete = FALSE OR public.is_admin()));

-- 16. Medicine Requests and Transfers Policies
CREATE POLICY "Medicine requests select" ON public.medicine_requests FOR SELECT 
    USING (public.has_permission(auth.uid(), 'transfers:read') AND public.check_phc_scope(auth.uid(), requesting_phc_id));
CREATE POLICY "Medicine requests write" ON public.medicine_requests FOR ALL 
    USING (public.has_permission(auth.uid(), 'transfers:write') AND public.check_phc_scope(auth.uid(), requesting_phc_id));

CREATE POLICY "Medicine transfers select" ON public.medicine_transfers FOR SELECT 
    USING (public.has_permission(auth.uid(), 'transfers:read') AND (public.check_phc_scope(auth.uid(), source_phc_id) OR public.check_phc_scope(auth.uid(), target_phc_id)));
CREATE POLICY "Medicine transfers write" ON public.medicine_transfers FOR ALL 
    USING (public.has_permission(auth.uid(), 'transfers:write') AND (public.check_phc_scope(auth.uid(), source_phc_id) OR public.check_phc_scope(auth.uid(), target_phc_id)));

-- 17. Resource Requests and Allocations Policies
CREATE POLICY "Resource requests select" ON public.resource_requests FOR SELECT 
    USING (public.has_permission(auth.uid(), 'transfers:read') AND public.check_phc_scope(auth.uid(), phc_id));
CREATE POLICY "Resource requests write" ON public.resource_requests FOR ALL 
    USING (public.has_permission(auth.uid(), 'transfers:write') AND public.check_phc_scope(auth.uid(), phc_id));

CREATE POLICY "Resource allocations select" ON public.resource_allocations FOR SELECT 
    USING (public.has_permission(auth.uid(), 'transfers:read') AND (public.check_phc_scope(auth.uid(), source_phc_id) OR public.check_phc_scope(auth.uid(), target_phc_id)));
CREATE POLICY "Resource allocations write" ON public.resource_allocations FOR ALL 
    USING (public.has_permission(auth.uid(), 'transfers:write') AND (public.check_phc_scope(auth.uid(), source_phc_id) OR public.check_phc_scope(auth.uid(), target_phc_id)));

-- 18. Disease Cases & Predictions Policies
CREATE POLICY "Disease cases select" ON public.disease_cases FOR SELECT 
    USING (public.has_permission(auth.uid(), 'dashboard:read') AND public.check_phc_scope(auth.uid(), phc_id));
CREATE POLICY "Disease cases write" ON public.disease_cases FOR ALL 
    USING (public.has_permission(auth.uid(), 'dashboard:read') AND public.check_phc_scope(auth.uid(), phc_id));

CREATE POLICY "Disease predictions select" ON public.disease_predictions FOR SELECT 
    USING (public.has_permission(auth.uid(), 'dashboard:read') AND public.check_phc_scope(auth.uid(), phc_id));

-- 19. Dashboard Metrics Policies
CREATE POLICY "Dashboard metrics select" ON public.dashboard_metrics FOR SELECT 
    USING (public.has_permission(auth.uid(), 'dashboard:read') AND (phc_id IS NULL OR public.check_phc_scope(auth.uid(), phc_id)));

-- 20. Chat History Policies
CREATE POLICY "Chat history self manage" ON public.chat_history FOR ALL USING (user_id = auth.uid() AND (soft_delete = FALSE OR public.is_admin()));

-- 21. AI Recommendations & Missions Policies
CREATE POLICY "AI recommendations select" ON public.ai_recommendations FOR SELECT 
    USING (public.has_permission(auth.uid(), 'dashboard:read') AND (public.check_phc_scope(auth.uid(), source_phc_id) OR public.check_phc_scope(auth.uid(), target_phc_id)));

CREATE POLICY "Missions select" ON public.missions FOR SELECT 
    USING (public.has_permission(auth.uid(), 'transfers:read'));
CREATE POLICY "Missions write" ON public.missions FOR ALL 
    USING (public.has_permission(auth.uid(), 'transfers:write'));

CREATE POLICY "Approvals select" ON public.approvals FOR SELECT 
    USING (public.has_permission(auth.uid(), 'transfers:read'));
CREATE POLICY "Approvals write" ON public.approvals FOR ALL 
    USING (public.has_permission(auth.uid(), 'transfers:write'));

-- 22. Reports Policies
CREATE POLICY "Reports select" ON public.reports FOR SELECT 
    USING (public.has_permission(auth.uid(), 'reports:read') AND (soft_delete = FALSE OR public.is_admin()));
CREATE POLICY "Reports write" ON public.reports FOR ALL 
    USING (public.has_permission(auth.uid(), 'reports:write') AND (soft_delete = FALSE OR public.is_admin()));
