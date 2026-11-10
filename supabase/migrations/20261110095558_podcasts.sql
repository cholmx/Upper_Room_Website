/*
# Podcasts (the Shine podcast)

1. New tables
- podcast_shows_church: one row per podcast (slug, name, description, cover image, the RSS feed address, and
  links to Apple Podcasts, Spotify and YouTube). A row for "shine" is added empty.
- podcast_episodes_church: one row per episode (title, description, audio link, image, page link, length,
  date and an on/off switch). An episode is identified by its guid, so a feed is never imported twice.

2. Importing
- import_podcast_feed(slug): reads that show's RSS feed and adds new episodes, live right away. An episode that is
  already in the list is left alone, so edits made in the admin are kept. Signed-in staff can run it from the admin
  ("Refresh from feed"). It also fills in the show's description and cover when those are still empty.
- import_all_podcasts(): the same for every show with a feed address. It runs every hour on a schedule.

3. Security
- RLS is on. Visitors can read live episodes and the shows. Signed-in staff manage everything.
- Links must be empty or start with http:// or https://.

Needs the "http" and "pg_cron" extensions. Safe to run more than once.
*/

CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE TABLE IF NOT EXISTS public.podcast_shows_church (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  image_url text,
  feed_url text,
  apple_url text,
  spotify_url text,
  youtube_url text,
  last_imported_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT podcast_shows_name_len CHECK (char_length(name) <= 200),
  CONSTRAINT podcast_shows_description_len CHECK (description IS NULL OR char_length(description) <= 4000)
);

CREATE TABLE IF NOT EXISTS public.podcast_episodes_church (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  show_slug text NOT NULL DEFAULT 'shine',
  guid text,
  title text NOT NULL,
  description text,
  audio_url text,
  image_url text,
  page_url text,
  duration text,
  published_at timestamptz,
  published integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT podcast_episodes_title_len CHECK (char_length(title) <= 300),
  CONSTRAINT podcast_episodes_description_len CHECK (description IS NULL OR char_length(description) <= 8000)
);
CREATE UNIQUE INDEX IF NOT EXISTS podcast_episodes_guid_idx ON public.podcast_episodes_church (show_slug, guid) WHERE guid IS NOT NULL;

DO $$
DECLARE c text;
BEGIN
  FOREACH c IN ARRAY ARRAY['image_url', 'feed_url', 'apple_url', 'spotify_url', 'youtube_url'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'podcast_shows_' || c || '_http_only') THEN
      EXECUTE format('ALTER TABLE public.podcast_shows_church ADD CONSTRAINT %I CHECK (%I IS NULL OR btrim(%I) = '''' OR %I ~* ''^https?://'')', 'podcast_shows_' || c || '_http_only', c, c, c);
    END IF;
  END LOOP;
  FOREACH c IN ARRAY ARRAY['audio_url', 'image_url', 'page_url'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'podcast_episodes_' || c || '_http_only') THEN
      EXECUTE format('ALTER TABLE public.podcast_episodes_church ADD CONSTRAINT %I CHECK (%I IS NULL OR btrim(%I) = '''' OR %I ~* ''^https?://'')', 'podcast_episodes_' || c || '_http_only', c, c, c);
    END IF;
  END LOOP;
END $$;

ALTER TABLE public.podcast_shows_church ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcast_episodes_church ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.podcast_shows_church, public.podcast_episodes_church TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.podcast_shows_church, public.podcast_episodes_church TO authenticated;

DROP POLICY IF EXISTS anon_read_podcast_shows ON public.podcast_shows_church;
CREATE POLICY anon_read_podcast_shows ON public.podcast_shows_church FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS auth_all_podcast_shows ON public.podcast_shows_church;
CREATE POLICY auth_all_podcast_shows ON public.podcast_shows_church FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS anon_read_live_podcast_episodes ON public.podcast_episodes_church;
CREATE POLICY anon_read_live_podcast_episodes ON public.podcast_episodes_church FOR SELECT TO anon USING (published <> 0);
DROP POLICY IF EXISTS auth_all_podcast_episodes ON public.podcast_episodes_church;
CREATE POLICY auth_all_podcast_episodes ON public.podcast_episodes_church FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO public.podcast_shows_church (slug, name, description)
VALUES ('shine', 'The Shine Podcast', 'Conversations with people in our church family, and episodes on topics that matter to life and faith.')
ON CONFLICT (slug) DO NOTHING;

