/*
# Email with Resend

1. What it does
- When someone sends a form on the website, a short notice goes to the church's staff address, so nobody has to
  check the admin to find out. The reply-to on the notice is the visitor, so staff can just hit Reply.
- When someone fills out the Connect Card, they also get a short welcome email (at most one a day to the same
  address, and it can be turned off).
- Nothing is sent from the visitor's browser and no key is ever shown on the site. Emails wait in a list
  (email_outbox_church), and a job that runs every minute sends them through Resend and records the result.
  A failed send is tried again up to three times, and the reason is kept so it can be read in the admin.

2. Tables
- email_settings_church: one row, only signed-in staff can see or change it. Columns: from_address (a sender on
  a domain verified in Resend), notify_email (where form notices go), welcome_enabled (1 or 0).
- email_outbox_church: every email: who, subject, status (pending, sent or failed), error and time. Staff can read it.

3. Functions
- queue_form_emails(): a trigger on form_submissions_church. It never blocks a form from being saved.
- process_email_outbox(): sends waiting emails. Runs every minute. Only the database itself may run it.
- send_test_email(to_address): lets signed-in staff send a test email and see the result at once.

4. The key
- The Resend API key is read from the Supabase Vault, under the name resend_api_key. It is never stored in a table.

Needs the "http" and "pg_cron" extensions. Safe to run more than once.
*/

CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE TABLE IF NOT EXISTS public.email_settings_church (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  from_address text NOT NULL DEFAULT 'Upper Room Fellowship <info@urfellowship.com>',
  notify_email text NOT NULL DEFAULT 'info@urfellowship.com',
  welcome_enabled integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT email_settings_from_len CHECK (char_length(from_address) <= 200),
  CONSTRAINT email_settings_notify_len CHECK (char_length(notify_email) <= 200)
);
INSERT INTO public.email_settings_church (from_address)
SELECT 'Upper Room Fellowship <info@urfellowship.com>' WHERE NOT EXISTS (SELECT 1 FROM public.email_settings_church);

CREATE TABLE IF NOT EXISTS public.email_outbox_church (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  kind text NOT NULL DEFAULT 'notice',
  to_email text NOT NULL,
  reply_to text,
  subject text NOT NULL,
  html text NOT NULL,
  related_id bigint,
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  CONSTRAINT email_outbox_status CHECK (status IN ('pending', 'sent', 'failed'))
);
CREATE INDEX IF NOT EXISTS email_outbox_pending_idx ON public.email_outbox_church (status, id);

ALTER TABLE public.email_settings_church ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_outbox_church ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.email_settings_church, public.email_outbox_church FROM anon;
GRANT SELECT, UPDATE ON public.email_settings_church TO authenticated;
GRANT SELECT, DELETE ON public.email_outbox_church TO authenticated;

