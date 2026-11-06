/*
# Editable Home hero text

Adds four columns to site_settings_church so staff can change the words on the Home
hero photo in the admin under Settings: hero_title, hero_subtitle, hero_button_label,
hero_button_url. Blank values fall back to the site defaults.

Safe to run more than once.
*/

ALTER TABLE site_settings_church ADD COLUMN IF NOT EXISTS hero_title text;
ALTER TABLE site_settings_church ADD COLUMN IF NOT EXISTS hero_subtitle text;
ALTER TABLE site_settings_church ADD COLUMN IF NOT EXISTS hero_button_label text;
ALTER TABLE site_settings_church ADD COLUMN IF NOT EXISTS hero_button_url text;
