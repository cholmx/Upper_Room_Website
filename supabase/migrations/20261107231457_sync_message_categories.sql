/*
# Make sure every category is in the list

Adds every approved category from the earlier batches (in case a batch was not applied), and also adds any
category already used by a message, so nothing a message uses is missing from Message Categories.
Names that are blank, over 60 characters or that contain a comma are skipped.

Safe to run more than once. Nothing is removed.
*/

INSERT INTO message_categories_church (name) VALUES
  ('Prayer'), ('Holy Spirit'), ('Marriage and Family'), ('Generosity'), ('Healing and Wholeness'),
  ('Identity in Christ'), ('Faith and Trust'), ('Community and Relationships'), ('Serving Others'),
  ('Scripture and Bible Study'), ('Worship'), ('The Gospel and Salvation'), ('Discipleship'), ('Hope and Encouragement'),
  ('Forgiveness'), ('Grace and Mercy'), ('Spiritual Gifts'), ('Evangelism and Witness'), ('Missions and Outreach'),
  ('Parenting'), ('Work and Calling'), ('Leadership'), ('Suffering and Trials'), ('Peace and Anxiety'),
  ('Fasting'), ('Sabbath and Rest'), ('Spiritual Warfare'), ('Freedom and Deliverance'), ('The Church'),
  ('Easter and the Resurrection'), ('Christmas and Advent'), ('The Kingdom of God'), ('Purpose and Destiny'), ('Gratitude'),
  ('Communion'), ('Baptism'), ('Spiritual Practices')
ON CONFLICT (name) DO NOTHING;

INSERT INTO message_categories_church (name)
SELECT DISTINCT btrim(regexp_replace(c, '\s+', ' ', 'g'))
FROM sermons, unnest(string_to_array(coalesce(topic, ''), ',')) AS c
WHERE btrim(c) <> '' AND char_length(btrim(c)) <= 60
  AND NOT EXISTS (SELECT 1 FROM message_categories_church m WHERE lower(m.name) = lower(btrim(regexp_replace(c, '\s+', ' ', 'g'))))
ON CONFLICT (name) DO NOTHING;
