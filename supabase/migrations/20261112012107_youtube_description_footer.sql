/*
# Leave the website and social links out of imported descriptions

Every video description ends with the church's links ("URF WEBSITE:", "SOCIALS:", lines starting with an arrow).
They were being imported at the end of the discussion questions. From now on the automatic import and the
admin's YouTube import both drop everything from the first of those lines on, before splitting the description
into the summary and the discussion questions.

1. Replaces urf_split_description.
2. Cleans messages already imported: removes the links from the end of the summary and the discussion questions.

Safe to run more than once.
*/

CREATE OR REPLACE FUNCTION public.urf_split_description(txt text, OUT summary text, OUT questions text)
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  line text;
  mode text := NULL;
  saw boolean := false;
  s text := '';
  q text := '';
  clean text;
BEGIN
  clean := replace(coalesce(txt, ''), E'\r', '');
  -- Drop everything from the first website or social links line on.
  clean := regexp_replace(clean, E'(^|\n)[ \t]*(URF[ \t]+WEBSITE|WEBSITE|SOCIALS?)[ \t]*:?[ \t]*(\n|$).*', '', 'i');
  clean := regexp_replace(clean, E'(^|\n)[ \t]*➤.*', '');
  FOREACH line IN ARRAY regexp_split_to_array(clean, E'\n') LOOP
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
    summary := btrim(clean, E' \n\t');
    questions := '';
  ELSE
    summary := btrim(s, E' \n\t');
    questions := btrim(q, E' \n\t');
  END IF;
  RETURN;
END
$$;

-- Messages already imported with the links at the end.
UPDATE public.sermons
SET description = btrim(regexp_replace(regexp_replace(coalesce(description, ''), E'(^|\n)[ \t]*(URF[ \t]+WEBSITE|WEBSITE|SOCIALS?)[ \t]*:?[ \t]*(\n|$).*', '', 'i'), E'(^|\n)[ \t]*➤.*', ''), E' \n\t\r'),
    discussion_questions = btrim(regexp_replace(regexp_replace(coalesce(discussion_questions, ''), E'(^|\n)[ \t]*(URF[ \t]+WEBSITE|WEBSITE|SOCIALS?)[ \t]*:?[ \t]*(\n|$).*', '', 'i'), E'(^|\n)[ \t]*➤.*', ''), E' \n\t\r')
WHERE description ~* E'(URF[ \t]+WEBSITE|SOCIALS?[ \t]*:)' OR description ~ '➤'
   OR discussion_questions ~* E'(URF[ \t]+WEBSITE|SOCIALS?[ \t]*:)' OR discussion_questions ~ '➤';
