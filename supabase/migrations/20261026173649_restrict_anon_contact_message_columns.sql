/*
# Limit what an anonymous contact submission may write

1. Security
- Revokes every table privilege on `contact_messages_church` from `anon` and grants
  INSERT only on `name`, `email`, `kind` and `message`.
- `handled` and `created_at` therefore always take their database defaults for an
  anonymous submission, and anonymous callers can no longer read, change or delete
  messages even if a future policy were added by mistake.
- Signed-in staff privileges are unchanged.

2. Notes
- `handled` is the follow-up flag shown in the admin inbox. An anonymous caller could
  previously submit a message pre-marked as handled so it never showed as new.
*/

REVOKE ALL ON contact_messages_church FROM anon;
GRANT INSERT (name, email, kind, message) ON contact_messages_church TO anon;
