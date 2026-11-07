/*
# Sermon date is the Sunday before the video was posted

The sermon is given on Sunday and the video is posted afterward, so an imported video's date is now the Sunday
on or before the day it was posted, by the clock in Ohio. A video posted on a Sunday counts as that Sunday.
A date written in the video's title still wins.

Existing messages are not changed here. In the admin, Messages, Import from YouTube, "Read titles again" sets
the right date on messages that are already imported.

Replaces import_youtube_videos. Safe to run more than once.
*/

CREATE OR REPLACE FUNCTION public.urf_sunday_on_or_before(posted timestamptz)
RETURNS date
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE WHEN posted IS NULL THEN NULL
    ELSE ((posted AT TIME ZONE 'America/New_York')::date - extract(dow FROM (posted AT TIME ZONE 'America/New_York'))::int)
  END
$$;

CREATE OR REPLACE FUNCTION public.import_youtube_videos()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  channel text := 'UCQtl2NJ6-SnnsgMXpsV1K6w';
  ns text[] := ARRAY[
    ARRAY['a', 'http://www.w3.org/2005/Atom'],
    ARRAY['yt', 'http://www.youtube.com/xml/schemas/2015'],
    ARRAY['media', 'http://search.yahoo.com/mrss/']
  ];
  resp extensions.http_response;
  doc xml;
  e xml;
  vid text; raw_title text; raw_desc text; pub text;
  t record; d record;
  found_id bigint; found_desc text; found_q text;
  added integer := 0;
BEGIN
  BEGIN
    resp := extensions.http_get('https://www.youtube.com/feeds/videos.xml?channel_id=' || channel);
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'YouTube feed could not be read: %', SQLERRM;
    RETURN 0;
  END;
  IF resp.status <> 200 THEN
    RAISE NOTICE 'YouTube feed answered %', resp.status;
    RETURN 0;
  END IF;
  doc := resp.content::xml;

  FOREACH e IN ARRAY xpath('//a:entry', doc, ns) LOOP
    vid := public.urf_xml_text(xpath('string(/a:entry/yt:videoId)', e, ns));
    IF vid = '' THEN CONTINUE; END IF;
    raw_title := public.urf_xml_text(xpath('string(/a:entry/a:title)', e, ns));
    raw_desc := public.urf_xml_text(xpath('string(/a:entry/media:group/media:description)', e, ns));
    pub := public.urf_xml_text(xpath('string(/a:entry/a:published)', e, ns));

    SELECT * INTO t FROM public.urf_parse_video_title(raw_title);
    SELECT * INTO d FROM public.urf_split_description(raw_desc);

    SELECT id, description, discussion_questions INTO found_id, found_desc, found_q
    FROM sermons WHERE position(vid IN coalesce(video_url, '')) > 0 LIMIT 1;

    IF found_id IS NULL THEN
      INSERT INTO sermons (title, speaker, series, date, description, discussion_questions, video_url, published)
      VALUES (
        coalesce(nullif(t.title, ''), raw_title),
        t.speaker,
        t.series,
        coalesce(t.msg_date, public.urf_sunday_on_or_before(nullif(pub, '')::timestamptz)),
        left(d.summary, 4000),
        left(d.questions, 8000),
        'https://www.youtube.com/watch?v=' || vid,
        1
      );
      added := added + 1;
    ELSIF btrim(coalesce(found_desc, '')) = '' AND btrim(coalesce(found_q, '')) = '' AND (d.summary <> '' OR d.questions <> '') THEN
      UPDATE sermons SET description = left(d.summary, 4000), discussion_questions = left(d.questions, 8000) WHERE id = found_id;
    END IF;
  END LOOP;
  RETURN added;
END
$$;
REVOKE ALL ON FUNCTION public.import_youtube_videos() FROM PUBLIC, anon, authenticated;
