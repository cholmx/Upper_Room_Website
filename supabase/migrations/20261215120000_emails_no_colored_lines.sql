/*
# Emails: no colored lines

The thin dividing lines in the emails (between sections and above the unsubscribe note) are now a soft cream line instead of
a colored one. Only the line color and thickness change. Needs the earlier email color migrations. Safe to run more than once.
*/

DO $$
DECLARE
  f record;
  def text;
BEGIN
  FOR f IN
    SELECT p.oid, p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prokind = 'f' AND p.prosrc ~* '(?:border-top|border-bottom):1px solid #(?:5b8b75|5d947b)'
  LOOP
    def := pg_get_functiondef(f.oid);
    def := regexp_replace(def, '(border-top|border-bottom):1px solid #(?:5b8b75|5d947b)', '\1:2px solid #F4ECDD', 'gi');
    EXECUTE def;
    RAISE NOTICE 'Updated the lines in %', f.proname;
  END LOOP;
END $$;
