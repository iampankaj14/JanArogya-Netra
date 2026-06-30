-- 00_init_schema.sql
-- JanArogya Netra Database Schema (Complete Backend Foundation)

-- Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------
-- Helper Functions for Triggers
-- -----------------------------------------------------

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Set record audit fields created_by and updated_by using auth context
CREATE OR REPLACE FUNCTION set_record_audit_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.created_by IS NULL AND auth.uid() IS NOT NULL THEN
            NEW.created_by = auth.uid();
        END IF;
        IF NEW.updated_by IS NULL AND auth.uid() IS NOT NULL THEN
            NEW.updated_by = auth.uid();
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF auth.uid() IS NOT NULL THEN
            NEW.updated_by = auth.uid();
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- -----------------------------------------------------
-- Core Tables: Administrative Hierarchy & Roles
-- -----------------------------------------------------

-- 1. Roles
CREATE TABLE public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID,
    updated_by UUID,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT chk_roles_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'))
);

-- 2. Districts
CREATE TABLE public.districts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID,
    updated_by UUID,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT chk_districts_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'))
);

-- 3. Blocks
CREATE TABLE public.blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    district_id UUID REFERENCES public.districts(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID,
    updated_by UUID,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT chk_blocks_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'))
);

-- 4. Primary Health Centers (PHCs)
CREATE TABLE public.phcs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    block_id UUID REFERENCES public.blocks(id) ON DELETE CASCADE NOT NULL,
    health_score INT DEFAULT 100 NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    beds_total INT DEFAULT 0 NOT NULL,
    beds_occupied INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID,
    updated_by UUID,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT chk_phcs_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    CONSTRAINT chk_phcs_health_score CHECK (health_score BETWEEN 0 AND 100),
    CONSTRAINT chk_phcs_beds CHECK (beds_occupied <= beds_total),
    CONSTRAINT chk_phcs_beds_total CHECK (beds_total >= 0),
    CONSTRAINT chk_phcs_beds_occupied CHECK (beds_occupied >= 0),
    CONSTRAINT chk_phcs_lat CHECK (latitude BETWEEN -90.000000 AND 90.000000),
    CONSTRAINT chk_phcs_lng CHECK (longitude BETWEEN -180.000000 AND 180.000000)
);

-- 5. Sub Centers
CREATE TABLE public.sub_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phc_id UUID REFERENCES public.phcs(id) ON DELETE CASCADE NOT NULL,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID,
    updated_by UUID,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT chk_sub_centers_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    CONSTRAINT chk_sub_centers_lat CHECK (latitude IS NULL OR (latitude BETWEEN -90.000000 AND 90.000000)),
    CONSTRAINT chk_sub_centers_lng CHECK (longitude IS NULL OR (longitude BETWEEN -180.000000 AND 180.000000))
);

-- 6. Villages
CREATE TABLE public.villages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    sub_center_id UUID REFERENCES public.sub_centers(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID,
    updated_by UUID,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT chk_villages_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'))
);

-- 7. Users (Supabase auth.users mirror)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role_id UUID REFERENCES public.roles(id) NOT NULL,
    district_id UUID REFERENCES public.districts(id) ON DELETE SET NULL,
    block_id UUID REFERENCES public.blocks(id) ON DELETE SET NULL,
    phc_id UUID REFERENCES public.phcs(id) ON DELETE SET NULL,
    sub_center_id UUID REFERENCES public.sub_centers(id) ON DELETE SET NULL,
    village_id UUID REFERENCES public.villages(id) ON DELETE SET NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT chk_users_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED')),
    CONSTRAINT chk_users_email CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$')
);

