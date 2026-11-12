-- F6: cap test emails at 10 per rolling hour so the admin test button cannot be
-- driven in a loop to mail an arbitrary address.

CREATE OR REPLACE FUNCTION public.send_test_email(to_address text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
new_id bigint;
row_after record;
recent integer;
BEGIN
IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Please sign in.'; END IF;
IF to_address !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' THEN RETURN jsonb_build_object('status', 'failed', 'error', 'That does not look like an email address.'); END IF;

SELECT count(*) INTO recent
FROM email_outbox_church
WHERE kind = 'test' AND created_at > now() - interval '1 hour';
IF recent >= 10 THEN
  RETURN jsonb_build_object('status', 'failed', 'error', 'Too many test emails have been sent in the last hour. Please try again later.');
END IF;

INSERT INTO email_outbox_church (kind, to_email, subject, html)
VALUES ('test', to_address, 'Test email from the Upper Room Fellowship website',
'<div style="font-family:Arial,sans-serif;font-size:16px;color:#1e2522"><p>This is a test. If you can read it, email from the website is working.</p></div>')
RETURNING id INTO new_id;
PERFORM public.process_email_outbox();
SELECT status, error INTO row_after FROM email_outbox_church WHERE id = new_id;
RETURN jsonb_build_object('status', row_after.status, 'error', row_after.error);
END
$function$;
