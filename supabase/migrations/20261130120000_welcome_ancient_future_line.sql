/*
# Welcome email: the line about the church's ancient roots

Changes the extra paragraph in the first welcome email (Glad to meet you) to a plain line about drawing on the ancient
ways of the church. It handles every earlier version of the paragraph. If the paragraph is not there, nothing changes.
Safe to run more than once.
*/

UPDATE public.welcome_steps_church
SET body = replace(replace(replace(replace(
  body,
  E'We''re an ancient-future church, which just means we draw on the ancient ways of the church, like prayer, Scripture, and a day of rest, and we believe the Holy Spirit is at work today.',
  E'We draw on the ancient ways of the church, like prayer, Scripture, and a day of rest, and we believe the Holy Spirit is at work today.'),
  E'We''re a Spirit-filled church that also loves the old practices of following Jesus, like prayer, Scripture, and a day of rest. Christians have kept them for centuries, and we''re still learning from them.',
  E'We draw on the ancient ways of the church, like prayer, Scripture, and a day of rest, and we believe the Holy Spirit is at work today.'),
  E'One thing you''ll notice about us is that we try not to rush. We''re a Spirit-filled church that also loves the old ways of following Jesus, like prayer, Scripture, and rest, the things Christians have practiced for centuries. Knowing Jesus takes time, and there''s no pressure to keep up.',
  E'We draw on the ancient ways of the church, like prayer, Scripture, and a day of rest, and we believe the Holy Spirit is at work today.'),
  E'A little about us: we''re an ancient-future church. We draw on the early church and the monastic traditions, we believe the Holy Spirit is active today, and we practice discipleship to Jesus at an unhurried pace. You don''t have to keep up with anything. Come as you are.',
  E'We draw on the ancient ways of the church, like prayer, Scripture, and a day of rest, and we believe the Holy Spirit is at work today.')
WHERE step_number = 1 AND subject = 'Glad to meet you';