-- Add foreign keys for created_by and updated_by on the pre-user tables
ALTER TABLE public.roles ADD CONSTRAINT fk_roles_created_by FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.roles ADD CONSTRAINT fk_roles_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.districts ADD CONSTRAINT fk_districts_created_by FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.districts ADD CONSTRAINT fk_districts_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.blocks ADD CONSTRAINT fk_blocks_created_by FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.blocks ADD CONSTRAINT fk_blocks_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.phcs ADD CONSTRAINT fk_phcs_created_by FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.phcs ADD CONSTRAINT fk_phcs_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.sub_centers ADD CONSTRAINT fk_sub_centers_created_by FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.sub_centers ADD CONSTRAINT fk_sub_centers_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.villages ADD CONSTRAINT fk_villages_created_by FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.villages ADD CONSTRAINT fk_villages_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- 8. Permissions
CREATE TABLE public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT chk_permissions_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- Join table: Role Permissions (RBAC implementation)
CREATE TABLE public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT uniq_role_permission UNIQUE (role_id, permission_id),
    CONSTRAINT chk_rp_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- 9. Settings
CREATE TABLE public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT chk_settings_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- 10. Audit Logs
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL
);

-- 11. Activity Logs
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL
);

-- 12. Notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT chk_notifications_type CHECK (type IN ('CRITICAL', 'WARNING', 'INFO', 'APPROVAL')),
    CONSTRAINT chk_notifications_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- 13. Uploaded Documents
CREATE TABLE public.uploaded_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    phc_id UUID REFERENCES public.phcs(id) ON DELETE CASCADE,
    sub_center_id UUID REFERENCES public.sub_centers(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT chk_docs_file_url CHECK (file_url ~* '^https?://[^\s]+$'),
    CONSTRAINT chk_docs_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- 14. Rate Limits Table
CREATE TABLE public.rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address VARCHAR(45) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    request_count INT DEFAULT 1 NOT NULL,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL
);

-- -----------------------------------------------------
-- Operational Tables: Clinical Operations & Inventory
-- -----------------------------------------------------

-- 15. Doctors
CREATE TABLE public.doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255),
    phc_id UUID REFERENCES public.phcs(id) ON DELETE CASCADE NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT chk_doctors_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    CONSTRAINT chk_doctors_email CHECK (email IS NULL OR (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$')),
    CONSTRAINT chk_doctors_phone CHECK (phone IS NULL OR (phone ~ '^\+?[0-9]{10,15}$'))
);

-- 16. Doctor Attendance
CREATE TABLE public.doctor_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    present BOOLEAN DEFAULT TRUE NOT NULL,
    time_in TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT uniq_doctor_date UNIQUE (doctor_id, date),
    CONSTRAINT chk_attendance_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- 17. Patients
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(10) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT chk_patients_age CHECK (age BETWEEN 0 AND 150),
    CONSTRAINT chk_patients_gender CHECK (gender IN ('Male', 'Female', 'Other')),
    CONSTRAINT chk_patients_phone CHECK (phone IS NULL OR (phone ~ '^\+?[0-9]{10,15}$')),
    CONSTRAINT chk_patients_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- 18. Patient Visits
CREATE TABLE public.patient_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    phc_id UUID REFERENCES public.phcs(id) ON DELETE CASCADE NOT NULL,
    visit_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    symptoms TEXT,
    diagnosis TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT chk_visits_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- 19. Medicine Master
CREATE TABLE public.medicine_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(100) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT chk_med_master_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- 20. Medicine Stock
CREATE TABLE public.medicine_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phc_id UUID REFERENCES public.phcs(id) ON DELETE CASCADE NOT NULL,
    medicine_id UUID REFERENCES public.medicine_master(id) ON DELETE CASCADE NOT NULL,
    current_stock INT DEFAULT 0 NOT NULL,
    min_required_stock INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT uniq_phc_medicine UNIQUE (phc_id, medicine_id),
    CONSTRAINT chk_stock_current CHECK (current_stock >= 0),
    CONSTRAINT chk_stock_min CHECK (min_required_stock >= 0),
    CONSTRAINT chk_stock_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- 21. Medicine Stock History
CREATE TABLE public.medicine_stock_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phc_id UUID REFERENCES public.phcs(id) ON DELETE CASCADE NOT NULL,
    medicine_id UUID REFERENCES public.medicine_master(id) ON DELETE CASCADE NOT NULL,
    quantity_changed INT NOT NULL,
    change_type VARCHAR(50) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT chk_history_change_type CHECK (change_type IN ('INWARD', 'OUTWARD', 'TRANSFER', 'CORRECTION')),
    CONSTRAINT chk_history_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- 22. Medicine Requests
CREATE TABLE public.medicine_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requesting_phc_id UUID REFERENCES public.phcs(id) ON DELETE CASCADE NOT NULL,
    medicine_id UUID REFERENCES public.medicine_master(id) ON DELETE CASCADE NOT NULL,
    quantity INT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT chk_med_req_quantity CHECK (quantity > 0),
    CONSTRAINT chk_med_req_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'))
);

