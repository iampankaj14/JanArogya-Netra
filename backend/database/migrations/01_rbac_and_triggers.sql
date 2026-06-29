-- 01_rbac_and_triggers.sql
-- Role Based Access Control and Mirroring triggers

-- -----------------------------------------------------
-- Supabase auth.users public.users Mirror Trigger
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role_id UUID;
    meta_role VARCHAR;
    meta_role_id UUID;
BEGIN
    -- Extract role string from raw user metadata (if available)
    meta_role := NEW.raw_user_meta_data->>'role';

    -- Resolve role_id from name or use default VIEWER
    IF meta_role IS NOT NULL THEN
        SELECT id INTO meta_role_id FROM public.roles WHERE name = UPPER(meta_role);
    END IF;

    IF meta_role_id IS NULL THEN
        SELECT id INTO default_role_id FROM public.roles WHERE name = 'VIEWER';
        meta_role_id := default_role_id;
    END IF;

    -- Insert new user record mirror
    INSERT INTO public.users (
        id,
        email,
        name,
        role_id,
        district_id,
        block_id,
        phc_id,
        sub_center_id,
        village_id,
        avatar_url,
        created_at,
        updated_at,
        status,
        soft_delete
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', 'Healthcare User'),
        meta_role_id,
        (NEW.raw_user_meta_data->>'district_id')::UUID,
        (NEW.raw_user_meta_data->>'block_id')::UUID,
        (NEW.raw_user_meta_data->>'phc_id')::UUID,
        (NEW.raw_user_meta_data->>'sub_center_id')::UUID,
        (NEW.raw_user_meta_data->>'village_id')::UUID,
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.created_at,
        NEW.created_at,
        'ACTIVE',
        FALSE
    );
    RETURN NEW;
END;
$$ language plpgsql security definer;

-- Trigger on auth user insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------
-- Supabase auth.users public.users Sync Updates
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
DECLARE
    meta_role VARCHAR;
    meta_role_id UUID;
BEGIN
    meta_role := NEW.raw_user_meta_data->>'role';
    IF meta_role IS NOT NULL THEN
        SELECT id INTO meta_role_id FROM public.roles WHERE name = UPPER(meta_role);
    END IF;

    UPDATE public.users
    SET 
        email = NEW.email,
        name = COALESCE(NEW.raw_user_meta_data->>'name', name),
        avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', avatar_url),
        role_id = COALESCE(meta_role_id, role_id),
        district_id = CASE WHEN NEW.raw_user_meta_data? 'district_id' THEN (NEW.raw_user_meta_data->>'district_id')::UUID ELSE district_id END,
        block_id = CASE WHEN NEW.raw_user_meta_data? 'block_id' THEN (NEW.raw_user_meta_data->>'block_id')::UUID ELSE block_id END,
        phc_id = CASE WHEN NEW.raw_user_meta_data? 'phc_id' THEN (NEW.raw_user_meta_data->>'phc_id')::UUID ELSE phc_id END,
        sub_center_id = CASE WHEN NEW.raw_user_meta_data? 'sub_center_id' THEN (NEW.raw_user_meta_data->>'sub_center_id')::UUID ELSE sub_center_id END,
        village_id = CASE WHEN NEW.raw_user_meta_data? 'village_id' THEN (NEW.raw_user_meta_data->>'village_id')::UUID ELSE village_id END
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ language plpgsql security definer;

-- Trigger on auth user update
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- -----------------------------------------------------
-- Helper function to check role in RLS Policies
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS VARCHAR AS $$
DECLARE
    role_name VARCHAR;
BEGIN
    SELECT r.name INTO role_name
    FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = user_uuid AND u.soft_delete = FALSE;
    RETURN role_name;
END;
$$ language plpgsql security definer;

-- -----------------------------------------------------
-- Helper function to check permissions dynamically (RBAC)
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_permission(user_uuid UUID, perm_name VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    has_perm BOOLEAN;
BEGIN
    -- Super Admins bypass permission checks
    IF public.get_user_role(user_uuid) = 'SUPER_ADMIN' THEN
        RETURN TRUE;
    END IF;

    SELECT EXISTS (
        SELECT 1
        FROM public.users u
        JOIN public.role_permissions rp ON u.role_id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE u.id = user_uuid 
          AND p.name = perm_name 
          AND p.status = 'ACTIVE' 
          AND p.soft_delete = FALSE
          AND rp.status = 'ACTIVE'
          AND rp.soft_delete = FALSE
          AND u.status = 'ACTIVE'
          AND u.soft_delete = FALSE
    ) INTO has_perm;
    
    RETURN has_perm;
END;
$$ language plpgsql security definer;
