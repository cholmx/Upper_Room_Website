UPDATE public.welcome_steps_church
SET body = replace(body, E'Here''s the easiest next step:', E'A little about us: we''re an ancient-future church. We draw on the early church and the monastic traditions, we believe the Holy Spirit is active today, and we practice discipleship to Jesus at an unhurried pace. You don''t have to keep up with anything. Come as you are.\n\nHere''s the easiest next step:')
WHERE step_number = 1 AND subject = 'Glad to meet you' AND body NOT LIKE '%ancient-future%' AND body LIKE '%Here''s the easiest next step:%';
