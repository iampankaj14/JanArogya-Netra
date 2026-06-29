-- 03_storage_policies.sql
-- Declare Supabase Storage buckets and access policies for objects

-- -----------------------------------------------------
-- Initialize Private Buckets
-- -----------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('documents', 'documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('reports', 'reports', false, 15728640, ARRAY['application/pdf']),
  ('profile-images', 'profile-images', false, 5242880, ARRAY['image/jpeg', 'image/png']),
  ('medicine-images', 'medicine-images', false, 5242880, ARRAY['image/jpeg', 'image/png']),
  ('patient-documents', 'patient-documents', false, 20971520, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/x-panasonic-raw'])
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- -----------------------------------------------------
-- Drop Existing Storage Policies (Prevent Conflicts)
-- -----------------------------------------------------
DROP POLICY IF EXISTS "Public profiles images are readable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update or delete their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Public medicine stock images are readable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Admins and DHOs can manage medicine images" ON storage.objects;
DROP POLICY IF EXISTS "Reports are readable by authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Only Admins and DHOs can write reports" ON storage.objects;
DROP POLICY IF EXISTS "Documents are readable by authorized staff" ON storage.objects;
DROP POLICY IF EXISTS "Authorized PHC staff can upload documents" ON storage.objects;

DROP POLICY IF EXISTS "profile_images_select" ON storage.objects;
DROP POLICY IF EXISTS "profile_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "profile_images_update_delete" ON storage.objects;
DROP POLICY IF EXISTS "medicine_images_select" ON storage.objects;
DROP POLICY IF EXISTS "medicine_images_write" ON storage.objects;
DROP POLICY IF EXISTS "reports_select" ON storage.objects;
DROP POLICY IF EXISTS "reports_write" ON storage.objects;
DROP POLICY IF EXISTS "documents_select" ON storage.objects;
DROP POLICY IF EXISTS "documents_write" ON storage.objects;
DROP POLICY IF EXISTS "patient_documents_select" ON storage.objects;
DROP POLICY IF EXISTS "patient_documents_write" ON storage.objects;

-- -----------------------------------------------------
-- Bucket: profile-images Policies (Private)
-- -----------------------------------------------------
CREATE POLICY "profile_images_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-images' AND auth.role() = 'authenticated');

CREATE POLICY "profile_images_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-images' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "profile_images_update_delete"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'profile-images' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- -----------------------------------------------------
-- Bucket: medicine-images Policies (Private)
-- -----------------------------------------------------
CREATE POLICY "medicine_images_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'medicine-images' AND auth.role() = 'authenticated');

CREATE POLICY "medicine_images_write"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'medicine-images' AND
    (public.is_admin() OR public.has_permission(auth.uid(), 'medicine:write'))
  );

-- -----------------------------------------------------
-- Bucket: reports Policies (Private)
-- -----------------------------------------------------
CREATE POLICY "reports_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'reports' AND
    public.has_permission(auth.uid(), 'reports:read')
  );

CREATE POLICY "reports_write"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'reports' AND
    public.has_permission(auth.uid(), 'reports:write')
  );

-- -----------------------------------------------------
-- Bucket: documents Policies (Private)
-- -----------------------------------------------------
CREATE POLICY "documents_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents' AND
    public.has_permission(auth.uid(), 'uploaded_documents:read')
  );

CREATE POLICY "documents_write"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'documents' AND
    public.has_permission(auth.uid(), 'uploaded_documents:write')
  );

-- -----------------------------------------------------
-- Bucket: patient-documents Policies (Private)
-- -----------------------------------------------------
CREATE POLICY "patient_documents_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'patient-documents' AND
    public.has_permission(auth.uid(), 'patients:read')
  );

CREATE POLICY "patient_documents_write"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'patient-documents' AND
    public.has_permission(auth.uid(), 'patients:write')
  );
