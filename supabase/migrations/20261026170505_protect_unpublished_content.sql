/*
# Hide drafts and scheduled content from the public API

The site already hides unpublished items in the browser, but the first schema let anyone read every
row of sermons, events_church and posts straight from the API. This replaces the single public read
policy on those three tables with two:

1. Anonymous visitors can read a row only when it is live:
   - published is not 0, and
   - publish_date is empty or today or earlier (the database clock is UTC, like the app).
2. Signed-in users can read everything, so the admin can still list and edit drafts.

Scheduled items appear on their own once the date arrives, because the date is checked on every query.
Writes are unchanged. The other content tables have no draft concept and stay publicly readable.

Safe to run more than once.
*/

DO $$
DECLARE
  tbl text;
  draftable text[] := ARRAY['sermons', 'events_church', 'posts'];
BEGIN
  FOREACH tbl IN ARRAY draftable LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'public_read_' || tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'anon_read_live_' || tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'auth_read_all_' || tbl, tbl);

    EXECUTE format(
      'CREATE POLICY %I ON %I FOR SELECT TO anon USING (published <> 0 AND (publish_date IS NULL OR publish_date <= CURRENT_DATE))',
      'anon_read_live_' || tbl, tbl
    );
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR SELECT TO authenticated USING (true)',
      'auth_read_all_' || tbl, tbl
    );
  END LOOP;
END $$;