-- 23. Medicine Transfers
CREATE TABLE public.medicine_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_phc_id UUID REFERENCES public.phcs(id) ON DELETE CASCADE NOT NULL,
    target_phc_id UUID REFERENCES public.phcs(id) ON DELETE CASCADE NOT NULL,
    medicine_id UUID REFERENCES public.medicine_master(id) ON DELETE CASCADE NOT NULL,
    quantity INT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT chk_transfers_qty CHECK (quantity > 0),
    CONSTRAINT chk_transfers_status CHECK (status IN ('PENDING', 'EN_ROUTE', 'DELIVERED', 'CANCELLED'))
);

-- 24. Resource Requests
CREATE TABLE public.resource_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phc_id UUID REFERENCES public.phcs(id) ON DELETE CASCADE NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT chk_resource_type CHECK (resource_type IN ('BEDS', 'STAFF', 'EQUIPMENT')),
    CONSTRAINT chk_resource_req_qty CHECK (quantity > 0),
    CONSTRAINT chk_resource_req_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'))
);

-- 25. Resource Allocations
CREATE TABLE public.resource_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES public.resource_requests(id) ON DELETE CASCADE NOT NULL,
    source_phc_id UUID REFERENCES public.phcs(id) ON DELETE SET NULL,
    target_phc_id UUID REFERENCES public.phcs(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(50) DEFAULT 'ALLOCATED' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT chk_allocations_status CHECK (status IN ('ALLOCATED', 'COMPLETED', 'RELEASED'))
);

-- 26. Disease Cases
CREATE TABLE public.disease_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phc_id UUID REFERENCES public.phcs(id) ON DELETE CASCADE NOT NULL,
    disease_name VARCHAR(255) NOT NULL,
    case_count INT DEFAULT 0 NOT NULL,
    report_date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT chk_cases_count CHECK (case_count >= 0),
    CONSTRAINT chk_cases_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- 27. Disease Predictions
CREATE TABLE public.disease_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phc_id UUID REFERENCES public.phcs(id) ON DELETE CASCADE NOT NULL,
    disease_name VARCHAR(255) NOT NULL,
    probability DECIMAL(5,2) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    predicted_outbreak_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT chk_pred_probability CHECK (probability BETWEEN 0.00 AND 100.00),
    CONSTRAINT chk_pred_severity CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CONSTRAINT chk_pred_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- 28. Dashboard Metrics
CREATE TABLE public.dashboard_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_id UUID REFERENCES public.districts(id) ON DELETE CASCADE,
    phc_id UUID REFERENCES public.phcs(id) ON DELETE CASCADE,
    metric_name VARCHAR(255) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL
);

-- 29. Chat History
CREATE TABLE public.chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT chk_chat_role CHECK (role IN ('user', 'model')),
    CONSTRAINT chk_chat_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- 30. AI Recommendations
CREATE TABLE public.ai_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    source_phc_id UUID REFERENCES public.phcs(id) ON DELETE CASCADE NOT NULL,
    target_phc_id UUID REFERENCES public.phcs(id) ON DELETE CASCADE NOT NULL,
    medicine_id UUID REFERENCES public.medicine_master(id) ON DELETE CASCADE NOT NULL,
    quantity INT NOT NULL,
    confidence DECIMAL(5,2) NOT NULL,
    reasoning TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT chk_recommend_qty CHECK (quantity > 0),
    CONSTRAINT chk_recommend_conf CHECK (confidence BETWEEN 0.00 AND 100.00),
    CONSTRAINT chk_recommend_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- 31. Missions
