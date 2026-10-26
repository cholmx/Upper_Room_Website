/*
# Restrict settings writes and activity-log reads to admin accounts

1. Security
- Adds a helper `public.is_editor()` that reads the signed-in user's role from the
  user-immutable `app_metadata` claim in the JWT.
- `site_settings_church`: INSERT / UPDATE / DELETE now require a signed-in user whose
  role is not `editor`. Public read is unchanged.
- `activity_log_church`: SELECT now requires a signed-in user whose role is not
  `editor`. INSERT stays open to every signed-in user so edit logging keeps working.

2. Notes
- The editor role was previously enforced only by hiding tabs in the browser, so an
  editor could still write settings and read the log through the Data API.
*/

CREATE OR REPLACE FUNCTION public.is_editor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb
      -> 'app_metadata' ->> 'role',
    ''
  ) = 'editor';
$$;

REVOKE EXECUTE ON FUNCTION public.is_editor() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_editor() TO authenticated, anon;

DROP POLICY IF EXISTS "auth_insert_site_settings_church" ON site_settings_church;
CREATE POLICY "auth_insert_site_settings_church" ON site_settings_church FOR INSERT
  TO authenticated WITH CHECK (NOT public.is_editor());

DROP POLICY IF EXISTS "auth_update_site_settings_church" ON site_settings_church;
CREATE POLICY "auth_update_site_settings_church" ON site_settings_church FOR UPDATE
  TO authenticated USING (NOT public.is_editor()) WITH CHECK (NOT public.is_editor());

DROP POLICY IF EXISTS "auth_delete_site_settings_church" ON site_settings_church;
CREATE POLICY "auth_delete_site_settings_church" ON site_settings_church FOR DELETE
  TO authenticated USING (NOT public.is_editor());

DROP POLICY IF EXISTS "auth_read_activity_log" ON activity_log_church;
CREATE POLICY "auth_read_activity_log" ON activity_log_church FOR SELECT
  TO authenticated USING (NOT public.is_editor());
