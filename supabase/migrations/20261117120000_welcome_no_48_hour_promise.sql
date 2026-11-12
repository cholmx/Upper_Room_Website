/*
# Take the "within 48 hours" promise out of the first welcome email

The first welcome email said someone from the welcome team would reach out within 48 hours. Nothing in the website
makes that happen, so the line is removed. The email still invites a reply. The migration that adds the emails was
also updated, so it only matters here if the earlier one was already applied. An email you edited yourself is
left alone.

Safe to run more than once.
*/

UPDATE public.welcome_steps_church
SET body = $b$Hey {{first_name}},

Thanks for sharing your info with us. Whether you were with us this past Sunday or you're just getting to know us, we're really glad you're here.

If you have a question about anything, like the kids' programs, classes, or how to get connected, just hit reply. It comes straight to us.

And next Sunday, stop by the Connection Center. We'd love to give you a little welcome gift and say hi.

Talk soon,
The Upper Room welcome team$b$
WHERE step_number = 1 AND body = $b$Hey {{first_name}},

Thanks for sharing your info with us. Whether you were with us this past Sunday or you're just getting to know us, we're really glad you're here.

Someone from our welcome team will reach out within 48 hours. In the meantime, if you have a question about anything, like the kids' programs, classes, or how to get connected, just hit reply. It comes straight to us.

And next Sunday, stop by the Connection Center. We'd love to give you a little welcome gift and say hi.

Talk soon,
The Upper Room welcome team$b$;
