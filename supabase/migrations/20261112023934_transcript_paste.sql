CREATE OR REPLACE FUNCTION public.get_sermon_transcript(p_sermon_id bigint)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE t text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Please sign in.'; END IF;
  SELECT transcript INTO t FROM sermon_transcripts_church WHERE sermon_id = p_sermon_id;
  RETURN coalesce(t, '');
END
$$;
REVOKE ALL ON FUNCTION public.get_sermon_transcript(bigint) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_sermon_transcript(bigint) TO authenticated;

CREATE OR REPLACE FUNCTION public.save_sermon_transcript(p_sermon_id bigint, p_body text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Please sign in.'; END IF;
  IF btrim(coalesce(p_body, '')) = '' THEN
    DELETE FROM sermon_transcripts_church WHERE sermon_id = p_sermon_id;
    RETURN false;
  END IF;
  INSERT INTO sermon_transcripts_church (sermon_id, transcript, updated_at) VALUES (p_sermon_id, left(p_body, 200000), now())
  ON CONFLICT (sermon_id) DO UPDATE SET transcript = EXCLUDED.transcript, updated_at = now();
  RETURN true;
END
$$;
REVOKE ALL ON FUNCTION public.save_sermon_transcript(bigint, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_sermon_transcript(bigint, text) TO authenticated;
