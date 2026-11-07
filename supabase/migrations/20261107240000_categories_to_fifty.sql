/*
# Thirteen more message categories

Brings the approved list to 50: Be With Jesus, Become Like Jesus, Do What Jesus Did, and ten more.
They can be edited in the admin under Message Categories. Safe to run more than once.
*/

INSERT INTO message_categories_church (name) VALUES
  ('Be With Jesus'), ('Become Like Jesus'), ('Do What Jesus Did'),
  ('Love'), ('Repentance'), ('Courage and Boldness'), ('Wisdom and Decisions'), ('Money and Stewardship'),
  ('Hearing God''s Voice'), ('Miracles and the Supernatural'), ('Grief and Comfort'), ('Eternity and Heaven'),
  ('Justice and Compassion')
ON CONFLICT (name) DO NOTHING;
