/*
# Turn the Growth Campaign section on the Home page on and off

Adds site_settings_church.campaign_home_on (1 shows the section, 0 hides it, and it starts at 1 so nothing changes).
Staff change it from the Growth Campaign screen in the admin. Safe to run more than once.
*/

ALTER TABLE public.site_settings_church ADD COLUMN IF NOT EXISTS campaign_home_on integer NOT NULL DEFAULT 1;
