/*
# Message tags

Adds sermons.tags, a short list of tags separated by commas (for example "Prayer, Family"), used to group
and search messages. Series, speaker and category (the existing topic column) are unchanged.

Safe to run more than once.
*/

ALTER TABLE sermons ADD COLUMN IF NOT EXISTS tags text;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sermons_tags_len') THEN
    ALTER TABLE sermons ADD CONSTRAINT sermons_tags_len CHECK (tags IS NULL OR char_length(tags) <= 500);
  END IF;
END $$;
