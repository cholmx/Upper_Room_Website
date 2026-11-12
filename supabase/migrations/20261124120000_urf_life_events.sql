/*
# Events from urf.life

The church family's site, urf.life, keeps the events. This copies its published events into this site's database every
hour, so the Events page here loads fast, works if urf.life is down, and can be read by search engines.

1. events_source_church: where to read the events from (the urf.life address and its public read key, the same one
   any visitor's browser uses on urf.life). Only signed-in staff can read it.
2. urf_events_church: the copy of each published event, with its dates, time, place, how often it repeats, a link, and a
   "hidden" switch so staff can keep one off this website without changing urf.life. A re-sync never changes "hidden".
   Visitors can read events that are not hidden.
3. sync_urf_events(): reads the events from urf.life and updates the copy. Events that are no longer published there
   are removed here. If urf.life cannot be reached, nothing is changed. It runs every hour, and staff can run it from
   the admin with sync_events_now().

Contact names and phone numbers kept on urf.life are not copied. Needs the "http" and "pg_cron" extensions.
Safe to run more than once.
*/

CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE TABLE IF NOT EXISTS public.events_source_church (
  id integer PRIMARY KEY DEFAULT 1,
  base_url text NOT NULL,
  api_key text NOT NULL,
  last_synced_at timestamptz,
  last_result text,
  CONSTRAINT events_source_one_row CHECK (id = 1)
);
INSERT INTO public.events_source_church (id, base_url, api_key)
VALUES (1, 'https://pdwgghcuvglmbbpeabnn.supabase.co', $k$eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkd2dnaGN1dmdsbWJicGVhYm5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NjQ2MDgsImV4cCI6MjA3ODU0MDYwOH0.5UGArWIze6KdeVwGoOV9byytrflpFtGej47Awc3XSvU$k$)
ON CONFLICT (id) DO NOTHING;
ALTER TABLE public.events_source_church ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.events_source_church FROM anon;
GRANT SELECT ON public.events_source_church TO authenticated;
DROP POLICY IF EXISTS auth_read_events_source ON public.events_source_church;
CREATE POLICY auth_read_events_source ON public.events_source_church FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.urf_events_church (
  id text PRIMARY KEY,
  title text NOT NULL,
  summary text,
  details text,
  category text,
  scope text,
  ministry text,
  location text,
  event_date date,
  event_time text,
  end_time text,
  is_recurring boolean NOT NULL DEFAULT false,
  recurrence_type text,
  recurrence_day text,
  recurrence_week text,
  recurrence_label text,
  recurrence_end date,
  link text,
  needs_signup boolean NOT NULL DEFAULT false,
  hidden integer NOT NULL DEFAULT 0,
  synced_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.urf_events_church ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.urf_events_church FROM anon;
GRANT SELECT ON public.urf_events_church TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.urf_events_church TO authenticated;
DROP POLICY IF EXISTS anon_read_events ON public.urf_events_church;
CREATE POLICY anon_read_events ON public.urf_events_church FOR SELECT TO anon USING (hidden = 0);
DROP POLICY IF EXISTS auth_all_events ON public.urf_events_church;
CREATE POLICY auth_all_events ON public.urf_events_church FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.sync_urf_events()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  src record;
  resp extensions.http_response;
  arr jsonb;
  n integer := 0;
  url text;
BEGIN
  SELECT * INTO src FROM events_source_church WHERE id = 1;
  IF NOT FOUND THEN RETURN -1; END IF;
  url := rtrim(src.base_url, '/') || '/rest/v1/staff_announcements_portal123?select=id,title,description,body,category,scope,ministry,event_date,event_time,end_time,event_location,is_recurring,recurrence_type,recurrence_day,recurrence_week_of_month,recurrence_label,recurrence_end_date,link,needs_signup&happening_type=eq.event&is_published=eq.true&order=event_date.asc.nullslast';
  IF NOT public.urf_url_is_public(url) THEN
    UPDATE events_source_church SET last_result = 'That address is not allowed.' WHERE id = 1;
    RETURN -1;
  END IF;
  BEGIN
    PERFORM extensions.http_set_curlopt('CURLOPT_TIMEOUT', '30');
    resp := extensions.http(('GET', url, ARRAY[extensions.http_header('apikey', src.api_key), extensions.http_header('Authorization', 'Bearer ' || src.api_key), extensions.http_header('User-Agent', 'UpperRoomFellowshipSite/1.0')], NULL, NULL)::extensions.http_request);
  EXCEPTION WHEN others THEN
    UPDATE events_source_church SET last_result = left('Could not reach urf.life: ' || SQLERRM, 300) WHERE id = 1;
    RETURN -2;
  END;
  IF resp.status <> 200 THEN
    UPDATE events_source_church SET last_result = 'urf.life answered ' || resp.status::text WHERE id = 1;
    RETURN -3;
  END IF;
  BEGIN
    arr := resp.content::jsonb;
    IF jsonb_typeof(arr) <> 'array' THEN RAISE EXCEPTION 'not a list'; END IF;
  EXCEPTION WHEN others THEN
    UPDATE events_source_church SET last_result = 'urf.life did not answer with a list of events.' WHERE id = 1;
    RETURN -4;
  END;

  INSERT INTO urf_events_church (id, title, summary, details, category, scope, ministry, location, event_date, event_time, end_time,
    is_recurring, recurrence_type, recurrence_day, recurrence_week, recurrence_label, recurrence_end, link, needs_signup, synced_at)
  SELECT e.id::text, left(e.title, 300), left(e.description, 2000), left(e.body, 6000), e.category, e.scope, nullif(btrim(e.ministry), ''),
    nullif(btrim(e.event_location), ''), e.event_date, nullif(btrim(e.event_time), ''), nullif(btrim(e.end_time), ''),
    coalesce(e.is_recurring, false), e.recurrence_type, e.recurrence_day, e.recurrence_week_of_month, nullif(btrim(e.recurrence_label), ''),
    e.recurrence_end_date, CASE WHEN e.link ~* '^https?://' THEN btrim(e.link) END, coalesce(e.needs_signup, false), now()
  FROM jsonb_to_recordset(arr) AS e(id uuid, title text, description text, body text, category text, scope text, ministry text,
    event_date date, event_time text, end_time text, event_location text, is_recurring boolean, recurrence_type text, recurrence_day text,
    recurrence_week_of_month text, recurrence_label text, recurrence_end_date date, link text, needs_signup boolean)
  WHERE e.title IS NOT NULL
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title, summary = EXCLUDED.summary, details = EXCLUDED.details, category = EXCLUDED.category, scope = EXCLUDED.scope,
    ministry = EXCLUDED.ministry, location = EXCLUDED.location, event_date = EXCLUDED.event_date, event_time = EXCLUDED.event_time,
    end_time = EXCLUDED.end_time, is_recurring = EXCLUDED.is_recurring, recurrence_type = EXCLUDED.recurrence_type,
    recurrence_day = EXCLUDED.recurrence_day, recurrence_week = EXCLUDED.recurrence_week, recurrence_label = EXCLUDED.recurrence_label,
    recurrence_end = EXCLUDED.recurrence_end, link = EXCLUDED.link, needs_signup = EXCLUDED.needs_signup, synced_at = now();
  GET DIAGNOSTICS n = ROW_COUNT;

  -- Events no longer published on urf.life are removed here, unless the list came back empty (probably a problem there).
  IF jsonb_array_length(arr) > 0 THEN
    DELETE FROM urf_events_church WHERE id NOT IN (SELECT (x ->> 'id') FROM jsonb_array_elements(arr) x);
  END IF;
  UPDATE events_source_church SET last_synced_at = now(), last_result = 'OK: ' || n::text || ' events' WHERE id = 1;
  RETURN n;
END
$$;
REVOKE ALL ON FUNCTION public.sync_urf_events() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.sync_events_now()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE n integer; r text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Please sign in.'; END IF;
  n := public.sync_urf_events();
  SELECT last_result INTO r FROM events_source_church WHERE id = 1;
  RETURN jsonb_build_object('count', n, 'result', r);
END
$$;
REVOKE ALL ON FUNCTION public.sync_events_now() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sync_events_now() TO authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'sync-urf-events') THEN
    PERFORM cron.unschedule('sync-urf-events');
  END IF;
  PERFORM cron.schedule('sync-urf-events', '12 * * * *', 'SELECT public.sync_urf_events()');
END $$;

-- Copy the events once now, so the page has them without waiting for the hour.
DO $$
BEGIN
  PERFORM public.sync_urf_events();
EXCEPTION WHEN others THEN
  RAISE NOTICE 'First events sync skipped: %', SQLERRM;
END $$;
