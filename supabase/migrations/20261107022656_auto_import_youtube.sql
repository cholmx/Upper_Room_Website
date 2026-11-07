/*
# Automatic YouTube import

Every hour the database reads the Upper Room Fellowship YouTube channel's public video feed and adds each
new video to the messages list, live right away. Nothing outside the database is needed, and no key is required.
The feed holds the 15 newest videos, so older ones come in with the admin's Import from YouTube button.

1. New column: sermons.discussion_questions (the "Discussion Questions" part of a video description).
2. Titles are read as "Series :: Title // Speaker", with an optional date such as 7.25.2021, and a few guest
   speakers shown by initials are spelled out. Descriptions are split into "Sermon Summary" and "Discussion
   Questions" when those headings are on their own lines. With no headings, the whole description is the summary.
3. A message already imported is only touched when both its summary and its questions are still empty, so
   anything edited by hand is kept. That covers a description written on YouTube after the video was posted.
4. Security: the import function can be run only by the database itself (the schedule), never by website
   visitors or signed-in staff.

Needs the "http" and "pg_cron" extensions. Safe to run more than once.
*/

ALTER TABLE sermons ADD COLUMN IF NOT EXISTS discussion_questions text;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sermons_discussion_questions_len') THEN
    ALTER TABLE sermons ADD CONSTRAINT sermons_discussion_questions_len
      CHECK (discussion_questions IS NULL OR char_length(discussion_questions) <= 8000);
  END IF;
END $$;

CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Guest speakers whose titles show a first name and a last initial.
CREATE OR REPLACE FUNCTION public.urf_speaker_name(n text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE btrim(lower(regexp_replace(regexp_replace(coalesce(n, ''), '[^A-Za-z ]', '', 'g'), '\s+', ' ', 'g')))
    WHEN 'chris h' THEN 'Chris Holm'
    WHEN 'josh o' THEN 'Josh Osborn'
    WHEN 'weslie b' THEN 'Weslie Broderick'
    WHEN 'jared t' THEN 'Jared Thompson'
    WHEN 'scott m' THEN 'Scott McPeak'
    ELSE btrim(coalesce(n, ''))
  END
$$;

-- "Series :: Title // Speaker // 7.25.2021"
CREATE OR REPLACE FUNCTION public.urf_parse_video_title(raw text, OUT series text, OUT title text, OUT speaker text, OUT msg_date date)
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  parts text[];
  part text;
  rest text[] := '{}';
  m text[];
  yr int; mo int; dy int;
  pieces text[];
BEGIN
  parts := regexp_split_to_array(btrim(coalesce(raw, '')), '\s+//\s+');
  FOREACH part IN ARRAY parts LOOP
    part := btrim(part);
    m := regexp_match(part, '^(\d{1,2})[./-](\d{1,2})[./-](\d{2}|\d{4})$');
    IF m IS NULL THEN
      rest := rest || part;
    ELSIF msg_date IS NULL THEN
      mo := m[1]::int; dy := m[2]::int;
      yr := CASE WHEN length(m[3]) = 2 THEN 2000 + m[3]::int ELSE m[3]::int END;
      BEGIN
        msg_date := make_date(yr, mo, dy);
      EXCEPTION WHEN others THEN
        msg_date := NULL;
      END;
    END IF;
  END LOOP;

  speaker := '';
  IF coalesce(array_length(rest, 1), 0) > 1 THEN
    speaker := public.urf_speaker_name(rest[array_length(rest, 1)]);
    rest := rest[1:array_length(rest, 1) - 1];
  END IF;
  title := array_to_string(rest, ' // ');

  series := '';
  IF title ~ '\s+::\s+' THEN
    pieces := regexp_split_to_array(title, '\s+::\s+');
    series := btrim(pieces[1]);
    title := btrim(array_to_string(pieces[2:array_length(pieces, 1)], ' :: '));
  END IF;
  RETURN;
END
$$;

-- Splits a video description into the sermon summary and the discussion questions.
CREATE OR REPLACE FUNCTION public.urf_split_description(txt text, OUT summary text, OUT questions text)
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  line text;
  mode text := NULL;
  saw boolean := false;
  s text := '';
  q text := '';
BEGIN
  FOREACH line IN ARRAY regexp_split_to_array(replace(coalesce(txt, ''), E'\r', ''), E'\n') LOOP
    IF line ~* '^\s*(sermon\s+)?summary\s*:?\s*$' THEN
      mode := 's'; saw := true;
    ELSIF line ~* '^\s*(discussion\s+questions?|questions?\s+for\s+discussion)\s*:?\s*$' THEN
      mode := 'q'; saw := true;
    ELSIF mode = 's' THEN
      s := s || line || E'\n';
    ELSIF mode = 'q' THEN
      q := q || line || E'\n';
    END IF;
  END LOOP;
  IF NOT saw THEN
    summary := btrim(coalesce(txt, ''));
    questions := '';
  ELSE
    summary := btrim(s, E' \n\t');
    questions := btrim(q, E' \n\t');
  END IF;
  RETURN;
END
$$;

-- The text of an XML string value, with its entities turned back into characters.
CREATE OR REPLACE FUNCTION public.urf_xml_text(x xml[])
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT replace(replace(replace(replace(replace(coalesce(x[1]::text, ''), '&lt;', '<'), '&gt;', '>'), '&quot;', '"'), '&apos;', ''''), '&amp;', '&')
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
        coalesce(t.msg_date, nullif(pub, '')::timestamptz::date),
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

-- Only the database's own schedule may run it.
REVOKE ALL ON FUNCTION public.import_youtube_videos() FROM PUBLIC, anon, authenticated;

-- Every hour, at 17 minutes past.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'import-youtube-videos') THEN
    PERFORM cron.unschedule('import-youtube-videos');
  END IF;
  PERFORM cron.schedule('import-youtube-videos', '17 * * * *', 'SELECT public.import_youtube_videos()');
END $$;

-- Run once now so the newest videos appear without waiting for the hour.
DO $$
BEGIN
  PERFORM public.import_youtube_videos();
EXCEPTION WHEN others THEN
  RAISE NOTICE 'First import skipped: %', SQLERRM;
END $$;
