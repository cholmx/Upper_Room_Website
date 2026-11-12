/*
# Links in the welcome emails

Adds a few links to different parts of the website in the welcome emails: messages, classes and groups, core values,
leaders and contact in the first email, the Sozo prayer ministry in the second, the About page in the third and the
contact page in the fourth. An email you edited yourself is left alone.

Safe to run more than once.
*/

UPDATE public.welcome_steps_church SET body = $b$Hey {{first_name}},

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
WHERE step_number = 1 AND body = $b$Hey {{first_name}},

Thanks for sharing your info with us. We're really glad you're here.

If you have a question about anything, like the kids' programs, classes, or how to get connected, just hit reply. It comes straight to us.

We hope to see you again this Sunday.

Talk soon,
The Upper Room welcome team$b$;

UPDATE public.welcome_steps_church SET body = $b$Hey {{first_name}},

Church is a lot better with friends, so here are a couple of easy ways to find yours.

Sunday mornings at 9:30am: Adult classes meet an hour before worship. Our welcome team can help you find one that fits.

Wednesday evenings, 6:30 to 8:00pm: Classes on things like marriage and parenting, plus youth groups for junior high and high school, and childcare while you're in class.

Take a look: https://www.urfellowship.com/discipleship

If you could use some prayer, Sozo is a gentle, one-on-one prayer ministry: https://www.urfellowship.com/sozo

Not sure where you'd fit? Just reply and tell us a little about yourself. We'll point you the right way.

The Upper Room welcome team$b$
WHERE step_number = 2 AND body = $b$Hey {{first_name}},

Church is a lot better with friends, so here are a couple of easy ways to find yours.

Sunday mornings at 9:30am: Adult classes meet an hour before worship. Our welcome team can help you find one that fits.

Wednesday evenings, 6:30 to 8:00pm: Classes on things like marriage and parenting, plus youth groups for junior high and high school, and childcare while you're in class.

Take a look: https://www.urfellowship.com/discipleship

Not sure where you'd fit? Just reply and tell us a little about yourself. We'll point you the right way.

The Upper Room welcome team$b$;

UPDATE public.welcome_steps_church SET body = $b$Hey {{first_name}},

Sometimes you want to hear a message again, or send one to a friend. They're all online.

Watch or listen to our messages: https://www.urfellowship.com/messages

And if you like podcasts, Shine is us talking with people from our church family about real life and faith: https://www.urfellowship.com/shine

Want to know more about who we are? Start here: https://www.urfellowship.com/about

We'd also love to pray for you. If there's anything on your mind, just reply to this email. A real person reads every one.

The Upper Room welcome team$b$
WHERE step_number = 3 AND body = $b$Hey {{first_name}},

Sometimes you want to hear a message again, or send one to a friend. They're all online.

Watch or listen to our messages: https://www.urfellowship.com/messages

And if you like podcasts, Shine is us talking with people from our church family about real life and faith: https://www.urfellowship.com/shine

We'd also love to pray for you. If there's anything on your mind, just reply to this email. A real person reads every one.

The Upper Room welcome team$b$;

UPDATE public.welcome_steps_church SET body = $b$Hey {{first_name}},

Just checking in. How are you settling in?

Is there something we can help with? Finding a class, a question about the kids' programs, a prayer request, or just wanting to chat with someone? Reply to this email and we'll get you connected.

You can always reach us here: https://www.urfellowship.com/contact

Thanks for letting us be a small part of your week.

The Upper Room welcome team$b$
WHERE step_number = 4 AND body = $b$Hey {{first_name}},

Just checking in. How are you settling in?

Is there something we can help with? Finding a class, a question about the kids' programs, a prayer request, or just wanting to chat with someone? Reply to this email and we'll get you connected.

Thanks for letting us be a small part of your week.

The Upper Room welcome team$b$;
