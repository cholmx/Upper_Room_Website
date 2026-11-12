-- F7: anonymous visitors hold table-level INSERT/UPDATE/DELETE on content tables
-- that have no anon write policy. Remove the grants so the data API refuses the
-- write at the privilege layer too. SELECT is left untouched everywhere, and the
-- two public form tables keep their column-scoped INSERT grants.

REVOKE INSERT, UPDATE, DELETE ON public.campaign_items_church FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.custom_pages_church FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.episodes FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.events_church FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.gallery_church FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.hero_config FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.home_section_order_church FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.home_spotlights_church FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.launch_checklist_church FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.message_categories_church FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.photo_sections_church FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.podcast_episodes_church FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.podcast_shows_church FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.posts FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.sermons FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.site_photos_church FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.site_settings_church FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.staff_church FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.stories_church FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.table_groups_church FROM anon;
REVOKE INSERT ON public.activity_log_church FROM anon;
