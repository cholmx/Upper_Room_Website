/*
# More message categories

Adds 20 more approved categories for sorting messages. They can be edited, renamed or removed in the admin
under Message Categories. Safe to run more than once.
*/

INSERT INTO message_categories_church (name) VALUES
  ('Forgiveness'), ('Grace and Mercy'), ('Spiritual Gifts'), ('Evangelism and Witness'), ('Missions and Outreach'),
  ('Parenting'), ('Work and Calling'), ('Leadership'), ('Suffering and Trials'), ('Peace and Anxiety'),
  ('Fasting'), ('Sabbath and Rest'), ('Spiritual Warfare'), ('Freedom and Deliverance'), ('The Church'),
  ('Easter and the Resurrection'), ('Christmas and Advent'), ('The Kingdom of God'), ('Purpose and Destiny'), ('Gratitude')
ON CONFLICT (name) DO NOTHING;
