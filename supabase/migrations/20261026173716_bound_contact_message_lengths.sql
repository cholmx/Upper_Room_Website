/*
# Bound the size of a contact message

1. Security
- Adds CHECK constraints to `contact_messages_church`: name <= 120 characters,
  email <= 200, kind <= 40, message <= 5000.

2. Notes
- The form's own limits live in the browser, so a direct request could previously store
  an unbounded amount of text per submission. The constraints make each abusive request
  cheap and keep the inbox readable.
- Constraints are added only when not already present, so the migration is re-runnable.
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contact_messages_name_len') THEN
    ALTER TABLE contact_messages_church
      ADD CONSTRAINT contact_messages_name_len CHECK (name IS NULL OR char_length(name) <= 120);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contact_messages_email_len') THEN
    ALTER TABLE contact_messages_church
      ADD CONSTRAINT contact_messages_email_len CHECK (email IS NULL OR char_length(email) <= 200);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contact_messages_kind_len') THEN
    ALTER TABLE contact_messages_church
      ADD CONSTRAINT contact_messages_kind_len CHECK (kind IS NULL OR char_length(kind) <= 40);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contact_messages_message_len') THEN
    ALTER TABLE contact_messages_church
      ADD CONSTRAINT contact_messages_message_len CHECK (message IS NULL OR char_length(message) <= 5000);
  END IF;
END $$;