DROP POLICY IF EXISTS auth_all_email_settings ON public.email_settings_church;
CREATE POLICY auth_all_email_settings ON public.email_settings_church FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS auth_all_email_outbox ON public.email_outbox_church;
CREATE POLICY auth_all_email_outbox ON public.email_outbox_church FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Text made safe to put inside an email.
CREATE OR REPLACE FUNCTION public.urf_html(t text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT replace(replace(replace(replace(replace(coalesce(t, ''), '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), '"', '&quot;'), '''', '&#39;')
$$;

CREATE OR REPLACE FUNCTION public.queue_form_emails()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  cfg record;
  rows_html text := '';
  kv record;
  label text;
  first_name text;
  welcome text;
  pending integer;
BEGIN
  BEGIN
    SELECT * INTO cfg FROM email_settings_church ORDER BY id LIMIT 1;
    IF NOT FOUND OR btrim(coalesce(cfg.notify_email, '')) = '' THEN RETURN NEW; END IF;

    -- A flood of submissions never becomes a flood of emails.
    SELECT count(*) INTO pending FROM email_outbox_church WHERE status = 'pending';
    IF pending > 200 THEN RETURN NEW; END IF;

    label := CASE NEW.form_type
      WHEN 'connect' THEN 'Connect Card' WHEN 'contact' THEN 'Contact message' WHEN 'sozo' THEN 'Sozo inquiry'
      WHEN 'generosity' THEN 'Generosity story' ELSE initcap(NEW.form_type) END;

    rows_html := rows_html || '<tr><td style="padding:4px 12px 4px 0;color:#555">Name</td><td>' || public.urf_html(NEW.name) || '</td></tr>';
    IF btrim(coalesce(NEW.email, '')) <> '' THEN rows_html := rows_html || '<tr><td style="padding:4px 12px 4px 0;color:#555">Email</td><td>' || public.urf_html(NEW.email) || '</td></tr>'; END IF;
    IF btrim(coalesce(NEW.phone, '')) <> '' THEN rows_html := rows_html || '<tr><td style="padding:4px 12px 4px 0;color:#555">Phone</td><td>' || public.urf_html(NEW.phone) || '</td></tr>'; END IF;
    FOR kv IN SELECT key, value FROM jsonb_each_text(coalesce(NEW.data, '{}'::jsonb)) LOOP
      rows_html := rows_html || '<tr><td style="padding:4px 12px 4px 0;color:#555;vertical-align:top">' || public.urf_html(initcap(replace(kv.key, '_', ' '))) || '</td><td style="white-space:pre-wrap">' || public.urf_html(kv.value) || '</td></tr>';
    END LOOP;

    INSERT INTO email_outbox_church (kind, to_email, reply_to, subject, html, related_id)
    VALUES (
      'notice', cfg.notify_email,
      CASE WHEN NEW.email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' THEN NEW.email END,
      left(label || ' from ' || coalesce(nullif(btrim(NEW.name), ''), 'the website'), 200),
      '<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#1e2522"><p>A new <strong>' || public.urf_html(label) || '</strong> was sent on the website.</p><table style="border-collapse:collapse;font-size:15px">' || rows_html || '</table><p style="color:#555;font-size:13px">Reply to this email to answer them directly. It is also saved under Form Submissions in the admin.</p></div>',
      NEW.id
    );

    -- A welcome email for the Connect Card, at most one a day to the same address.
    IF NEW.form_type = 'connect' AND cfg.welcome_enabled = 1 AND NEW.email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'
       AND NOT EXISTS (SELECT 1 FROM email_outbox_church WHERE kind = 'welcome' AND lower(to_email) = lower(NEW.email) AND created_at > now() - interval '1 day') THEN
      first_name := split_part(btrim(coalesce(NEW.name, '')), ' ', 1);
      welcome := '<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.55;color:#1e2522;max-width:560px">'
        || '<p>Hi' || CASE WHEN first_name <> '' THEN ' ' || public.urf_html(first_name) ELSE '' END || ',</p>'
        || '<p>Thank you for filling out our Connect Card. We are glad you are thinking about joining us.</p>'
        || '<p><strong>Sundays</strong><br>Adult and kids classes begin at 9:30am. Worship starts at 10:30am.<br>500 Sponseller Road, Columbiana, Ohio 44408</p>'
        || '<p>Kids from birth through 5th grade have their own programs, and you are welcome to come just as you are.</p>'
        || '<p>A member of our welcome team will be in touch within 48 hours. If you have a question before then, just reply to this email.</p>'
        || '<p><a href="https://www.urfellowship.com/plan-your-visit" style="color:#c74f2f">See what a Sunday looks like</a></p>'
        || '<p>Upper Room Fellowship</p></div>';
      INSERT INTO email_outbox_church (kind, to_email, reply_to, subject, html, related_id)
      VALUES ('welcome', NEW.email, cfg.notify_email, 'Welcome to Upper Room Fellowship', welcome, NEW.id);
    END IF;
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'Form email was not queued: %', SQLERRM;
  END;
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS queue_form_emails_trg ON public.form_submissions_church;
CREATE TRIGGER queue_form_emails_trg AFTER INSERT ON public.form_submissions_church
  FOR EACH ROW EXECUTE FUNCTION public.queue_form_emails();

-- Sends waiting emails through Resend.
CREATE OR REPLACE FUNCTION public.process_email_outbox()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, vault
AS $$
DECLARE
  k text;
  cfg record;
  r record;
  resp extensions.http_response;
  body jsonb;
  sent integer := 0;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM email_outbox_church WHERE status = 'pending' AND attempts < 3) THEN RETURN 0; END IF;

  SELECT decrypted_secret INTO k FROM vault.decrypted_secrets WHERE name = 'resend_api_key' LIMIT 1;
  IF k IS NULL OR btrim(k) = '' THEN
    UPDATE email_outbox_church SET error = 'No Resend key is stored in the database yet (Vault name resend_api_key).' WHERE status = 'pending' AND error IS DISTINCT FROM 'No Resend key is stored in the database yet (Vault name resend_api_key).';
    RETURN 0;
  END IF;
  SELECT * INTO cfg FROM email_settings_church ORDER BY id LIMIT 1;

  FOR r IN SELECT * FROM email_outbox_church WHERE status = 'pending' AND attempts < 3 ORDER BY id LIMIT 10 LOOP
    body := jsonb_build_object('from', cfg.from_address, 'to', jsonb_build_array(r.to_email), 'subject', r.subject, 'html', r.html);
    IF r.reply_to IS NOT NULL THEN body := body || jsonb_build_object('reply_to', r.reply_to); END IF;
    BEGIN
      PERFORM extensions.http_set_curlopt('CURLOPT_TIMEOUT', '20');
      resp := extensions.http((
        'POST', 'https://api.resend.com/emails',
        ARRAY[extensions.http_header('Authorization', 'Bearer ' || k)],
        'application/json', body::text
      )::extensions.http_request);
    EXCEPTION WHEN others THEN
      UPDATE email_outbox_church SET attempts = attempts + 1, error = left('The request could not be sent: ' || SQLERRM, 400),
        status = CASE WHEN attempts + 1 >= 3 THEN 'failed' ELSE 'pending' END WHERE id = r.id;
      CONTINUE;
    END;
    IF resp.status IN (200, 201, 202) THEN
      UPDATE email_outbox_church SET status = 'sent', sent_at = now(), attempts = attempts + 1, error = NULL WHERE id = r.id;
      sent := sent + 1;
    ELSIF resp.status = 429 OR resp.status >= 500 THEN
      UPDATE email_outbox_church SET attempts = attempts + 1, error = left('Resend answered ' || resp.status::text || ': ' || coalesce(resp.content, ''), 400),
        status = CASE WHEN attempts + 1 >= 3 THEN 'failed' ELSE 'pending' END WHERE id = r.id;
    ELSE
      UPDATE email_outbox_church SET attempts = attempts + 1, status = 'failed', error = left('Resend answered ' || resp.status::text || ': ' || coalesce(resp.content, ''), 400) WHERE id = r.id;
    END IF;
  END LOOP;
  RETURN sent;
END
$$;

REVOKE ALL ON FUNCTION public.process_email_outbox() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.queue_form_emails() FROM PUBLIC, anon, authenticated;

-- A test email from the admin, sent and reported at once.
CREATE OR REPLACE FUNCTION public.send_test_email(to_address text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  new_id bigint;
  row_after record;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Please sign in.'; END IF;
  IF to_address !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' THEN RETURN jsonb_build_object('status', 'failed', 'error', 'That does not look like an email address.'); END IF;
  INSERT INTO email_outbox_church (kind, to_email, subject, html)
  VALUES ('test', to_address, 'Test email from the Upper Room Fellowship website',
    '<div style="font-family:Arial,sans-serif;font-size:16px;color:#1e2522"><p>This is a test. If you can read it, email from the website is working.</p></div>')
  RETURNING id INTO new_id;
  PERFORM public.process_email_outbox();
  SELECT status, error INTO row_after FROM email_outbox_church WHERE id = new_id;
  RETURN jsonb_build_object('status', row_after.status, 'error', row_after.error);
END
$$;
REVOKE ALL ON FUNCTION public.send_test_email(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.send_test_email(text) TO authenticated;

-- Every minute.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'process-email-outbox') THEN
    PERFORM cron.unschedule('process-email-outbox');
  END IF;
  PERFORM cron.schedule('process-email-outbox', '* * * * *', 'SELECT public.process_email_outbox()');
END $$;
