/*
# Podcast feeds that redirect

Some podcast hosts (Anchor, for one) send the feed address on to another address. This database cannot follow
redirects by itself, so urf_http_get now follows up to five of them, one at a time. The feed import and the
feed test use it. Replaces import_podcast_feed and podcast_feed_test. Safe to run more than once.
*/

CREATE OR REPLACE FUNCTION public.urf_http_get(start_url text)
RETURNS extensions.http_response
LANGUAGE plpgsql
SET search_path = public, extensions
AS $$
DECLARE
  u text := start_url;
  r extensions.http_response;
  loc text;
  i integer;
BEGIN
  PERFORM extensions.http_set_curlopt('CURLOPT_TIMEOUT', '30');
  FOR i IN 1..6 LOOP
    r := extensions.http(('GET', u, ARRAY[extensions.http_header('User-Agent', 'UpperRoomFellowshipSite/1.0')], NULL, NULL)::extensions.http_request);
    IF r.status IN (301, 302, 303, 307, 308) THEN
      SELECT h.value INTO loc FROM unnest(r.headers) h WHERE lower(h.field) = 'location' LIMIT 1;
      EXIT WHEN loc IS NULL OR btrim(loc) = '';
      IF loc ~* '^https?://' THEN u := loc;
      ELSIF loc LIKE '/%' THEN u := substring(u from '^https?://[^/]+') || loc;
      ELSE EXIT; END IF;
    ELSE
      RETURN r;
    END IF;
  END LOOP;
  RETURN r;
END
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
    resp := public.urf_http_get(s.feed_url);
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

CREATE OR REPLACE FUNCTION public.podcast_feed_test(show text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  s record;
  ns text[] := ARRAY[ARRAY['itunes', 'http://www.itunes.com/dtds/podcast-1.0.dtd'], ARRAY['content', 'http://purl.org/rss/1.0/modules/content/']];
  resp extensions.http_response;
  doc xml;
  items xml[];
  n_items integer;
  n_audio integer := 0;
  e xml;
  first_title text; first_date text; first_audio text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Please sign in.'; END IF;
  SELECT * INTO s FROM podcast_shows_church WHERE slug = show;
  IF NOT FOUND THEN RETURN jsonb_build_object('step', 'show', 'problem', 'No show with the short name "' || show || '" exists.'); END IF;
  IF btrim(coalesce(s.feed_url, '')) = '' THEN RETURN jsonb_build_object('step', 'feed address', 'problem', 'No RSS feed address is saved for this show. Edit the show, paste the address, and save.'); END IF;

  BEGIN
    resp := public.urf_http_get(s.feed_url);
  EXCEPTION WHEN others THEN
    RETURN jsonb_build_object('step', 'request', 'problem', 'The feed could not be reached: ' || left(SQLERRM, 200), 'feed_address', s.feed_url);
  END;
  IF resp.status <> 200 THEN
    RETURN jsonb_build_object('step', 'host', 'problem', 'The podcast host answered ' || resp.status::text, 'feed_address', s.feed_url, 'detail', left(resp.content, 200));
  END IF;
  BEGIN
    doc := resp.content::xml;
  EXCEPTION WHEN others THEN
    RETURN jsonb_build_object('step', 'reading', 'problem', 'The address answered, but not with a podcast feed. The start of the answer is shown below. Use the RSS feed address from your podcast host, not the web page.', 'detail', left(resp.content, 300));
  END;

  items := xpath('/rss/channel/item', doc, ns);
  n_items := coalesce(array_length(items, 1), 0);
  IF n_items = 0 THEN
    RETURN jsonb_build_object('step', 'episodes', 'problem', 'The feed was read but lists no episodes in the usual RSS layout.', 'detail', left(resp.content, 300));
  END IF;
  FOREACH e IN ARRAY items LOOP
    IF btrim(public.urf_xml_text(xpath('string(/item/enclosure/@url)', e, ns))) <> '' THEN n_audio := n_audio + 1; END IF;
  END LOOP;
  e := items[1];
  first_title := public.urf_xml_text(xpath('string(/item/title)', e, ns));
  first_date := public.urf_xml_text(xpath('string(/item/pubDate)', e, ns));
  first_audio := public.urf_xml_text(xpath('string(/item/enclosure/@url)', e, ns));

  RETURN jsonb_build_object(
    'step', 'done',
    'episodes_in_feed', n_items,
    'episodes_with_audio', n_audio,
    'first_title', first_title,
    'first_date', first_date,
    'first_audio', first_audio,
    'episodes_already_saved', (SELECT count(*) FROM podcast_episodes_church WHERE show_slug = show)
  );
END
$$;

REVOKE ALL ON FUNCTION public.urf_http_get(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.import_podcast_feed(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.import_podcast_feed(text) TO authenticated;
REVOKE ALL ON FUNCTION public.podcast_feed_test(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.podcast_feed_test(text) TO authenticated;
