/*
# Standalone Sermons

When a video is imported from YouTube with a title like "Name // Speaker", with no "Series ::" in front, it is a one-off
message, so it is now put in the series "Standalone Sermons". Titles written as "Series :: Name // Speaker" are unchanged,
and so are titles with no speaker. This changes the title reader used by the automatic YouTube import. Messages that are
already imported are not changed. Safe to run more than once.
*/

CREATE OR REPLACE FUNCTION public.urf_parse_video_title(raw text, OUT series text, OUT title text, OUT speaker text, OUT msg_date date)
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
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
  -- "Name // Speaker" with no series in front: a one-off message.
  IF series = '' AND speaker <> '' THEN series := 'Standalone Sermons'; END IF;
  RETURN;
END
$$;
