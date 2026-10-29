/*
# Tables and columns for the redesigned site

1. New tables
- form_submissions_church: every public form (Connect Card, contact, prayer, Sozo, Table Group
  requests, serve, baptism, Growth Track, stories). Columns: form_type, name, email, phone,
  data (jsonb, the other answers), handled, created_at.
- site_photos_church: one row per photo slot (slot_key, image_url, alt_text), edited in the
  admin under Site Photos.
- table_groups_church: the Table Group finder (name, day, time_of_day, area, life_stage,
  status, description, published).
- stories_church: member stories shown on /stories (name, quote, body, photo_url, published).
- launch_checklist_church: which "Content to confirm" items are done (item_key, done).

2. New columns on existing tables
- sermons: scripture, topic, notes_url, series_image_url.
- events_church: ministry, image_url, featured.
- site_settings_church: announcement_text, announcement_url.

3. Security
- RLS is on for every new table.
- form_submissions_church: anonymous visitors can INSERT only, on five columns, so they cannot
  mark a submission handled or set a timestamp. Only signed-in staff can read, update or delete.
  Field lengths and the form_type list are enforced by CHECK constraints.
- site_photos_church: public read, signed-in write.
- table_groups_church and stories_church: anonymous visitors see only published rows,
  signed-in staff see and manage everything.
- launch_checklist_church: signed-in staff only.
- Every column that becomes a link or an image source must be empty or start with http:// or
  https://, like the earlier link checks.

Safe to run more than once.
*/

-- ===== New columns on existing tables =====

ALTER TABLE sermons ADD COLUMN IF NOT EXISTS scripture text;
ALTER TABLE sermons ADD COLUMN IF NOT EXISTS topic text;
ALTER TABLE sermons ADD COLUMN IF NOT EXISTS notes_url text;
ALTER TABLE sermons ADD COLUMN IF NOT EXISTS series_image_url text;

ALTER TABLE events_church ADD COLUMN IF NOT EXISTS ministry text;
ALTER TABLE events_church ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE events_church ADD COLUMN IF NOT EXISTS featured integer NOT NULL DEFAULT 0;

ALTER TABLE site_settings_church ADD COLUMN IF NOT EXISTS announcement_text text;
ALTER TABLE site_settings_church ADD COLUMN IF NOT EXISTS announcement_url text;

-- ===== New tables =====

CREATE TABLE IF NOT EXISTS form_submissions_church (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  form_type text NOT NULL,
  name text,
  email text,
  phone text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  handled integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT form_submissions_form_type CHECK (form_type IN (
    'connect', 'contact', 'prayer', 'sozo', 'tablegroup', 'serve', 'baptism', 'growthtrack', 'worship', 'story', 'generosity'
  )),
  CONSTRAINT form_submissions_name_len CHECK (name IS NULL OR char_length(name) <= 200),
  CONSTRAINT form_submissions_email_len CHECK (email IS NULL OR char_length(email) <= 200),
  CONSTRAINT form_submissions_phone_len CHECK (phone IS NULL OR char_length(phone) <= 60),
  CONSTRAINT form_submissions_data_size CHECK (char_length(data::text) <= 12000)
);

CREATE TABLE IF NOT EXISTS site_photos_church (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slot_key text NOT NULL UNIQUE,
  image_url text,
  alt_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_photos_slot_len CHECK (char_length(slot_key) <= 80),
  CONSTRAINT site_photos_alt_len CHECK (alt_text IS NULL OR char_length(alt_text) <= 300)
);

CREATE TABLE IF NOT EXISTS table_groups_church (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  day text,
  time_of_day text,
  area text,
  life_stage text,
  status text NOT NULL DEFAULT 'open',
  description text,
  published integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT table_groups_status CHECK (status IN ('open', 'full')),
  CONSTRAINT table_groups_name_len CHECK (char_length(name) <= 200),
  CONSTRAINT table_groups_description_len CHECK (description IS NULL OR char_length(description) <= 2000)
);

