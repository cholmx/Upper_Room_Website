/*
# Team logins: admins and editors, enforced by the database

Until now every signed-in person could change everything through the Data API, and the "editor" limits only hid
buttons. This adds real roles that the database enforces.

1. Roles
- staff_roles_church: one row per team member (user_id, email, name, role). role is 'admin' or 'editor'.
  A person who signs in but has no row here has no access at all, even if they somehow create an account.
- Existing logins keep working: everyone who already has a login gets a row, as 'editor' if their login was marked
  editor before, otherwise as 'admin'. Remove or change people on the Team screen once Chris has signed in.
- is_admin(), is_staff() and my_staff_role() are the checks the rest of the database uses.

2. What each role can do
- Admins can do everything.
- Editors can use the Inbox (Form Submissions, Welcome List, Welcome Emails, Weekly Email) and Blog Posts, and upload
  photos for them. They cannot change anything else, and they cannot read private things like transcripts or the
  email log.
- This is enforced with restrictive row level security policies on every table, so it holds for the website, the admin,
  and anyone calling the Data API directly. Visitors who are not signed in are unaffected.

3. Functions
- Every staff-only database function now checks the role: the Inbox and Weekly Email ones accept editors, the rest are
  for admins only.

Inviting people and removing them is done by the staff-admin function (server side). Safe to run more than once.
*/

-- ===== Roles =====
CREATE TABLE IF NOT EXISTS public.staff_roles_church (
  user_id uuid PRIMARY KEY,
  email text NOT NULL,
  name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'editor',
  invited_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_invite_at timestamptz,
  CONSTRAINT staff_roles_role CHECK (role IN ('admin', 'editor')),
  CONSTRAINT staff_roles_email_format CHECK (email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' AND char_length(email) <= 200),
  CONSTRAINT staff_roles_name_len CHECK (char_length(name) <= 200)
);
CREATE UNIQUE INDEX IF NOT EXISTS staff_roles_email_idx ON public.staff_roles_church (lower(email));

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'staff_roles_user_fk') THEN
    ALTER TABLE public.staff_roles_church ADD CONSTRAINT staff_roles_user_fk FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Could not link staff_roles_church to auth.users: %', SQLERRM;
END $$;

CREATE OR REPLACE FUNCTION public.my_staff_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.staff_roles_church WHERE user_id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce((SELECT role = 'admin' FROM public.staff_roles_church WHERE user_id = auth.uid()), false)
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.staff_roles_church WHERE user_id = auth.uid() AND role IN ('admin', 'editor'))
$$;

REVOKE ALL ON FUNCTION public.my_staff_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_staff() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.my_staff_role() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff() TO anon, authenticated;

ALTER TABLE public.staff_roles_church ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.staff_roles_church FROM anon;
REVOKE ALL ON public.staff_roles_church FROM authenticated;
GRANT SELECT ON public.staff_roles_church TO authenticated;
DROP POLICY IF EXISTS staff_roles_read ON public.staff_roles_church;
CREATE POLICY staff_roles_read ON public.staff_roles_church FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());

-- Everyone who can sign in today keeps access (as admin, or editor if they were marked editor).
DO $$
BEGIN
  EXECUTE $q$
    INSERT INTO public.staff_roles_church (user_id, email, name, role, invited_by)
    SELECT u.id, lower(u.email), coalesce(nullif(u.raw_user_meta_data ->> 'name', ''), ''),
           CASE WHEN u.raw_app_meta_data ->> 'role' = 'editor' THEN 'editor' ELSE 'admin' END, 'existing login'
    FROM auth.users u
    WHERE u.email IS NOT NULL AND u.email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'
    ON CONFLICT DO NOTHING
  $q$;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Existing logins were not copied: %', SQLERRM;
END $$;

