/*
# Weekly email: clearer sections, events before the podcast

Each part of the weekly email is now its own white card with a colored top edge on a soft background: the message
(red), what is coming up this week (yellow), and the Shine podcast (dark green). Events now come before the podcast.
The podcast no longer shows a stray line of dashes when its description is only a divider, and a length like 00:38:00
shows as 38 min. Replaces build_weekly_email. Needs the earlier weekly email migrations. Safe to run more than once.
*/

CREATE OR REPLACE FUNCTION public.build_weekly_email(p_today date DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  today date := coalesce(p_today, (now() AT TIME ZONE 'America/New_York')::date);
  cfg record;
  s record;
  r record;
  ev record;
  thought text;
  blurb text;
  has_tr boolean;
  ep record;
  ep_meta text;
  ep_desc text;
  site text := 'https://www.urfellowship.com';
  body text := '';
  events_html text := '';
  more_html text := '';
  event_count integer := 0;
  when_txt text;
  tm text;
  subject text;
  sec_msg text := '';
  sec_shine text := '';
  sec_events text := '';
  happenings text;
BEGIN
  SELECT * INTO cfg FROM weekly_settings_church WHERE id = 1;

  SELECT * INTO s FROM sermons
  WHERE published <> 0 AND (publish_date IS NULL OR publish_date <= current_date)
  ORDER BY date DESC NULLS LAST, id DESC LIMIT 1;

  IF FOUND THEN
    -- The short summary: the saved one if it still matches the message, else write one with AI, else use the opening of the summary.
    -- With a transcript, the summary is written from it, so a one-line description does not make a one-line email.
    has_tr := EXISTS (SELECT 1 FROM sermon_transcripts_church t WHERE t.sermon_id = s.id AND btrim(coalesce(t.transcript, '')) <> '');
    IF btrim(coalesce(s.description, '')) <> '' OR has_tr THEN
      IF btrim(coalesce(s.weekly_blurb, '')) <> '' AND s.weekly_blurb_for = public.weekly_blurb_key(s.id) THEN
        blurb := s.weekly_blurb;
      ELSIF (has_tr OR length(btrim(s.description)) > 170) AND public.write_weekly_blurb(s.id) = 'ok' THEN
        SELECT weekly_blurb INTO blurb FROM sermons WHERE id = s.id;
      END IF;
      IF blurb IS NULL THEN blurb := public.urf_short_text(s.description, 170); END IF;
    END IF;
    thought := nullif(btrim(coalesce(s.weekly_thought, '')), '');
    IF thought IS NULL AND coalesce(cfg.include_thought, 1) = 1 THEN
      IF public.write_weekly_thought(s.id) = 'ok' THEN
        SELECT weekly_thought INTO thought FROM sermons WHERE id = s.id;
      END IF;
    END IF;
    IF coalesce(cfg.include_thought, 1) <> 1 THEN thought := NULL; END IF;

    sec_msg := '<div style="margin:20px 0 0;padding:22px 24px;background:#ffffff;border:1px solid #ddd6c4;border-radius:12px;border-top:5px solid #c74f2f">' || '<h2 style="font-family:Inter Tight,Arial,Helvetica,sans-serif;font-weight:bold;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#c74f2f;margin:0 0 8px">Our latest message</h2>'
      || '<p style="margin:0 0 4px;font-size:22px;line-height:1.25;font-weight:bold;font-family:Inter Tight,Arial,Helvetica,sans-serif">' || public.urf_html(coalesce(s.title, 'Our latest message')) || '</p>'
      || CASE WHEN btrim(coalesce(s.series, '') || coalesce(s.speaker, '')) <> '' THEN
           '<p style="margin:0 0 12px;color:#555;font-size:14px">' || public.urf_html(concat_ws(' · ', nullif(btrim(s.series), ''), nullif(btrim(s.speaker), ''))) || '</p>' ELSE '' END
      || CASE WHEN btrim(coalesce(blurb, '')) <> '' THEN '<p style="margin:0 0 16px">' || public.urf_html(blurb) || '</p>' ELSE '' END
      || '<p style="margin:0 0 8px"><a href="' || site || '/messages/' || s.id || '-' || coalesce(nullif(regexp_replace(regexp_replace(lower(coalesce(s.title, '')), '[^a-z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'), ''), 'page')
      || '" style="display:inline-block;background:#c74f2f;color:#ffffff;text-decoration:none;font-weight:bold;font-family:Inter Tight,Arial,Helvetica,sans-serif;padding:12px 20px;border-radius:8px">Watch or listen</a></p>';

    IF thought IS NOT NULL THEN
      sec_msg := sec_msg || '<div style="margin:22px 0 0;padding:18px 20px;background:#f4f1e8;border-radius:8px">'
        || '<p style="margin:0 0 6px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#c74f2f;font-weight:bold;font-family:Inter Tight,Arial,Helvetica,sans-serif">A thought for the week</p>'
        || '<p style="margin:0">' || public.urf_html(thought) || '</p></div>';
    END IF;

    FOR r IN
      SELECT id, title, series FROM sermons
      WHERE published <> 0 AND (publish_date IS NULL OR publish_date <= current_date) AND id <> s.id
      ORDER BY date DESC NULLS LAST, id DESC LIMIT 2
    LOOP
      more_html := more_html || '<li style="margin:0 0 6px"><a href="' || site || '/messages/' || r.id || '-' || coalesce(nullif(regexp_replace(regexp_replace(lower(coalesce(r.title, '')), '[^a-z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'), ''), 'page')
        || '" style="color:#c74f2f">' || public.urf_html(coalesce(r.title, 'Message')) || '</a>' || CASE WHEN btrim(coalesce(r.series, '')) <> '' THEN '<span style="color:#777"> · ' || public.urf_html(r.series) || '</span>' ELSE '' END || '</li>';
    END LOOP;
    IF more_html <> '' THEN
      sec_msg := sec_msg || '<div style="margin:22px 0 0;padding:16px 0 0;border-top:1px solid #e6e0d0"></div><h2 style="font-family:Inter Tight,Arial,Helvetica,sans-serif;font-weight:bold;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#c74f2f;margin:0 0 8px">Missed one?</h2><ul style="margin:0;padding-left:20px">' || more_html || '</ul>';
    END IF;
    sec_msg := sec_msg || '</div>';
  END IF;

  -- The Shine podcast episode from the past ten days.
  SELECT * INTO ep FROM podcast_episodes_church
  WHERE show_slug = 'shine' AND published <> 0 AND published_at IS NOT NULL
    AND (published_at AT TIME ZONE 'America/New_York')::date BETWEEN today - 10 AND today
  ORDER BY published_at DESC LIMIT 1;
  IF FOUND THEN
    ep_meta := concat_ws(' · ',
      to_char(ep.published_at AT TIME ZONE 'America/New_York', 'FMMonth FMDD'),
      CASE
        WHEN ep.duration ~ '^\d+$' THEN CASE WHEN ep.duration::int >= 3600 THEN (ep.duration::int / 3600)::text || ' hr ' ELSE '' END || ((ep.duration::int % 3600) / 60)::text || ' min'
        WHEN ep.duration ~ '^\d+:\d+(:\d+)?$' THEN CASE WHEN split_part(ep.duration, ':', 3) <> '' THEN CASE WHEN split_part(ep.duration, ':', 1)::int > 0 THEN split_part(ep.duration, ':', 1)::int::text || ' hr ' ELSE '' END || split_part(ep.duration, ':', 2)::int::text || ' min' ELSE split_part(ep.duration, ':', 1)::int::text || ' min' END
        ELSE NULL END);
    ep_desc := public.urf_short_text(regexp_replace(regexp_replace(coalesce(ep.description, ''), '<[^>]+>', ' ', 'g'), '(^|\s)[-_=*—–]{3,}(\s|$)', ' ', 'g'), 280);
    IF ep_desc !~ '[A-Za-z]{3}' THEN ep_desc := ''; END IF;
    sec_shine := '<div style="margin:20px 0 0;padding:22px 24px;background:#ffffff;border:1px solid #ddd6c4;border-radius:12px;border-top:5px solid #2a3834">' || '<h2 style="font-family:Inter Tight,Arial,Helvetica,sans-serif;font-weight:bold;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#c74f2f;margin:0 0 8px">On the Shine podcast</h2>'
      || '<p style="font-family:Inter Tight,Arial,Helvetica,sans-serif;font-weight:bold;margin:0 0 2px;font-size:20px;line-height:1.25">' || public.urf_html(ep.title) || '</p>'
      || CASE WHEN ep_meta <> '' THEN '<p style="margin:0 0 10px;color:#555;font-size:14px">' || public.urf_html(ep_meta) || '</p>' ELSE '' END
      || CASE WHEN ep_desc <> '' THEN '<p style="margin:0 0 12px">' || public.urf_html(ep_desc) || '</p>' ELSE '' END
      || '<p style="margin:0"><a href="' || site || '/shine" style="color:#c74f2f;font-family:Inter Tight,Arial,Helvetica,sans-serif;font-weight:bold">Listen to this episode</a></p></div>';
  END IF;

  -- Events in the next seven days, soonest first.
  FOR ev IN
    SELECT x.* FROM (
      SELECT e.*, public.urf_next_event_date(e, today) AS next_day
      FROM urf_events_church e
      WHERE e.hidden = 0 AND NOT (e.is_recurring AND e.recurrence_type = 'date_range' AND e.event_date < today)
    ) x
    WHERE x.next_day IS NOT NULL AND x.next_day <= today + 6
    ORDER BY x.next_day, x.event_time NULLS LAST, x.title
  LOOP
    event_count := event_count + 1;
    tm := public.urf_clock(ev.event_time);
    when_txt := to_char(ev.next_day, 'FMDay, FMMonth FMDD') || CASE WHEN tm <> '' THEN ' at ' || tm ELSE '' END;
    events_html := events_html || '<tr><td style="padding:0 0 14px"><p style="margin:0;font-weight:bold;font-family:Inter Tight,Arial,Helvetica,sans-serif">' || public.urf_html(ev.title) || '</p>'
      || '<p style="margin:2px 0 0;color:#555;font-size:14px">' || public.urf_html(when_txt) || CASE WHEN btrim(coalesce(ev.location, '')) <> '' THEN ' · ' || public.urf_html(ev.location) ELSE '' END || '</p></td></tr>';
  END LOOP;
  IF event_count > 0 THEN
    sec_events := '<div style="margin:20px 0 0;padding:22px 24px;background:#ffffff;border:1px solid #ddd6c4;border-radius:12px;border-top:5px solid #eaa235">' || '<h2 style="font-family:Inter Tight,Arial,Helvetica,sans-serif;font-weight:bold;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#c74f2f;margin:0 0 12px">Coming up this week</h2>'
      || '<table style="border-collapse:collapse;width:100%">' || events_html || '</table>'
      || '<p style="margin:0"><a href="' || site || '/events" style="color:#c74f2f">See all events</a></p></div>';
  ELSE
    sec_events := '<div style="margin:20px 0 0;padding:22px 24px;background:#ffffff;border:1px solid #ddd6c4;border-radius:12px;border-top:5px solid #eaa235">' || '<h2 style="font-family:Inter Tight,Arial,Helvetica,sans-serif;font-weight:bold;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#c74f2f;margin:0 0 8px">Coming up this week</h2>'
      || '<p style="margin:0">We gather Sundays at 10:30am, with classes at 9:30am. <a href="' || site || '/events" style="color:#c74f2f">See all events</a></p></div>';
  END IF;

  happenings := '<p style="margin:22px 0 0;padding:0 4px">Looking for announcements? You can find all of them in <a href="https://urf.life/#/announcements" style="color:#c74f2f">The Happenings</a>.</p>';
  -- Order: the message, what is coming up, then the podcast.
  body := sec_msg || sec_events || sec_shine || happenings;

  subject := CASE WHEN s.id IS NOT NULL AND btrim(coalesce(s.title, '')) <> '' THEN left('This week at URF: ' || btrim(s.title), 190) ELSE 'This week at URF' END;

  RETURN jsonb_build_object(
    'subject', subject,
    'html',
      '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link href="https://fonts.googleapis.com/css2?family=Aleo:wght@400;700&family=Inter+Tight:wght@700&display=swap" rel="stylesheet"></head><body style="margin:0;padding:16px;background:#f1ede2"><div style="font-family:Aleo,Georgia,Cambria,Times New Roman,serif;font-size:16px;line-height:1.55;color:#1e2522;max-width:560px">'
      || '<p style="margin:0 0 4px;font-size:13px;color:#777">' || to_char(today, 'FMMonth FMDD, YYYY') || '</p>'
      || '<h1 style="font-family:Inter Tight,Arial,Helvetica,sans-serif;font-weight:bold;margin:0 0 16px;font-size:26px;line-height:1.2">This week at URF</h1>'
      || '<p style="margin:0">Hey {{first_name}}, here is what is happening this week at Upper Room Fellowship.</p>'
      || body
      || '<hr style="border:0;border-top:1px solid #d9d2c0;margin:28px 0 12px">'
      || '<p style="font-size:12px;color:#666;line-height:1.5;margin:0">You are getting this because you signed up for the weekly email from Upper Room Fellowship, 500 Sponseller Road, Columbiana, Ohio 44408. '
      || '<a href="' || site || '/unsubscribe?list=weekly&amp;t={{token}}" style="color:#666">Unsubscribe</a></p></div></body></html>',
    'sermon_id', s.id,
    'blurb', blurb,
    'has_thought', thought IS NOT NULL,
    'event_count', event_count
  );
END
$$;
REVOKE ALL ON FUNCTION public.build_weekly_email(date) FROM PUBLIC, anon, authenticated;
