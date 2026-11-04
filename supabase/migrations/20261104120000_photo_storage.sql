/*
  # Photo uploads

  Creates a public Storage bucket, "site-images", so staff can upload photos in the admin
  instead of pasting links.

  1. Bucket: public (anyone can view a photo by its address), 10 MB limit, images only.
  2. Policies on storage.objects, limited to this bucket:
     - anyone can read
     - signed-in staff can add, replace, and delete
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('site-images', 'site-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE
  SET public = true, file_size_limit = 10485760, allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

DROP POLICY IF EXISTS "site_images_public_read" ON storage.objects;
CREATE POLICY "site_images_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'site-images');

DROP POLICY IF EXISTS "site_images_staff_insert" ON storage.objects;
CREATE POLICY "site_images_staff_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-images');

DROP POLICY IF EXISTS "site_images_staff_update" ON storage.objects;
CREATE POLICY "site_images_staff_update" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'site-images') WITH CHECK (bucket_id = 'site-images');

DROP POLICY IF EXISTS "site_images_staff_delete" ON storage.objects;
CREATE POLICY "site_images_staff_delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'site-images');
