/*
# Create initial schema for Upper Room Fellowship

1. New Tables (all in public schema, each with auto id + created_at)
- hero_config: heading, subtext, image_url
- home_section_order_church: section_key_name, sort_order_num_val
- photo_sections_church: heading, subtext, image_url, button_text, button_page_slug, sort_order_num
- gallery_church: image_url, caption, sort_order_num
- custom_pages_church: title_text, slug_key, nav_label_text, body_content_text
- site_settings_church: service_time, phone, email, street, city, region, postal_code,
  give_url, facebook_url, instagram_url, youtube_url
- sermons: title, speaker, series, date, description, notes, video_url, audio_url,
  published (int default 1), publish_date (date)
- events_church: title, date, time, location, desc_text, recurrence (default 'none'),
  registration_url, published (int default 1), publish_date (date)
- posts: title, author, date, category, image_url, body, published (int default 1),
  publish_date (date)
- episodes: title, date, audio, feed
- contact_messages_church: name, email, kind, message, handled (int default 0)
- activity_log_church: actor, action, area, item_label

2. Security
- RLS enabled on every table.
- Public (anon) read on all content tables + site_settings_church.
- Authenticated-only INSERT/UPDATE/DELETE on all content tables (shared admin model:
  any signed-in admin manages all rows; being signed in is the access gate).
- contact_messages_church: anon may INSERT only; SELECT/UPDATE/DELETE authenticated-only.
- activity_log_church: all CRUD authenticated-only (no anon access at all).

3. Notes
- published columns default to 1 so existing + new rows count as published.
- handled defaults to 0 (not yet followed up).
- recurrence defaults to 'none'.
*/

-- ===== Content / public-read tables =====

CREATE TABLE IF NOT EXISTS hero_config (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  heading text,
  subtext text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS home_section_order_church (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  section_key_name text NOT NULL,
  sort_order_num_val integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS photo_sections_church (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  heading text,
  subtext text,
  image_url text,
  button_text text,
  button_page_slug text,
  sort_order_num integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gallery_church (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  image_url text,
  caption text,
  sort_order_num integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS custom_pages_church (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title_text text,
  slug_key text,
  nav_label_text text,
  body_content_text text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_settings_church (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  service_time text,
  phone text,
  email text,
  street text,
  city text,
  region text,
  postal_code text,
  give_url text,
  facebook_url text,
  instagram_url text,
  youtube_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sermons (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title text,
  speaker text,
  series text,
  date date,
  description text,
  notes text,
  video_url text,
  audio_url text,
  published integer NOT NULL DEFAULT 1,
  publish_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events_church (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title text,
  date date,
  time text,
  location text,
  desc_text text,
  recurrence text NOT NULL DEFAULT 'none',
  registration_url text,
  published integer NOT NULL DEFAULT 1,
  publish_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS posts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title text,
  author text,
  date date,
  category text,
  image_url text,
  body text,
  published integer NOT NULL DEFAULT 1,
  publish_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS episodes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title text,
  date date,
  audio text,
  feed text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===== Restricted tables =====

CREATE TABLE IF NOT EXISTS contact_messages_church (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text,
  email text,
  kind text,
  message text,
  handled integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activity_log_church (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor text,
  action text,
  area text,
  item_label text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===== Enable RLS on every table =====

ALTER TABLE hero_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_section_order_church ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_sections_church ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_church ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_pages_church ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings_church ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE events_church ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages_church ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log_church ENABLE ROW LEVEL SECURITY;

-- ===== Grants =====

GRANT SELECT ON hero_config, home_section_order_church, photo_sections_church, gallery_church, custom_pages_church, site_settings_church, sermons, events_church, posts, episodes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON hero_config, home_section_order_church, photo_sections_church, gallery_church, custom_pages_church, site_settings_church, sermons, events_church, posts, episodes TO authenticated;

GRANT INSERT ON contact_messages_church TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON contact_messages_church TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON activity_log_church TO authenticated;

-- ===== Policies for public-read content tables =====
-- Shared admin model: any signed-in user manages all rows; public can read.

DO $$
DECLARE
  tbl text;
  content_tables text[] := ARRAY[
    'hero_config','home_section_order_church','photo_sections_church',
    'gallery_church','custom_pages_church','site_settings_church',
    'sermons','events_church','posts','episodes'
  ];
BEGIN
  FOREACH tbl IN ARRAY content_tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'public_read_' || tbl, tbl);
    EXECUTE format('CREATE POLICY %I ON %I FOR SELECT TO anon, authenticated USING (true)', 'public_read_' || tbl, tbl);

    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'auth_insert_' || tbl, tbl);
    EXECUTE format('CREATE POLICY %I ON %I FOR INSERT TO authenticated WITH CHECK (true)', 'auth_insert_' || tbl, tbl);

    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'auth_update_' || tbl, tbl);
    EXECUTE format('CREATE POLICY %I ON %I FOR UPDATE TO authenticated USING (true) WITH CHECK (true)', 'auth_update_' || tbl, tbl);

    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'auth_delete_' || tbl, tbl);
    EXECUTE format('CREATE POLICY %I ON %I FOR DELETE TO authenticated USING (true)', 'auth_delete_' || tbl, tbl);
  END LOOP;
END $$;

-- ===== Policies for contact_messages_church =====
-- Anonymous visitors may submit a message (INSERT only). Only signed-in staff can read/update/delete.

DROP POLICY IF EXISTS "anon_insert_contact_messages" ON contact_messages_church;
CREATE POLICY "anon_insert_contact_messages" ON contact_messages_church
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_read_contact_messages" ON contact_messages_church;
CREATE POLICY "auth_read_contact_messages" ON contact_messages_church
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_contact_messages" ON contact_messages_church;
CREATE POLICY "auth_update_contact_messages" ON contact_messages_church
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_contact_messages" ON contact_messages_church;
CREATE POLICY "auth_delete_contact_messages" ON contact_messages_church
  FOR DELETE TO authenticated USING (true);

-- ===== Policies for activity_log_church =====
-- Signed-in users only for everything.

DROP POLICY IF EXISTS "auth_read_activity_log" ON activity_log_church;
CREATE POLICY "auth_read_activity_log" ON activity_log_church
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_activity_log" ON activity_log_church;
CREATE POLICY "auth_insert_activity_log" ON activity_log_church
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_activity_log" ON activity_log_church;
CREATE POLICY "auth_update_activity_log" ON activity_log_church
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_activity_log" ON activity_log_church;
CREATE POLICY "auth_delete_activity_log" ON activity_log_church
  FOR DELETE TO authenticated USING (true);