-- The text of an XML string value, with its entities turned back into characters.
CREATE OR REPLACE FUNCTION public.urf_xml_text(x xml[])
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT replace(replace(replace(replace(replace(coalesce(x[1]::text, ''), '&lt;', '<'), '&gt;', '>'), '&quot;', '"'), '&apos;', ''''), '&amp;', '&')
$$;

-- Plain text from a feed description: tags removed, a few entities and extra spaces cleaned up.
CREATE OR REPLACE FUNCTION public.urf_plain(txt text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT btrim(regexp_replace(replace(replace(regexp_replace(regexp_replace(coalesce(txt, ''), '</(p|div|li)>|<br\s*/?>', E'\n', 'gi'), '<[^>]+>', '', 'g'), '&nbsp;', ' '), '&amp;', '&'), E'[ \t]+\n|\n{3,}', E'\n\n', 'g'), E' \n\t')
$$;

CREATE OR REPLACE FUNCTION public.import_podcast_feed(show text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  s record;
  ns text[] := ARRAY[
    ARRAY['itunes', 'http://www.itunes.com/dtds/podcast-1.0.dtd'],
    ARRAY['content', 'http://purl.org/rss/1.0/modules/content/']
  ];
  resp extensions.http_response;
  doc xml;
  e xml;
  g text; ttl text; descr text; audio text; img text; pg text; dur text; pub text;
  ch_desc text; ch_img text;
  added integer := 0;
BEGIN
  -- Staff from the admin, or the database's own schedule (no signed-in user).
  IF auth.uid() IS NULL AND current_user NOT IN ('postgres', 'supabase_admin') THEN RAISE EXCEPTION 'Please sign in.'; END IF;

  SELECT * INTO s FROM podcast_shows_church WHERE slug = show;
  IF NOT FOUND OR btrim(coalesce(s.feed_url, '')) = '' THEN RETURN -1; END IF;

  BEGIN
    PERFORM extensions.http_set_curlopt('CURLOPT_TIMEOUT', '30');
    PERFORM extensions.http_set_curlopt('CURLOPT_FOLLOWLOCATION', '1');
    resp := extensions.http(('GET', s.feed_url, ARRAY[extensions.http_header('User-Agent', 'UpperRoomFellowshipSite/1.0')], NULL, NULL)::extensions.http_request);
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'Podcast feed could not be read: %', SQLERRM;
    RETURN -2;
  END;
  IF resp.status <> 200 THEN RETURN -3; END IF;

  BEGIN
    doc := resp.content::xml;
  EXCEPTION WHEN others THEN
    RETURN -4;
  END;

  ch_desc := public.urf_plain(public.urf_xml_text(xpath('string(/rss/channel/description)', doc, ns)));
  ch_img := coalesce(nullif(public.urf_xml_text(xpath('string(/rss/channel/itunes:image/@href)', doc, ns)), ''), public.urf_xml_text(xpath('string(/rss/channel/image/url)', doc, ns)));

  FOREACH e IN ARRAY xpath('/rss/channel/item', doc, ns) LOOP
    g := public.urf_xml_text(xpath('string(/item/guid)', e, ns));
    ttl := public.urf_xml_text(xpath('string(/item/title)', e, ns));
    audio := public.urf_xml_text(xpath('string(/item/enclosure/@url)', e, ns));
    IF btrim(ttl) = '' OR btrim(audio) = '' THEN CONTINUE; END IF;
    IF btrim(g) = '' THEN g := audio; END IF;
    descr := coalesce(nullif(public.urf_xml_text(xpath('string(/item/content:encoded)', e, ns)), ''), public.urf_xml_text(xpath('string(/item/description)', e, ns)));
    img := public.urf_xml_text(xpath('string(/item/itunes:image/@href)', e, ns));
    pg := public.urf_xml_text(xpath('string(/item/link)', e, ns));
    dur := public.urf_xml_text(xpath('string(/item/itunes:duration)', e, ns));
    pub := public.urf_xml_text(xpath('string(/item/pubDate)', e, ns));

    BEGIN
      INSERT INTO podcast_episodes_church (show_slug, guid, title, description, audio_url, image_url, page_url, duration, published_at, published)
      VALUES (
        show, left(g, 500), left(btrim(ttl), 300), left(public.urf_plain(descr), 8000), audio,
        CASE WHEN img ~* '^https?://' THEN img END,
        CASE WHEN pg ~* '^https?://' THEN pg END,
        left(nullif(btrim(dur), ''), 20),
        CASE WHEN btrim(pub) <> '' THEN pub::timestamptz END,
        1
      )
      ON CONFLICT (show_slug, guid) WHERE guid IS NOT NULL DO NOTHING;
      IF FOUND THEN added := added + 1; END IF;
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Skipped an episode: %', SQLERRM;
    END;
  END LOOP;

  UPDATE podcast_shows_church SET
    last_imported_at = now(),
    description = CASE WHEN btrim(coalesce(description, '')) = '' THEN left(ch_desc, 4000) ELSE description END,
    image_url = CASE WHEN btrim(coalesce(image_url, '')) = '' AND ch_img ~* '^https?://' THEN ch_img ELSE image_url END
  WHERE slug = show;
  RETURN added;
END
$$;

CREATE OR REPLACE FUNCTION public.import_all_podcasts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE r record;
BEGIN
  FOR r IN SELECT slug FROM podcast_shows_church WHERE btrim(coalesce(feed_url, '')) <> '' LOOP
    PERFORM public.import_podcast_feed(r.slug);
  END LOOP;
END
$$;

REVOKE ALL ON FUNCTION public.import_podcast_feed(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.import_podcast_feed(text) TO authenticated;
REVOKE ALL ON FUNCTION public.import_all_podcasts() FROM PUBLIC, anon, authenticated;

-- Every hour, at 32 minutes past.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'import-podcasts') THEN
    PERFORM cron.unschedule('import-podcasts');
  END IF;
  PERFORM cron.schedule('import-podcasts', '32 * * * *', 'SELECT public.import_all_podcasts()');
END $$;