-- ===== Row level security: restrictive policies on every table =====
-- Editors may write these tables. Everything else is admin only.
DO $$
DECLARE
  t text;
  editor_tables text[] := ARRAY['posts', 'form_submissions_church', 'contact_messages_church', 'welcome_contacts_church', 'welcome_steps_church',
    'weekly_subscribers_church', 'weekly_settings_church', 'weekly_issues_church'];
  -- Tables a signed-in editor must not even read.
  private_tables text[] := ARRAY['sermon_transcripts_church', 'email_settings_church', 'email_outbox_church', 'events_source_church', 'activity_log_church'];
  w text;
  r text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> 'staff_roles_church' LOOP
    w := CASE WHEN t = ANY (editor_tables) THEN 'public.is_staff()' ELSE 'public.is_admin()' END;
    r := CASE WHEN t = ANY (private_tables) THEN 'public.is_admin()' ELSE 'public.is_staff()' END;
    EXECUTE format('DROP POLICY IF EXISTS team_read ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS team_insert ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS team_update ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS team_delete ON public.%I', t);
    EXECUTE format('CREATE POLICY team_read ON public.%I AS RESTRICTIVE FOR SELECT TO authenticated USING (%s)', t, r);
    -- The activity log: any team member adds entries, only admins read or change them.
    IF t = 'activity_log_church' THEN
      EXECUTE format('CREATE POLICY team_insert ON public.%I AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (public.is_staff())', t);
    ELSE
      EXECUTE format('CREATE POLICY team_insert ON public.%I AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (%s)', t, w);
    END IF;
    EXECUTE format('CREATE POLICY team_update ON public.%I AS RESTRICTIVE FOR UPDATE TO authenticated USING (%s) WITH CHECK (%s)', t, w, w);
    EXECUTE format('CREATE POLICY team_delete ON public.%I AS RESTRICTIVE FOR DELETE TO authenticated USING (%s)', t, w);
  END LOOP;
END $$;

-- Photo uploads: team members only.
DO $$
BEGIN
  EXECUTE 'DROP POLICY IF EXISTS team_storage_insert ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS team_storage_update ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS team_storage_delete ON storage.objects';
  EXECUTE 'CREATE POLICY team_storage_insert ON storage.objects AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (bucket_id <> ''site-images'' OR public.is_staff())';
  EXECUTE 'CREATE POLICY team_storage_update ON storage.objects AS RESTRICTIVE FOR UPDATE TO authenticated USING (bucket_id <> ''site-images'' OR public.is_staff()) WITH CHECK (bucket_id <> ''site-images'' OR public.is_staff())';
  EXECUTE 'CREATE POLICY team_storage_delete ON storage.objects AS RESTRICTIVE FOR DELETE TO authenticated USING (bucket_id <> ''site-images'' OR public.is_staff())';
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Photo storage policies were not changed: %', SQLERRM;
END $$;

-- ===== Database functions that were open to any signed-in user =====
DO $$
DECLARE
  f record;
  def text;
  chk text;
  editor_funcs text[] := ARRAY['add_weekly_subscribers', 'add_welcome_contacts', 'ai_weekly_blurb', 'ai_weekly_thought', 'preview_weekly_email',
    'send_weekly_now', 'send_weekly_test', 'send_welcome_step_test', 'set_weekly_blurb', 'set_weekly_thought', 'welcome_contact_action'];
BEGIN
  FOR f IN
    SELECT p.oid, p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosrc LIKE '%auth.uid() IS NULL%' AND p.prokind = 'f'
  LOOP
    chk := CASE WHEN f.proname = ANY (editor_funcs) THEN 'NOT public.is_staff()' ELSE 'NOT public.is_admin()' END;
    def := pg_get_functiondef(f.oid);
    def := replace(def, 'IF auth.uid() IS NULL THEN RAISE EXCEPTION ''Please sign in.''; END IF;',
      'IF ' || chk || ' THEN RAISE EXCEPTION ''You do not have permission to do that.''; END IF;');
    def := replace(def, 'IF auth.uid() IS NULL AND current_user NOT IN',
      'IF ' || chk || ' AND current_user NOT IN');
    def := regexp_replace(def, 'IF auth\.uid\(\) IS NULL THEN\s+RAISE EXCEPTION ''Please sign in\.'';\s+END IF;',
      'IF ' || chk || ' THEN RAISE EXCEPTION ''You do not have permission to do that.''; END IF;', 'g');
    IF def LIKE '%auth.uid() IS NULL%' THEN
      RAISE NOTICE 'Function % still has an old sign-in check and was left alone.', f.proname;
    ELSE
      EXECUTE def;
    END IF;
  END LOOP;
END $$;
