/*
# Welcome email: plainer line about the church

Replaces the "A little about us: we're an ancient-future church..." paragraph in the first welcome email with
plainer wording. If the paragraph was never added, nothing changes. Safe to run more than once.
*/

UPDATE public.welcome_steps_church
SET body = replace(
  body,
  E'A little about us: we''re an ancient-future church. We draw on the early church and the monastic traditions, we believe the Holy Spirit is active today, and we practice discipleship to Jesus at an unhurried pace. You don''t have to keep up with anything. Come as you are.',
  E'One thing you''ll notice about us is that we try not to rush. We''re a Spirit-filled church that also loves the old ways of following Jesus, like prayer, Scripture, and rest, the things Christians have practiced for centuries. Knowing Jesus takes time, and there''s no pressure to keep up.'
)
WHERE step_number = 1 AND subject = 'Glad to meet you';
