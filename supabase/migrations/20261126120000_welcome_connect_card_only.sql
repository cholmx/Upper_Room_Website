/*
  Only the Connect Card starts the welcome emails. A contact form message sends the staff notice only.
  People already added from the contact form stay where they are; remove them in the Welcome List if needed.
*/

CREATE OR REPLACE FUNCTION public.queue_form_emails()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  cfg record;
  rows_html text := '';
  kv record;
  label text;
  pending integer;
  joined_recent integer;
BEGIN
  BEGIN
    SELECT * INTO cfg FROM email_settings_church ORDER BY id LIMIT 1;
    IF NOT FOUND OR btrim(coalesce(cfg.notify_email, '')) = '' THEN RETURN NEW; END IF;

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

    -- Only the Connect Card starts the welcome series, at most 25 people an hour.
    IF NEW.form_type = 'connect' AND cfg.welcome_enabled = 1 AND NEW.email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' THEN
      SELECT count(*) INTO joined_recent FROM welcome_contacts_church WHERE source = 'Connect Card' AND created_at > now() - interval '1 hour';
      IF joined_recent < 25 THEN
        PERFORM public.enroll_welcome_contact(NEW.name, NEW.email, NEW.phone, 'Connect Card');
      END IF;
    END IF;
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'Form email was not queued: %', SQLERRM;
  END;
  RETURN NEW;
END
$$;
REVOKE ALL ON FUNCTION public.queue_form_emails() FROM PUBLIC, anon, authenticated;
