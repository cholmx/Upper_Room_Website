/*
# Take Sozo out of the welcome emails

Sozo is a deeper spiritual ministry that may not be right for people who are brand new, so the line about it is
removed from the welcome emails. Only that one paragraph is removed, so anything else you wrote in the email stays.

Safe to run more than once.
*/

UPDATE public.welcome_steps_church
SET body = replace(body, E'\n\nIf you could use some prayer, Sozo is a gentle, one-on-one prayer ministry: https://www.urfellowship.com/sozo', '')
WHERE body LIKE '%urfellowship.com/sozo%';

-- A paragraph that sits last, or was worded a little differently, is taken out whole.
UPDATE public.welcome_steps_church
SET body = regexp_replace(body, E'(^|\n)[^\n]*urfellowship\\.com/sozo[^\n]*(\n|$)', E'\\1', 'g')
WHERE body LIKE '%urfellowship.com/sozo%';
