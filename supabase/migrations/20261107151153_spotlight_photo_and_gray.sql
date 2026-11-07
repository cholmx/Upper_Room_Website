/*
# Front page area: light gray sections and a full photo layout

Sections on the site are white, light gray, or a full photo background. This lets a saved front page layout
use the tone "gray" and the layout "photo". Older rows keep working, and any older color shows as light gray.

Safe to run more than once.
*/

ALTER TABLE home_spotlights_church DROP CONSTRAINT IF EXISTS home_spotlights_layout;
ALTER TABLE home_spotlights_church ADD CONSTRAINT home_spotlights_layout
  CHECK (layout IN ('centered', 'photo-right', 'photo-left', 'banner', 'photo'));

ALTER TABLE home_spotlights_church DROP CONSTRAINT IF EXISTS home_spotlights_tone;
ALTER TABLE home_spotlights_church ADD CONSTRAINT home_spotlights_tone
  CHECK (tone IN ('white', 'gray', 'forest', 'terra', 'sage', 'gold', 'bronze', 'ink', 'tan'));
