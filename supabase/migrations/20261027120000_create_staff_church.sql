/*
# Staff and leaders

New table staff_church for the public Staff & Leaders page, managed in the admin.

Columns: name, role, bio (Markdown), photo_url, email, sort_order_num, published (1 or 0), created_at.

Security (same model as the other content tables, plus the link rules from the earlier hardening):
- photo_url must be empty or start with http:// or https://, and email must look like an address,
  so a crafted request cannot store a javascript: link or arbitrary text.
- RLS enabled.
- Anonymous visitors can read only published rows.
- Signed-in users can read, insert, update and delete everything, so drafts can be prepared.

Safe to run more than once.
*/

CREATE TABLE IF NOT EXISTS staff_church (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  role text,
  bio text,
  photo_url text,
  email text,
  sort_order_num integer NOT NULL DEFAULT 0,
  published integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT staff_church_photo_url_http_only
    CHECK (photo_url IS NULL OR btrim(photo_url) = '' OR photo_url ~* '^https?://'),
  CONSTRAINT staff_church_email_format
    CHECK (email IS NULL OR btrim(email) = '' OR email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  CONSTRAINT staff_church_name_length CHECK (char_length(name) <= 200),
  CONSTRAINT staff_church_bio_length CHECK (bio IS NULL OR char_length(bio) <= 5000)
);

ALTER TABLE staff_church ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON staff_church TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON staff_church TO authenticated;

DROP POLICY IF EXISTS anon_read_live_staff_church ON staff_church;
CREATE POLICY anon_read_live_staff_church ON staff_church
  FOR SELECT TO anon USING (published <> 0);

DROP POLICY IF EXISTS auth_read_all_staff_church ON staff_church;
CREATE POLICY auth_read_all_staff_church ON staff_church
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS auth_insert_staff_church ON staff_church;
CREATE POLICY auth_insert_staff_church ON staff_church
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS auth_update_staff_church ON staff_church;
CREATE POLICY auth_update_staff_church ON staff_church
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS auth_delete_staff_church ON staff_church;
CREATE POLICY auth_delete_staff_church ON staff_church
  FOR DELETE TO authenticated USING (true);
