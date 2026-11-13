/*
# Link each message to its episode on the sermon podcast

The messages on YouTube and the sermon podcast use the same titles. This keeps a copy of the podcast's recent
episodes (title, the Apple Podcasts link for that episode, and the audio file) so the website can send the Listen
button to the matching episode.

1. sermon_podcast_source_church: which Apple Podcasts show to read (the show id from its Apple link) and what the last
   check found. One row. Staff can read it.
2. sermon_podcast_episodes_church: the copy of the episodes. Visitors can read it. Only admins change it.
3. sync_sermon_podcast(): asks Apple's public podcast lookup for the show's newest 200 episodes and updates the copy. Older
   copies are kept. If Apple cannot be reached nothing changes. It runs every hour, and once now.
4. sync_sermon_podcast_now(): lets an admin run it from the admin.

Needs the "http" and "pg_cron" extensions. Safe to run more than once.
*/

CREATE TABLE IF NOT EXISTS public.sermon_podcast_source_church (
  id integer PRIMARY KEY DEFAULT 1,
  apple_show_id text NOT NULL DEFAULT '1193235232',
  last_synced_at timestamptz,
  last_result text,
  CONSTRAINT sermon_podcast_source_one_row CHECK (id = 1),
  CONSTRAINT sermon_podcast_source_id_digits CHECK (apple_show_id ~ '^[0-9]{5,15}$')
);
INSERT INTO public.sermon_podcast_source_church (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.sermon_podcast_episodes_church (
  apple_id bigint PRIMARY KEY,
  title text NOT NULL,
  apple_url text,
  audio_url text,
  published_at timestamptz,
  synced_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sermon_podcast_apple_url_http CHECK (apple_url IS NULL OR apple_url ~* '^https://'),
  CONSTRAINT sermon_podcast_audio_url_http CHECK (audio_url IS NULL OR audio_url ~* '^https?://')
);
CREATE INDEX IF NOT EXISTS sermon_podcast_published_idx ON public.sermon_podcast_episodes_church (published_at DESC);

ALTER TABLE public.sermon_podcast_source_church ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sermon_podcast_episodes_church ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.sermon_podcast_source_church, public.sermon_podcast_episodes_church FROM anon;
GRANT SELECT ON public.sermon_podcast_episodes_church TO anon, authenticated;
GRANT SELECT ON public.sermon_podcast_source_church TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.sermon_podcast_episodes_church TO authenticated;
GRANT UPDATE ON public.sermon_podcast_source_church TO authenticated;
DROP POLICY IF EXISTS anon_read_sermon_podcast ON public.sermon_podcast_episodes_church;
CREATE POLICY anon_read_sermon_podcast ON public.sermon_podcast_episodes_church FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS auth_all_sermon_podcast ON public.sermon_podcast_episodes_church;
CREATE POLICY auth_all_sermon_podcast ON public.sermon_podcast_episodes_church FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS auth_all_sermon_podcast_source ON public.sermon_podcast_source_church;
CREATE POLICY auth_all_sermon_podcast_source ON public.sermon_podcast_source_church FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Same team rules as the other tables: only admins change them.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['sermon_podcast_source_church', 'sermon_podcast_episodes_church'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS team_read ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS team_insert ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS team_update ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS team_delete ON public.%I', t);
    EXECUTE format('CREATE POLICY team_read ON public.%I AS RESTRICTIVE FOR SELECT TO authenticated USING (public.is_staff())', t);
    EXECUTE format('CREATE POLICY team_insert ON public.%I AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (public.is_admin())', t);
    EXECUTE format('CREATE POLICY team_update ON public.%I AS RESTRICTIVE FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())', t);
    EXECUTE format('CREATE POLICY team_delete ON public.%I AS RESTRICTIVE FOR DELETE TO authenticated USING (public.is_admin())', t);
  END LOOP;
EXCEPTION WHEN undefined_function THEN
  RAISE NOTICE 'Team roles are not set up yet, so only the basic policies were added.';
END $$;

CREATE OR REPLACE FUNCTION public.sync_sermon_podcast()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  src record;
  resp extensions.http_response;
  j jsonb;
  n integer := 0;
BEGIN
  SELECT * INTO src FROM sermon_podcast_source_church WHERE id = 1;
  IF NOT FOUND THEN RETURN -1; END IF;
  BEGIN
    resp := public.urf_http_get('https://itunes.apple.com/lookup?id=' || src.apple_show_id || '&media=podcast&entity=podcastEpisode&limit=200&country=us');
  EXCEPTION WHEN others THEN
    UPDATE sermon_podcast_source_church SET last_result = left('Could not reach Apple Podcasts: ' || SQLERRM, 300) WHERE id = 1;
    RETURN -2;
  END;
  IF resp.status <> 200 THEN
    UPDATE sermon_podcast_source_church SET last_result = 'Apple Podcasts answered ' || resp.status::text WHERE id = 1;
    RETURN -3;
  END IF;
  BEGIN
    j := resp.content::jsonb;
    IF jsonb_typeof(j -> 'results') <> 'array' THEN RAISE EXCEPTION 'no results'; END IF;
  EXCEPTION WHEN others THEN
    UPDATE sermon_podcast_source_church SET last_result = 'Apple Podcasts did not answer with a list of episodes.' WHERE id = 1;
    RETURN -4;
  END;

  INSERT INTO sermon_podcast_episodes_church (apple_id, title, apple_url, audio_url, published_at, synced_at)
  SELECT (e ->> 'trackId')::bigint, left(btrim(e ->> 'trackName'), 300),
         CASE WHEN e ->> 'trackViewUrl' ~* '^https://' THEN e ->> 'trackViewUrl' END,
         CASE WHEN e ->> 'episodeUrl' ~* '^https?://' THEN e ->> 'episodeUrl' END,
         nullif(e ->> 'releaseDate', '')::timestamptz, now()
  FROM jsonb_array_elements(j -> 'results') e
  WHERE e ->> 'wrapperType' = 'podcastEpisode' AND (e ->> 'trackId') ~ '^[0-9]+$' AND btrim(coalesce(e ->> 'trackName', '')) <> ''
  ON CONFLICT (apple_id) DO UPDATE SET title = EXCLUDED.title, apple_url = EXCLUDED.apple_url, audio_url = EXCLUDED.audio_url,
    published_at = EXCLUDED.published_at, synced_at = now();
  GET DIAGNOSTICS n = ROW_COUNT;
  UPDATE sermon_podcast_source_church SET last_synced_at = now(), last_result = 'Read ' || n::text || ' episodes from Apple Podcasts.' WHERE id = 1;
  RETURN n;
END
$$;
REVOKE ALL ON FUNCTION public.sync_sermon_podcast() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.sync_sermon_podcast_now()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE n integer; r text;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'You do not have permission to do that.'; END IF;
  n := public.sync_sermon_podcast();
  SELECT last_result INTO r FROM sermon_podcast_source_church WHERE id = 1;
  RETURN jsonb_build_object('count', n, 'result', r);
END
$$;
REVOKE ALL ON FUNCTION public.sync_sermon_podcast_now() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sync_sermon_podcast_now() TO authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'sync-sermon-podcast') THEN
    PERFORM cron.unschedule('sync-sermon-podcast');
  END IF;
  PERFORM cron.schedule('sync-sermon-podcast', '27 * * * *', 'SELECT public.sync_sermon_podcast()');
END $$;

-- Read the episodes once now, so the Listen buttons work without waiting for the hour.
DO $$
BEGIN
  PERFORM public.sync_sermon_podcast();
EXCEPTION WHEN others THEN
  RAISE NOTICE 'First podcast sync skipped: %', SQLERRM;
END $$;
