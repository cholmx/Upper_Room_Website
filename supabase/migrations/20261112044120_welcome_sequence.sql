CREATE EXTENSION IF NOT EXISTS pg_cron;

ALTER TABLE public.email_outbox_church ADD COLUMN IF NOT EXISTS headers jsonb;

CREATE TABLE IF NOT EXISTS public.welcome_steps_church (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  step_number integer NOT NULL,
  delay_days integer NOT NULL DEFAULT 0,
  subject text NOT NULL,
  body text NOT NULL,
  published integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT welcome_steps_delay CHECK (delay_days >= 0 AND delay_days <= 365),
  CONSTRAINT welcome_steps_subject_len CHECK (char_length(subject) <= 200),
  CONSTRAINT welcome_steps_body_len CHECK (char_length(body) <= 20000)
);

CREATE TABLE IF NOT EXISTS public.welcome_contacts_church (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text,
  email text NOT NULL,
  phone text,
  source text NOT NULL DEFAULT 'Paper card',
  status text NOT NULL DEFAULT 'active',
  next_step integer NOT NULL DEFAULT 1,
  started_at timestamptz NOT NULL DEFAULT now(),
  next_send_at timestamptz NOT NULL DEFAULT now(),
  last_sent_at timestamptz,
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT welcome_contacts_status CHECK (status IN ('active', 'paused', 'finished', 'unsubscribed')),
  CONSTRAINT welcome_contacts_email_format CHECK (email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' AND char_length(email) <= 200),
  CONSTRAINT welcome_contacts_name_len CHECK (name IS NULL OR char_length(name) <= 200)
);
CREATE UNIQUE INDEX IF NOT EXISTS welcome_contacts_email_idx ON public.welcome_contacts_church (lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS welcome_contacts_token_idx ON public.welcome_contacts_church (token);
CREATE INDEX IF NOT EXISTS welcome_contacts_due_idx ON public.welcome_contacts_church (status, next_send_at);

ALTER TABLE public.welcome_steps_church ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.welcome_contacts_church ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.welcome_steps_church, public.welcome_contacts_church FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.welcome_steps_church, public.welcome_contacts_church TO authenticated;
DROP POLICY IF EXISTS auth_all_welcome_steps ON public.welcome_steps_church;
CREATE POLICY auth_all_welcome_steps ON public.welcome_steps_church FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS auth_all_welcome_contacts ON public.welcome_contacts_church;
CREATE POLICY auth_all_welcome_contacts ON public.welcome_contacts_church FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO public.welcome_steps_church (step_number, delay_days, subject, body)
SELECT * FROM (VALUES
  (1, 0, $b$Welcome to Upper Room Fellowship$b$, $b$Hi {{first_name}},

Thank you for sharing your information with us. We are glad you are thinking about joining us.

Sundays
Adult and kids classes begin at 9:30am. Worship starts at 10:30am.
500 Sponseller Road, Columbiana, Ohio 44408

Kids from birth through 5th grade have their own programs, and you are welcome to come just as you are.

A member of our welcome team will be in touch within 48 hours. If you have a question before then, just reply to this email.

See what a Sunday looks like: https://www.urfellowship.com/plan-your-visit

Upper Room Fellowship$b$),
  (2, 3, $b$What a Sunday morning looks like$b$, $b$Hi {{first_name}},

In case it helps to know what to expect, here is a Sunday morning at Upper Room Fellowship.

9:30am: Adult and kids classes begin (optional).
10:30am: Worship begins. The music is contemporary, and the words and Scripture are on the screens, so you can follow along without a Bible.
After worship: A short coffee break. We never single out visitors or ask anyone to stand and introduce themselves.
Then: The message for adults and teens, and kids programs for children birth through 5th grade.
About 11:45am: The service ends, and our team is available to talk or pray with you.

Wear whatever is comfortable. We care much more about meeting you than about what you have on.

More about your first visit: https://www.urfellowship.com/plan-your-visit

Upper Room Fellowship$b$),
  (3, 7, $b$Finding your people$b$, $b$Hi {{first_name}},

Church is better with friends. Here are a few ways to find yours.

Sunday mornings at 9:30am: Adult Discipleship Training classes meet one hour before worship. Our welcome team can help you find the right one.

Wednesday evenings, 6:30 to 8:00pm: Adult enrichment classes such as marriage and parenting, junior high and high school youth groups, and childcare.

Read more about our classes: https://www.urfellowship.com/discipleship

If you would like help finding a place, reply to this email and we will point you in the right direction.

Upper Room Fellowship$b$),
  (4, 14, $b$Hear a message, and let us pray for you$b$, $b$Hi {{first_name}},

If you cannot make it on a Sunday, or you would like to hear more about what we teach, our messages are online.

Watch or listen to our messages: https://www.urfellowship.com/messages
The Shine podcast, conversations with people in our church family: https://www.urfellowship.com/shine

We would love to pray for you. If there is anything we can pray about, just reply to this email.

We hope to see you soon.

Upper Room Fellowship$b$)
) AS seed(step_number, delay_days, subject, body)
WHERE NOT EXISTS (SELECT 1 FROM public.welcome_steps_church);

-- Plain text from the admin, made into email HTML: safe characters, links, paragraphs and line breaks.
CREATE OR REPLACE FUNCTION public.urf_email_body_html(t text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  esc text;
  para text;
  out text := '';
BEGIN
  esc := public.urf_html(replace(coalesce(t, ''), E'\r', ''));
  esc := regexp_replace(esc, '(https?://[^\s<]+)', '<a href="\1" style="color:#c74f2f">\1</a>', 'g');
  FOREACH para IN ARRAY regexp_split_to_array(btrim(esc, E' \n'), E'\n[ \t]*\n+') LOOP
    IF btrim(para) <> '' THEN out := out || '<p style="margin:0 0 16px">' || replace(btrim(para, E' \n'), E'\n', '<br>') || '</p>'; END IF;
  END LOOP;
  RETURN out;
END
$$;

-- One welcome email, ready to send.
CREATE OR REPLACE FUNCTION public.urf_welcome_email_html(step_body text, person_name text, person_token uuid)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  first_name text := split_part(btrim(coalesce(person_name, '')), ' ', 1);
  txt text;
BEGIN
  txt := replace(coalesce(step_body, ''), '{{first_name}}', CASE WHEN first_name <> '' THEN first_name ELSE 'friend' END);
  RETURN '<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.55;color:#1e2522;max-width:560px">'
    || public.urf_email_body_html(txt)
    || '<hr style="border:0;border-top:1px solid #ddd;margin:24px 0 12px">'
    || '<p style="font-size:12px;color:#666;line-height:1.5;margin:0">You are getting this because you shared your contact information with Upper Room Fellowship, 500 Sponseller Road, Columbiana, Ohio 44408. '
    || '<a href="https://www.urfellowship.com/unsubscribe?t=' || person_token::text || '" style="color:#666">Unsubscribe</a></p></div>';
END
$$;

-- Adds a person to the series. A second add of the same address, or of someone who unsubscribed, does nothing.
CREATE OR REPLACE FUNCTION public.enroll_welcome_contact(p_name text, p_email text, p_phone text, p_source text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE n integer;
BEGIN
  IF p_email IS NULL OR p_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' THEN RETURN false; END IF;
  INSERT INTO welcome_contacts_church (name, email, phone, source)
  VALUES (left(btrim(coalesce(p_name, '')), 200), btrim(p_email), nullif(left(btrim(coalesce(p_phone, '')), 60), ''), coalesce(nullif(btrim(p_source), ''), 'Website'))
  ON CONFLICT (lower(email)) DO NOTHING;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n > 0;
END
$$;
REVOKE ALL ON FUNCTION public.enroll_welcome_contact(text, text, text, text) FROM PUBLIC, anon, authenticated;

-- Sends each email that is due. Runs every 15 minutes, and again right after someone joins.
CREATE OR REPLACE FUNCTION public.process_welcome_sequence()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c record;
  st record;
  nx record;
  queued integer := 0;
  pending integer;
BEGIN
  SELECT count(*) INTO pending FROM email_outbox_church WHERE status = 'pending';
  IF pending > 300 THEN RETURN 0; END IF;
  FOR c IN SELECT * FROM welcome_contacts_church WHERE status = 'active' AND next_send_at <= now() ORDER BY next_send_at LIMIT 50 LOOP
    SELECT * INTO st FROM welcome_steps_church WHERE published <> 0 AND step_number >= c.next_step ORDER BY step_number LIMIT 1;
    IF NOT FOUND THEN
      UPDATE welcome_contacts_church SET status = 'finished' WHERE id = c.id;
      CONTINUE;
    END IF;
    INSERT INTO email_outbox_church (kind, to_email, reply_to, subject, html, related_id, headers)
    VALUES (
      'sequence', c.email,
      (SELECT notify_email FROM email_settings_church ORDER BY id LIMIT 1),
      left(st.subject, 200),
      public.urf_welcome_email_html(st.body, c.name, c.token),
      c.id,
      jsonb_build_object('List-Unsubscribe', '<https://www.urfellowship.com/unsubscribe?t=' || c.token::text || '>')
    );
    queued := queued + 1;
    SELECT * INTO nx FROM welcome_steps_church WHERE published <> 0 AND step_number > st.step_number ORDER BY step_number LIMIT 1;
    IF NOT FOUND THEN
      UPDATE welcome_contacts_church SET status = 'finished', next_step = st.step_number + 1, last_sent_at = now() WHERE id = c.id;
    ELSE
      UPDATE welcome_contacts_church
      SET next_step = st.step_number + 1, last_sent_at = now(),
          next_send_at = greatest(now() + interval '1 hour', c.started_at + (nx.delay_days * interval '1 day'))
      WHERE id = c.id;
    END IF;
  END LOOP;
  RETURN queued;
END
$$;
REVOKE ALL ON FUNCTION public.process_welcome_sequence() FROM PUBLIC, anon, authenticated;

-- The one thing the public can run: leave the series from the link in an email.
CREATE OR REPLACE FUNCTION public.unsubscribe_welcome(p_token uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE n integer;
BEGIN
  UPDATE welcome_contacts_church SET status = 'unsubscribed' WHERE token = p_token AND status <> 'unsubscribed';
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN EXISTS (SELECT 1 FROM welcome_contacts_church WHERE token = p_token);
END
$$;
REVOKE ALL ON FUNCTION public.unsubscribe_welcome(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unsubscribe_welcome(uuid) TO anon, authenticated;

-- Adds many people at once, for example from a stack of paper contact cards.
CREATE OR REPLACE FUNCTION public.add_welcome_contacts(p_lines text, p_source text DEFAULT 'Paper card')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  line text;
  em text;
  rest text;
  ph text;
  nm text;
  added integer := 0;
  skipped integer := 0;
  invalid integer := 0;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Please sign in.'; END IF;
  FOREACH line IN ARRAY regexp_split_to_array(coalesce(p_lines, ''), E'\r?\n') LOOP
    line := btrim(line);
    IF line = '' THEN CONTINUE; END IF;
    em := (regexp_match(line, '([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})'))[1];
    IF em IS NULL THEN invalid := invalid + 1; CONTINUE; END IF;
    rest := replace(line, em, ' ');
    ph := (regexp_match(rest, '(\+?\d[\d\s().-]{6,}\d)'))[1];
    IF ph IS NOT NULL THEN rest := replace(rest, ph, ' '); END IF;
    nm := btrim(regexp_replace(rest, '[<>,;|\t]+', ' ', 'g'));
    nm := btrim(regexp_replace(nm, '\s+', ' ', 'g'));
    IF public.enroll_welcome_contact(nm, em, ph, coalesce(nullif(btrim(p_source), ''), 'Paper card')) THEN added := added + 1; ELSE skipped := skipped + 1; END IF;
  END LOOP;
  IF added > 0 THEN PERFORM public.process_welcome_sequence(); END IF;
  RETURN jsonb_build_object('added', added, 'skipped', skipped, 'invalid', invalid);
END
$$;
REVOKE ALL ON FUNCTION public.add_welcome_contacts(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_welcome_contacts(text, text) TO authenticated;

-- A new row added by hand in the admin starts at the first email right away.
CREATE OR REPLACE FUNCTION public.welcome_contact_added()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'active' THEN PERFORM public.process_welcome_sequence(); END IF;
  RETURN NULL;
END
$$;
REVOKE ALL ON FUNCTION public.welcome_contact_added() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS welcome_contact_added_trg ON public.welcome_contacts_church;
CREATE TRIGGER welcome_contact_added_trg AFTER INSERT ON public.welcome_contacts_church
  FOR EACH ROW EXECUTE FUNCTION public.welcome_contact_added();

-- Send any step to yourself to see how it looks.
CREATE OR REPLACE FUNCTION public.send_welcome_step_test(p_step_id bigint, p_to text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  st record;
  new_id bigint;
  after_row record;
  recent integer;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Please sign in.'; END IF;
  IF p_to !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' THEN RETURN jsonb_build_object('status', 'failed', 'error', 'That does not look like an email address.'); END IF;
  SELECT * INTO st FROM welcome_steps_church WHERE id = p_step_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('status', 'failed', 'error', 'That email is not in the series.'); END IF;
  SELECT count(*) INTO recent FROM email_outbox_church WHERE kind = 'test' AND created_at > now() - interval '1 hour';
  IF recent >= 10 THEN RETURN jsonb_build_object('status', 'failed', 'error', 'Too many test emails have been sent in the last hour. Please try again later.'); END IF;
  INSERT INTO email_outbox_church (kind, to_email, subject, html)
  VALUES ('test', p_to, '[Test] ' || left(st.subject, 190), public.urf_welcome_email_html(st.body, 'Friend', gen_random_uuid()))
  RETURNING id INTO new_id;
  PERFORM public.process_email_outbox();
  SELECT status, error INTO after_row FROM email_outbox_church WHERE id = new_id;
  RETURN jsonb_build_object('status', after_row.status, 'error', after_row.error);
END
$$;
REVOKE ALL ON FUNCTION public.send_welcome_step_test(bigint, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.send_welcome_step_test(bigint, text) TO authenticated;

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
    -- Someone who unsubscribed after an email was queued does not get it.
    IF r.kind = 'sequence' AND EXISTS (SELECT 1 FROM welcome_contacts_church w WHERE w.id = r.related_id AND w.status = 'unsubscribed') THEN
      UPDATE email_outbox_church SET status = 'failed', error = 'Not sent: the person unsubscribed.' WHERE id = r.id;
      CONTINUE;
    END IF;
    body := jsonb_build_object('from', cfg.from_address, 'to', jsonb_build_array(r.to_email), 'subject', r.subject, 'html', r.html);
    IF r.reply_to IS NOT NULL THEN body := body || jsonb_build_object('reply_to', r.reply_to); END IF;
    IF r.headers IS NOT NULL THEN body := body || jsonb_build_object('headers', r.headers); END IF;
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

-- Form entries: the notice to staff as before, and the Connect Card or contact form person joins the series.
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

    -- The Connect Card and the contact form start the welcome series, at most 25 people an hour,
    -- so the forms cannot be used as a mailer.
    IF NEW.form_type IN ('connect', 'contact') AND cfg.welcome_enabled = 1 AND NEW.email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' THEN
      SELECT count(*) INTO joined_recent FROM welcome_contacts_church WHERE source IN ('Connect Card', 'Contact form') AND created_at > now() - interval '1 hour';
      IF joined_recent < 25 THEN
        PERFORM public.enroll_welcome_contact(NEW.name, NEW.email, NEW.phone, CASE WHEN NEW.form_type = 'connect' THEN 'Connect Card' ELSE 'Contact form' END);
      END IF;
    END IF;
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'Form email was not queued: %', SQLERRM;
  END;
  RETURN NEW;
END
$$;
REVOKE ALL ON FUNCTION public.queue_form_emails() FROM PUBLIC, anon, authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'process-welcome-sequence') THEN
    PERFORM cron.unschedule('process-welcome-sequence');
  END IF;
  PERFORM cron.schedule('process-welcome-sequence', '*/15 * * * *', 'SELECT public.process_welcome_sequence()');
END $$;