CREATE TABLE IF NOT EXISTS stories_church (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text,
  quote text NOT NULL,
  body text,
  photo_url text,
  published integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT stories_quote_len CHECK (char_length(quote) <= 600),
  CONSTRAINT stories_body_len CHECK (body IS NULL OR char_length(body) <= 10000)
);

CREATE TABLE IF NOT EXISTS launch_checklist_church (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  item_key text NOT NULL UNIQUE,
  done integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT launch_checklist_key_len CHECK (char_length(item_key) <= 80)
);

-- ===== Link and image columns must be web addresses =====

DO $$
DECLARE
  pairs text[][] := ARRAY[
    ARRAY['sermons', 'notes_url'],
    ARRAY['sermons', 'series_image_url'],
    ARRAY['events_church', 'image_url'],
    ARRAY['site_settings_church', 'announcement_url'],
    ARRAY['site_photos_church', 'image_url'],
    ARRAY['stories_church', 'photo_url']
  ];
  i int;
  t text;
  c text;
  cname text;
BEGIN
  FOR i IN 1 .. array_length(pairs, 1) LOOP
    t := pairs[i][1];
    c := pairs[i][2];
    cname := t || '_' || c || '_http_only';
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = cname) THEN
      EXECUTE format(
        'ALTER TABLE public.%I ADD CONSTRAINT %I CHECK (%I IS NULL OR btrim(%I) = '''' OR %I ~* ''^https?://'')',
        t, cname, c, c, c
      );
    END IF;
  END LOOP;
END $$;

-- ===== Row level security =====

ALTER TABLE form_submissions_church ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_photos_church ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_groups_church ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories_church ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_checklist_church ENABLE ROW LEVEL SECURITY;

-- Form submissions: anonymous insert on five columns only; staff read, update and delete.
REVOKE ALL ON form_submissions_church FROM anon;
GRANT INSERT (form_type, name, email, phone, data) ON form_submissions_church TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON form_submissions_church TO authenticated;

DROP POLICY IF EXISTS anon_insert_form_submissions ON form_submissions_church;
CREATE POLICY anon_insert_form_submissions ON form_submissions_church
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS auth_all_form_submissions ON form_submissions_church;
CREATE POLICY auth_all_form_submissions ON form_submissions_church
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Site photos: public read, signed-in write.
GRANT SELECT ON site_photos_church TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON site_photos_church TO authenticated;

DROP POLICY IF EXISTS public_read_site_photos ON site_photos_church;
CREATE POLICY public_read_site_photos ON site_photos_church
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS auth_write_site_photos ON site_photos_church;
CREATE POLICY auth_write_site_photos ON site_photos_church
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Table Groups and Stories: visitors see published rows, staff see and manage all.
GRANT SELECT ON table_groups_church, stories_church TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON table_groups_church, stories_church TO authenticated;

DROP POLICY IF EXISTS anon_read_live_table_groups ON table_groups_church;
CREATE POLICY anon_read_live_table_groups ON table_groups_church
  FOR SELECT TO anon USING (published <> 0);
DROP POLICY IF EXISTS auth_all_table_groups ON table_groups_church;
CREATE POLICY auth_all_table_groups ON table_groups_church
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS anon_read_live_stories ON stories_church;
CREATE POLICY anon_read_live_stories ON stories_church
  FOR SELECT TO anon USING (published <> 0);
DROP POLICY IF EXISTS auth_all_stories ON stories_church;
CREATE POLICY auth_all_stories ON stories_church
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Checklist: signed-in staff only.
GRANT SELECT, INSERT, UPDATE, DELETE ON launch_checklist_church TO authenticated;
DROP POLICY IF EXISTS auth_all_launch_checklist ON launch_checklist_church;
CREATE POLICY auth_all_launch_checklist ON launch_checklist_church
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
