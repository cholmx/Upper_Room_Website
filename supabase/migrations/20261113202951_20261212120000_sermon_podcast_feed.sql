/*
# Read the sermon podcast's own feed

The sermon podcast's RSS feed (https://anchor.fm/s/2fa685e0/podcast/rss) lists every episode with its audio file and a
public episode page that links to Spotify, Apple and the other apps. This adds it as a podcast show called "sermons" and
reads it, so every message can have a Listen button, including older ones.

- Adds a show with the slug "sermons" to podcast_shows_church, using the existing feed import (it runs every hour,
  and staff can press Refresh from feed on the Podcast Shows screen).
- The sermon episodes are kept apart from The Shine Podcast by their show slug. The Shine page and the Home page only
  show Shine episodes.
- Reads the feed once now.

Needs the podcasts migration. Safe to run more than once.
*/

INSERT INTO public.podcast_shows_church (slug, name, description, feed_url, apple_url, spotify_url)
VALUES ('sermons', 'Sermon Podcast (The Upper Room Fellowship)', 'Sermon audio from Upper Room Fellowship. Used for the Listen button on each message.',
  'https://anchor.fm/s/2fa685e0/podcast/rss',
  'https://podcasts.apple.com/us/podcast/the-upper-room-fellowship/id1193235232',
  'https://open.spotify.com/show/4vFbmzsFFEt4DSlUMcVKeO')
ON CONFLICT (slug) DO UPDATE SET feed_url = EXCLUDED.feed_url
  WHERE btrim(coalesce(public.podcast_shows_church.feed_url, '')) = '';

DO $$
BEGIN
  PERFORM public.import_podcast_feed('sermons');
EXCEPTION WHEN others THEN
  RAISE NOTICE 'First sermon podcast read skipped: %', SQLERRM;
END $$;

-- The Refresh podcast episodes button on the Messages screen reads both: the podcast's own feed and Apple Podcasts.
CREATE OR REPLACE FUNCTION public.sync_sermon_podcast_now()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE n_apple integer; n_feed integer; r text;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'You do not have permission to do that.'; END IF;
  n_feed := public.import_podcast_feed('sermons');
  n_apple := public.sync_sermon_podcast();
  SELECT last_result INTO r FROM sermon_podcast_source_church WHERE id = 1;
  RETURN jsonb_build_object('count', n_apple,
    'result', CASE WHEN n_feed >= 0 THEN n_feed::text || ' new from the podcast feed. ' ELSE 'The podcast feed could not be read. ' END || coalesce(r, ''));
END
$$;
REVOKE ALL ON FUNCTION public.sync_sermon_podcast_now() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sync_sermon_podcast_now() TO authenticated;
