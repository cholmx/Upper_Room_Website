/*
# First welcome email: simpler opening line

The first email opened with "Whether you were with us this past Sunday or you're just getting to know us". It now
simply says "We're really glad you're here." An email you edited yourself is left alone.

Safe to run more than once.
*/

UPDATE public.welcome_steps_church
SET body = $b$Hey {{first_name}},

Thanks for sharing your info with us. We're really glad you're here.

If you have a question about anything, like the kids' programs, classes, or how to get connected, just hit reply. It comes straight to us.

We hope to see you again this Sunday.

Talk soon,
The Upper Room welcome team$b$
WHERE step_number = 1 AND body IN ($b$Hey {{first_name}},

Thanks for sharing your info with us. Whether you were with us this past Sunday or you're just getting to know us, we're really glad you're here.

If you have a question about anything, like the kids' programs, classes, or how to get connected, just hit reply. It comes straight to us.

We hope to see you again this Sunday.

Talk soon,
The Upper Room welcome team$b$, $b$Hey {{first_name}},

Thanks for sharing your info with us. Whether you were with us this past Sunday or you're just getting to know us, we're really glad you're here.

If you have a question about anything, like the kids' programs, classes, or how to get connected, just hit reply. It comes straight to us.

And next Sunday, stop by the Connection Center. We'd love to give you a little welcome gift and say hi.

Talk soon,
The Upper Room welcome team$b$);
