/*
# Make the activity log append-only

1. Security
- Drops the UPDATE and DELETE policies on `activity_log_church` and revokes the
  matching table privileges from `anon` and `authenticated`.
- The log remains insertable by any signed-in user and readable by admins.

2. Notes
- The app never updates or deletes log rows, so this removes capability that existed
  only as a way for a signed-in user to erase the record of their own edits.
*/

DROP POLICY IF EXISTS "auth_update_activity_log" ON activity_log_church;
DROP POLICY IF EXISTS "auth_delete_activity_log" ON activity_log_church;

REVOKE UPDATE, DELETE, TRUNCATE ON activity_log_church FROM anon, authenticated;
