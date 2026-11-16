/*
# The teal colors in emails, updated

Dark teal is now #172B2C and jungle teal is now #5B8B75. This changes those two colors inside the database functions that
build emails (the weekly email, its sign-up confirmation, the welcome emails and the form notices). Only the colors change.
Safe to run more than once.
*/

DO $$
DECLARE
  f record;
  def text;
BEGIN
  FOR f IN
    SELECT p.oid, p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prokind = 'f' AND p.prosrc ~* '#(?:003235|5d947b)(?![0-9a-f])'
  LOOP
    def := pg_get_functiondef(f.oid);
    def := regexp_replace(def, '#003235(?![0-9a-fA-F])', '#172B2C', 'gi');
    def := regexp_replace(def, '#5d947b(?![0-9a-fA-F])', '#5B8B75', 'gi');
    EXECUTE def;
    RAISE NOTICE 'Updated the colors in %', f.proname;
  END LOOP;
END $$;