CREATE TABLE public.missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    recommendation_id UUID REFERENCES public.ai_recommendations(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT chk_missions_status CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'))
);

-- 32. Approvals
CREATE TABLE public.approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT chk_approvals_entity_type CHECK (entity_type IN ('MISSION', 'MEDICINE_REQUEST', 'RESOURCE_REQUEST')),
    CONSTRAINT chk_approvals_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

-- 33. Reports (Summary / Audits metadata references)
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    pdf_url TEXT NOT NULL,
    generated_by UUID REFERENCES public.users(id) NOT NULL,
    summary_metrics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT chk_reports_pdf_url CHECK (pdf_url ~* '^https?://[^\s]+$'),
    CONSTRAINT chk_reports_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- -----------------------------------------------------
-- Performance and Search Indexes
-- -----------------------------------------------------

CREATE INDEX idx_blocks_district ON public.blocks(district_id);
CREATE INDEX idx_phcs_block ON public.phcs(block_id);
CREATE INDEX idx_phcs_health_score ON public.phcs(health_score);
CREATE INDEX idx_sub_centers_phc ON public.sub_centers(phc_id);
CREATE INDEX idx_villages_sub_center ON public.villages(sub_center_id);

CREATE INDEX idx_users_role ON public.users(role_id);
CREATE INDEX idx_users_district ON public.users(district_id);
CREATE INDEX idx_users_block ON public.users(block_id);
CREATE INDEX idx_users_phc ON public.users(phc_id);

CREATE INDEX idx_rp_role ON public.role_permissions(role_id);
CREATE INDEX idx_rp_permission ON public.role_permissions(permission_id);

CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);
CREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, read);
CREATE INDEX idx_uploaded_docs_phc ON public.uploaded_documents(phc_id);

CREATE INDEX idx_doctors_phc ON public.doctors(phc_id);
CREATE INDEX idx_attendance_doctor_date ON public.doctor_attendance(doctor_id, date);
CREATE INDEX idx_visits_patient ON public.patient_visits(patient_id);
CREATE INDEX idx_visits_phc ON public.patient_visits(phc_id);
CREATE INDEX idx_visits_date ON public.patient_visits(visit_date);

CREATE INDEX idx_stock_phc_medicine ON public.medicine_stock(phc_id, medicine_id);
CREATE INDEX idx_requests_phc ON public.medicine_requests(requesting_phc_id);
CREATE INDEX idx_transfers_source ON public.medicine_transfers(source_phc_id);
CREATE INDEX idx_transfers_target ON public.medicine_transfers(target_phc_id);

CREATE INDEX idx_disease_phc ON public.disease_cases(phc_id);
CREATE INDEX idx_disease_name_date ON public.disease_cases(disease_name, report_date);
CREATE INDEX idx_metrics_recorded ON public.dashboard_metrics(recorded_at);
CREATE INDEX idx_chat_session ON public.chat_history(user_id, session_id);
CREATE INDEX idx_rate_limits_ip_endpoint ON public.rate_limits(ip_address, endpoint);

