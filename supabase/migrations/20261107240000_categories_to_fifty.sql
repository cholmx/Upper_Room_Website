/*
# Thirteen more message categories

Brings the approved list to 50: Be With Jesus, Become Like Jesus, Do What Jesus Did, and ten more.
They can be edited in the admin under Message Categories. Safe to run more than once.
*/

-- The three Jesus categories are spelled the way the church wrote them. If an earlier run saved them with
-- different capital letters, they are renamed instead of added twice.
UPDATE message_categories_church SET name = 'Be with Jesus' WHERE lower(name) = 'be with jesus' AND name <> 'Be with Jesus';
UPDATE message_categories_church SET name = 'Become Like Jesus' WHERE lower(name) = 'become like jesus' AND name <> 'Become Like Jesus';
UPDATE message_categories_church SET name = 'Do what Jesus did' WHERE lower(name) = 'do what jesus did' AND name <> 'Do what Jesus did';

INSERT INTO message_categories_church (name) VALUES
  ('Be with Jesus'), ('Become Like Jesus'), ('Do what Jesus did'),
  ('Love'), ('Repentance'), ('Courage and Boldness'), ('Wisdom and Decisions'), ('Money and Stewardship'),
  ('Hearing God''s Voice'), ('Miracles and the Supernatural'), ('Grief and Comfort'), ('Eternity and Heaven'),
  ('Justice and Compassion')
ON CONFLICT (name) DO NOTHING;
