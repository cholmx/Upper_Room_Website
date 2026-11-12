DO $$
DECLARE
  a record;
  b record;
BEGIN
  SELECT * INTO a FROM public.welcome_steps_church WHERE step_number = 2;
  SELECT * INTO b FROM public.welcome_steps_church WHERE step_number = 3;
  IF a.subject = 'Finding your people' AND b.subject = 'Have you seen urf.life?' THEN
    UPDATE public.welcome_steps_church SET subject = b.subject, body = b.body WHERE step_number = 2;
    UPDATE public.welcome_steps_church SET subject = a.subject, body = a.body WHERE step_number = 3;
  END IF;
END $$;

UPDATE public.welcome_steps_church
SET body = replace(body,
  'Sign up takes a minute. Just tell us the days you can''t meet and we''ll be in touch: https://urf.life/#/table-group-signup',
  'You sign up on urf.life, the church family website we told you about. It takes a minute. Just tell us the days you can''t meet and we''ll be in touch: https://urf.life/#/table-group-signup')
WHERE subject = 'Finding your people';
