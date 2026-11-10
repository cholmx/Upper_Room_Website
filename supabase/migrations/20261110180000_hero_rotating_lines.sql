/*
# Rotating Home hero lines

Adds site_settings_church.hero_rotating: extra lines for the Home hero heading, one per line. The heading fades
through the main heading and then these lines, and repeats. Blank uses the site's built-in lines. Typing the single
word "off" keeps the heading still.

Safe to run more than once.
*/

ALTER TABLE site_settings_church ADD COLUMN IF NOT EXISTS hero_rotating text;