-- -----------------------------------------------------
-- Triggers for Audit Fields & Updated At (Apply to All Tables)
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
        EXECUTE format('
            CREATE TRIGGER update_%I_updated_at
            BEFORE UPDATE ON public.%I
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ', t, t);
        
        EXECUTE format('
            CREATE TRIGGER set_%I_audit_fields
            BEFORE INSERT OR UPDATE ON public.%I
            FOR EACH ROW EXECUTE FUNCTION set_record_audit_fields();
        ', t, t);
    END LOOP;
END;
$$;

-- -----------------------------------------------------
-- Database-Level Symmetric Encryption & Rate Limiting Helpers
-- -----------------------------------------------------

-- Symmetric Encryption
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(plain_text TEXT, secret_key TEXT)
RETURNS BYTEA AS $$
BEGIN
    RETURN pgp_sym_encrypt(plain_text, secret_key);
END;
$$ language plpgsql security definer;

-- Symmetric Decryption
CREATE OR REPLACE FUNCTION public.decrypt_sensitive_data(encrypted_data BYTEA, secret_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(encrypted_data, secret_key);
END;
$$ language plpgsql security definer;

-- Rate Limiting Checker
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    client_ip TEXT, 
    rate_endpoint TEXT, 
    max_requests INT, 
    window_seconds INT
)
RETURNS BOOLEAN AS $$
DECLARE
    current_count INT;
    window_limit TIMESTAMP WITH TIME ZONE;
BEGIN
    window_limit := timezone('utc'::text, now()) - (window_seconds || ' seconds')::INTERVAL;
    
    -- Clean up rate limits older than the window
    DELETE FROM public.rate_limits WHERE window_start < window_limit;
    
    -- Check requests count
    SELECT request_count INTO current_count 
    FROM public.rate_limits 
    WHERE ip_address = client_ip AND endpoint = rate_endpoint;
    
    IF current_count IS NULL THEN
        INSERT INTO public.rate_limits (ip_address, endpoint, request_count, window_start)
        VALUES (client_ip, rate_endpoint, 1, timezone('utc'::text, now()));
        RETURN TRUE;
    ELSIF current_count >= max_requests THEN
        RETURN FALSE;
    ELSE
        UPDATE public.rate_limits 
        SET request_count = request_count + 1 
        WHERE ip_address = client_ip AND endpoint = rate_endpoint;
        RETURN TRUE;
    END IF;
END;
$$ language plpgsql security definer;

-- -----------------------------------------------------
-- Views & Materialized Views
-- -----------------------------------------------------

-- View: Joined User Profiles
CREATE OR REPLACE VIEW public.v_user_profiles AS
SELECT 
    u.id,
    u.email,
    u.name AS user_name,
    r.name AS role_name,
    d.name AS district_name,
    b.name AS block_name,
    p.name AS phc_name,
    s.name AS sub_center_name,
    v.name AS village_name,
    u.avatar_url,
    u.created_at,
    u.updated_at,
    u.status,
    u.soft_delete
FROM public.users u
JOIN public.roles r ON u.role_id = r.id
LEFT JOIN public.districts d ON u.district_id = d.id
LEFT JOIN public.blocks b ON u.block_id = b.id
LEFT JOIN public.phcs p ON u.phc_id = p.id
LEFT JOIN public.sub_centers s ON u.sub_center_id = s.id
LEFT JOIN public.villages v ON u.village_id = v.id;

-- View: Active/Unread Notifications
CREATE OR REPLACE VIEW public.v_active_notifications AS
SELECT * 
FROM public.notifications 
WHERE read = FALSE AND soft_delete = FALSE AND status = 'ACTIVE';

-- View: Active Medicine Stock Shortages
CREATE OR REPLACE VIEW public.v_medicine_shortages AS
SELECT 
    s.id AS stock_id,
    p.id AS phc_id,
    p.name AS phc_name,
    m.id AS medicine_id,
    m.name AS medicine_name,
    m.type AS medicine_type,
    s.current_stock,
    s.min_required_stock,
    (s.min_required_stock - s.current_stock) AS shortage_qty,
    s.status,
    s.soft_delete
FROM public.medicine_stock s
JOIN public.phcs p ON s.phc_id = p.id
JOIN public.medicine_master m ON s.medicine_id = m.id
WHERE s.current_stock < s.min_required_stock AND s.soft_delete = FALSE;

-- Materialized View: Regional Epidemiology Summary
CREATE MATERIALIZED VIEW public.mv_district_epidemiology_summary AS
SELECT 
    d.id AS district_id,
    d.name AS district_name,
    dc.disease_name,
    SUM(dc.case_count) AS total_cases,
    DATE_TRUNC('month', dc.report_date) AS report_month,
    timezone('utc'::text, now()) AS last_refreshed_at
FROM public.disease_cases dc
JOIN public.phcs p ON dc.phc_id = p.id
JOIN public.blocks b ON p.block_id = b.id
JOIN public.districts d ON b.district_id = d.id
WHERE dc.soft_delete = FALSE AND dc.status = 'ACTIVE'
GROUP BY d.id, d.name, dc.disease_name, DATE_TRUNC('month', dc.report_date);

CREATE UNIQUE INDEX idx_mv_district_epidem_uniq ON public.mv_district_epidemiology_summary(district_id, disease_name, report_month);

-- Materialized View: PHC Performance Index
CREATE MATERIALIZED VIEW public.mv_phc_health_index AS
SELECT 
    p.id AS phc_id,
    p.name AS phc_name,
    p.health_score AS database_health_score,
    COUNT(DISTINCT doc.id) AS total_doctors,
    COUNT(DISTINCT att.id) FILTER (WHERE att.present = TRUE) AS active_doctors_today,
    COUNT(DISTINCT shortage.stock_id) AS stock_shortages,
    timezone('utc'::text, now()) AS last_refreshed_at
FROM public.phcs p
LEFT JOIN public.doctors doc ON doc.phc_id = p.id AND doc.soft_delete = FALSE
LEFT JOIN public.doctor_attendance att ON att.doctor_id = doc.id AND att.date = CURRENT_DATE AND att.soft_delete = FALSE
LEFT JOIN (
    SELECT id AS stock_id, phc_id 
    FROM public.medicine_stock 
    WHERE current_stock < min_required_stock AND soft_delete = FALSE
) shortage ON shortage.phc_id = p.id
WHERE p.soft_delete = FALSE
GROUP BY p.id, p.name, p.health_score;

CREATE UNIQUE INDEX idx_mv_phc_health_uniq ON public.mv_phc_health_index(phc_id);

-- Concurrent Refresher Function
CREATE OR REPLACE FUNCTION public.refresh_health_dashboard()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_district_epidemiology_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_phc_health_index;
END;
$$ language plpgsql security definer;

-- -----------------------------------------------------
-- Initial RBAC Seed Data
-- -----------------------------------------------------

-- Seed Core Roles
INSERT INTO public.roles (name, description) VALUES
('SUPER_ADMIN', 'System wide administrative controls and security configuration'),
('DHO', 'District Health Officer with district-wide management permissions'),
('BMO', 'Block Medical Officer with block-wide clinical and transfer oversight'),
('PHC_STAFF', 'Primary Health Center operator responsible for attendance, visits, and stock'),
('VIEWER', 'Read-only analyst with dashboard and reports access')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- Seed Basic Permissions
INSERT INTO public.permissions (name, description) VALUES
('districts:read', 'Can read districts information'),
('districts:write', 'Can create or edit districts'),
('blocks:read', 'Can read blocks'),
('blocks:write', 'Can create or edit blocks'),
('phcs:read', 'Can read PHC details'),
('phcs:write', 'Can modify PHC details'),
('sub_centers:read', 'Can read sub centers'),
('sub_centers:write', 'Can modify sub centers'),
('villages:read', 'Can read villages'),
('villages:write', 'Can modify villages'),
('users:read', 'Can view user accounts'),
('users:write', 'Can manage user accounts'),
('roles:read', 'Can view roles'),
('permissions:read', 'Can view permissions'),
('doctors:read', 'Can read doctors roster'),
('doctors:write', 'Can manage doctors roster'),
('attendance:read', 'Can view staff attendance logs'),
('attendance:write', 'Can record staff attendance'),
('patients:read', 'Can read patient registrations'),
('patients:write', 'Can create and modify patients'),
('visits:read', 'Can read patient clinical visits'),
('visits:write', 'Can create and modify patient visits'),
('medicine:read', 'Can view inventory stock levels'),
('medicine:write', 'Can modify inventory stock levels'),
('transfers:read', 'Can read stock transfers'),
('transfers:write', 'Can manage stock transfer requests'),
('reports:read', 'Can download compiled reports'),
('reports:write', 'Can generate new weekly summary reports'),
('dashboard:read', 'Can read analytical dashboard screens'),
('audit:read', 'Can view audit and security activity logs'),
('settings:read', 'Can read system settings'),
('settings:write', 'Can update global settings')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- Seed Role Permissions Mapping
DO $$
DECLARE
    admin_id UUID;
    dho_id UUID;
    bmo_id UUID;
    staff_id UUID;
    viewer_id UUID;
    perm RECORD;
BEGIN
    -- Resolve roles
    SELECT id INTO admin_id FROM public.roles WHERE name = 'SUPER_ADMIN';
    SELECT id INTO dho_id FROM public.roles WHERE name = 'DHO';
    SELECT id INTO bmo_id FROM public.roles WHERE name = 'BMO';
    SELECT id INTO staff_id FROM public.roles WHERE name = 'PHC_STAFF';
    SELECT id INTO viewer_id FROM public.roles WHERE name = 'VIEWER';

    -- 1. Super Admin: Maps to all active permissions
    FOR perm IN SELECT id FROM public.permissions LOOP
        INSERT INTO public.role_permissions (role_id, permission_id) 
        VALUES (admin_id, perm.id) ON CONFLICT DO NOTHING;
    END LOOP;

    -- 2. DHO: District Health Officer
    FOR perm IN 
        SELECT id FROM public.permissions 
        WHERE name IN (
            'districts:read', 'blocks:read', 'blocks:write', 'phcs:read', 'phcs:write',
            'sub_centers:read', 'sub_centers:write', 'villages:read', 'villages:write',
            'users:read', 'users:write', 'doctors:read', 'doctors:write', 'attendance:read',
            'patients:read', 'visits:read', 'medicine:read', 'medicine:write', 'transfers:read',
            'transfers:write', 'reports:read', 'reports:write', 'dashboard:read', 'audit:read',
            'settings:read'
        ) 
    LOOP
        INSERT INTO public.role_permissions (role_id, permission_id) 
        VALUES (dho_id, perm.id) ON CONFLICT DO NOTHING;
    END LOOP;

    -- 3. BMO: Block Medical Officer
    FOR perm IN 
        SELECT id FROM public.permissions 
        WHERE name IN (
            'blocks:read', 'phcs:read', 'phcs:write', 'sub_centers:read', 'sub_centers:write',
            'villages:read', 'villages:write', 'users:read', 'doctors:read', 'doctors:write',
            'attendance:read', 'patients:read', 'visits:read', 'medicine:read', 'transfers:read',
            'transfers:write', 'reports:read', 'dashboard:read'
        ) 
    LOOP
        INSERT INTO public.role_permissions (role_id, permission_id) 
        VALUES (bmo_id, perm.id) ON CONFLICT DO NOTHING;
    END LOOP;

    -- 4. PHC Staff
    FOR perm IN 
        SELECT id FROM public.permissions 
        WHERE name IN (
            'phcs:read', 'sub_centers:read', 'villages:read', 'doctors:read',
            'attendance:read', 'attendance:write', 'patients:read', 'patients:write',
            'visits:read', 'visits:write', 'medicine:read', 'medicine:write', 
            'transfers:read', 'reports:read', 'dashboard:read'
        ) 
    LOOP
        INSERT INTO public.role_permissions (role_id, permission_id) 
        VALUES (staff_id, perm.id) ON CONFLICT DO NOTHING;
    END LOOP;

    -- 5. Viewer
    FOR perm IN 
        SELECT id FROM public.permissions 
        WHERE name IN (
            'districts:read', 'blocks:read', 'phcs:read', 'sub_centers:read', 'villages:read',
            'dashboard:read', 'reports:read'
        ) 
    LOOP
        INSERT INTO public.role_permissions (role_id, permission_id) 
        VALUES (viewer_id, perm.id) ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$;
