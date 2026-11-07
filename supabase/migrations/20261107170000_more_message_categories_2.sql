/*
# Three more message categories

Adds Communion, Baptism and Spiritual Practices. The Kingdom of God was already added. They can be edited in
the admin under Message Categories. Safe to run more than once.
*/

INSERT INTO message_categories_church (name) VALUES
  ('Communion'), ('Baptism'), ('Spiritual Practices')
ON CONFLICT (name) DO NOTHING;
