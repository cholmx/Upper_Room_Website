/*
# A test for the podcast feed

podcast_feed_test(show): reads the show's RSS feed and reports what it finds, without saving anything:
whether a feed address is saved, the answer from the podcast host, how many episodes the feed lists, how many
have an audio file, and the first episode's title, date and audio link. Only a signed-in user may run it.

Safe to run more than once.
*/

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
    PERFORM extensions.http_set_curlopt('CURLOPT_TIMEOUT', '30');
    PERFORM extensions.http_set_curlopt('CURLOPT_FOLLOWLOCATION', '1');
    resp := extensions.http(('GET', s.feed_url, ARRAY[extensions.http_header('User-Agent', 'UpperRoomFellowshipSite/1.0')], NULL, NULL)::extensions.http_request);
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

REVOKE ALL ON FUNCTION public.podcast_feed_test(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.podcast_feed_test(text) TO authenticated;
