/*
# Require web addresses in every link column

1. Security
- Adds CHECK constraints so every column that the site renders as a link or an image
  source must be empty or start with `http://` or `https://`.
- Columns covered: hero_config.image_url, photo_sections_church.image_url,
  gallery_church.image_url, posts.image_url, sermons.video_url, sermons.audio_url,
  events_church.registration_url, episodes.audio, episodes.feed,
  site_settings_church.give_url / facebook_url / instagram_url / youtube_url.

2. Notes
- The address format was previously checked only by the admin form in the browser, so a
  crafted request could store a `javascript:` address that runs code when a visitor
  clicks the link.
- Constraints are added only when not already present, so the migration is re-runnable.
*/

DO $$
DECLARE
  t text;
  c text;
  pairs text[][] := ARRAY[
    ARRAY['hero_config','image_url'],
    ARRAY['photo_sections_church','image_url'],
    ARRAY['gallery_church','image_url'],
    ARRAY['posts','image_url'],
    ARRAY['sermons','video_url'],
    ARRAY['sermons','audio_url'],
    ARRAY['events_church','registration_url'],
    ARRAY['episodes','audio'],
    ARRAY['episodes','feed'],
    ARRAY['site_settings_church','give_url'],
    ARRAY['site_settings_church','facebook_url'],
    ARRAY['site_settings_church','instagram_url'],
    ARRAY['site_settings_church','youtube_url']
  ];
  i int;
  cname text;
BEGIN
  FOR i IN 1 .. array_length(pairs, 1) LOOP
    t := pairs[i][1];
    c := pairs[i][2];
    cname := t || '_' || c || '_http_only';
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = cname
    ) AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = t AND column_name = c
    ) THEN
      EXECUTE format(
        'ALTER TABLE public.%I ADD CONSTRAINT %I CHECK (%I IS NULL OR btrim(%I) = '''' OR %I ~* ''^https?://'')',
        t, cname, c, c, c
      );
    END IF;
  END LOOP;
END $$;
