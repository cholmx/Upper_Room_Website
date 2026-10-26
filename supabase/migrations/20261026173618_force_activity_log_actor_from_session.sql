/*
# Record the signed-in account on every activity log entry

1. Security
- Adds a BEFORE INSERT trigger on `activity_log_church` that overwrites `actor` with
  the email from the verified session token, ignoring whatever the client sent.
- Falls back to the user id, then to 'unknown', when the token carries no email.

2. Notes
- `actor` was previously taken from the request body, so a signed-in user could
  attribute their own actions to somebody else.
*/

CREATE OR REPLACE FUNCTION public.set_activity_actor()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  claims jsonb;
BEGIN
  claims := coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb;
  NEW.actor := coalesce(
    nullif(claims ->> 'email', ''),
    nullif(claims ->> 'sub', ''),
    'unknown'
  );
  RETURN NEW;
END $$;

REVOKE EXECUTE ON FUNCTION public.set_activity_actor() FROM PUBLIC;

DROP TRIGGER IF EXISTS set_activity_actor_trg ON activity_log_church;
CREATE TRIGGER set_activity_actor_trg
  BEFORE INSERT ON activity_log_church
  FOR EACH ROW EXECUTE FUNCTION public.set_activity_actor();
