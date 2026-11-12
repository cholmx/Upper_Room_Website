/*
# First welcome email: bring it to its final text

Earlier changes to the first welcome email (no "within 48 hours" promise, no welcome gift line, a simpler opening,
website links) only applied if every step before them had been applied. This sets the first email straight to its
final text, as long as it still looks like one of the starting versions: it has one of their distinctive phrases and
does not yet have the website links. A first email you rewrote from scratch has none of those phrases and is left alone.

Safe to run more than once.
*/

UPDATE public.welcome_steps_church
SET delay_days = 0, subject = $b$Glad to meet you$b$, body = $b$Hey {{first_name}},

Thanks for sharing your info with us. We're really glad you're here.

If you have a question about anything, like the kids' programs, classes, or how to get connected, just hit reply. It comes straight to us.

A few places on our website you might like to look around:

Our messages: https://www.urfellowship.com/messages
Classes and groups: https://www.urfellowship.com/discipleship
What we value: https://www.urfellowship.com/core-values
Meet our leaders: https://www.urfellowship.com/leadership
Contact us: https://www.urfellowship.com/contact

We hope to see you again this Sunday.

Talk soon,
The Upper Room welcome team$b$
WHERE step_number = 1
  AND body NOT LIKE '%/core-values%'
  AND (body LIKE '%within 48 hours%' OR body LIKE '%Connection Center%' OR body LIKE '%Whether you were with us%'
       OR body LIKE '%Thank you for sharing your information with us%' OR body LIKE '%Thanks for sharing your info with us%');
