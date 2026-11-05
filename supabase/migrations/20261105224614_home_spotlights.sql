/*
# Front page spotlight area

1. New table
- home_spotlights_church: saved layouts for the area below the hero on the front page.
  Columns: name (internal label), layout, tone, kicker, title, body, image_url, button and
  second button labels and links, sort_order_num, published (the on/off switch), publish_date
  (optional start day), end_date (optional last day).

2. Security
- RLS is on. Visitors can read only rows that are turned on. Signed-in staff manage everything.
- Image and link columns must be empty or start with http:// or https://.

Safe to run more than once.
*/

CREATE TABLE IF NOT EXISTS home_spotlights_church (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  layout text NOT NULL DEFAULT 'centered',
  tone text NOT NULL DEFAULT 'white',
  kicker text,
  title text,
  body text,
  image_url text,
  button_label text,
  button_url text,
  button2_label text,
  button2_url text,
  sort_order_num integer NOT NULL DEFAULT 0,
  published integer NOT NULL DEFAULT 0,
  publish_date date,
  end_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT home_spotlights_layout CHECK (layout IN ('centered', 'photo-right', 'photo-left', 'banner')),
  CONSTRAINT home_spotlights_tone CHECK (tone IN ('white', 'forest', 'terra', 'sage', 'gold', 'bronze', 'ink')),
  CONSTRAINT home_spotlights_name_len CHECK (char_length(name) <= 120),
  CONSTRAINT home_spotlights_title_len CHECK (title IS NULL OR char_length(title) <= 200),
  CONSTRAINT home_spotlights_body_len CHECK (body IS NULL OR char_length(body) <= 4000)
);

DO $$
DECLARE c text;
BEGIN
  FOREACH c IN ARRAY ARRAY['image_url', 'button_url', 'button2_url'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'home_spotlights_church_' || c || '_http_only') THEN
      EXECUTE format(
        'ALTER TABLE public.home_spotlights_church ADD CONSTRAINT %I CHECK (%I IS NULL OR btrim(%I) = '''' OR %I ~* ''^(https?://|/)'')',
        'home_spotlights_church_' || c || '_http_only', c, c, c
      );
    END IF;
  END LOOP;
END $$;

ALTER TABLE home_spotlights_church ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON home_spotlights_church TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON home_spotlights_church TO authenticated;

DROP POLICY IF EXISTS anon_read_live_home_spotlights ON home_spotlights_church;
CREATE POLICY anon_read_live_home_spotlights ON home_spotlights_church
  FOR SELECT TO anon USING (published <> 0);

DROP POLICY IF EXISTS auth_all_home_spotlights ON home_spotlights_church;
CREATE POLICY auth_all_home_spotlights ON home_spotlights_church
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
