UPDATE public.welcome_steps_church SET delay_days = 0, subject = $b$Glad to meet you$b$, body = $b$Hey {{first_name}},

Thanks for sharing your info with us. We're really glad you're here.

If you have a question about anything, like the kids' programs, classes, or how to get connected, just hit reply. It comes straight to us.

Here's the easiest next step: First Steps. It's a short get-together right after the service on the first Sunday of every month, in the room next to the Coffee Lounge. Two of our pastors share about the church and ways to get connected, and you can ask whatever you like.

A few places on our website you might like to look around:

Our messages: https://www.urfellowship.com/messages
Classes and groups: https://www.urfellowship.com/discipleship
What we value: https://www.urfellowship.com/core-values
Meet our leaders: https://www.urfellowship.com/leadership
Contact us: https://www.urfellowship.com/contact

We hope to see you again this Sunday.

Talk soon,
The Upper Room welcome team$b$, published = 1 WHERE step_number = 1;
INSERT INTO public.welcome_steps_church (step_number, delay_days, subject, body)
SELECT 1, 0, $b$Glad to meet you$b$, $b$Hey {{first_name}},

Thanks for sharing your info with us. We're really glad you're here.

If you have a question about anything, like the kids' programs, classes, or how to get connected, just hit reply. It comes straight to us.

Here's the easiest next step: First Steps. It's a short get-together right after the service on the first Sunday of every month, in the room next to the Coffee Lounge. Two of our pastors share about the church and ways to get connected, and you can ask whatever you like.

A few places on our website you might like to look around:

Our messages: https://www.urfellowship.com/messages
Classes and groups: https://www.urfellowship.com/discipleship
What we value: https://www.urfellowship.com/core-values
Meet our leaders: https://www.urfellowship.com/leadership
Contact us: https://www.urfellowship.com/contact

We hope to see you again this Sunday.

Talk soon,
The Upper Room welcome team$b$ WHERE NOT EXISTS (SELECT 1 FROM public.welcome_steps_church WHERE step_number = 1);

UPDATE public.welcome_steps_church SET delay_days = 3, subject = $b$Finding your people$b$, body = $b$Hey {{first_name}},

Church is a lot better with friends, so here are a few easy ways to find yours.

Table Groups are our small groups. They're a great place to make friends and talk through what you're hearing on Sundays. Sign up takes a minute. Just tell us the days you can't meet and we'll be in touch: https://urf.life/#/table-group-signup

Sunday mornings at 9:30am: Adult classes meet an hour before worship. Our welcome team can help you find one that fits.

Wednesday evenings, 6:30 to 8:00pm: Classes on things like marriage and parenting, plus youth groups for junior high and high school, and childcare while you're in class.

Take a look: https://www.urfellowship.com/discipleship

Not sure where you'd fit? Just reply and tell us a little about yourself. We'll point you the right way.

The Upper Room welcome team$b$, published = 1 WHERE step_number = 2;
INSERT INTO public.welcome_steps_church (step_number, delay_days, subject, body)
SELECT 2, 3, $b$Finding your people$b$, $b$Hey {{first_name}},

Church is a lot better with friends, so here are a few easy ways to find yours.

Table Groups are our small groups. They're a great place to make friends and talk through what you're hearing on Sundays. Sign up takes a minute. Just tell us the days you can't meet and we'll be in touch: https://urf.life/#/table-group-signup

Sunday mornings at 9:30am: Adult classes meet an hour before worship. Our welcome team can help you find one that fits.

Wednesday evenings, 6:30 to 8:00pm: Classes on things like marriage and parenting, plus youth groups for junior high and high school, and childcare while you're in class.

Take a look: https://www.urfellowship.com/discipleship

Not sure where you'd fit? Just reply and tell us a little about yourself. We'll point you the right way.

The Upper Room welcome team$b$ WHERE NOT EXISTS (SELECT 1 FROM public.welcome_steps_church WHERE step_number = 2);

UPDATE public.welcome_steps_church SET delay_days = 7, subject = $b$Have you seen urf.life?$b$, body = $b$Hey {{first_name}},

We have a second website, just for our church family, and it's where a lot of the day-to-day stuff lives. It's called urf.life: https://urf.life

Here's what you'll find there:

Events and the calendar: what's coming up, with a button to add things to your own calendar: https://urf.life/#/calendar
The Happenings: our weekly update, so you always know what's going on this week: https://urf.life/#/announcements
The sermon blog: each week's message summary, plus the discussion questions our Table Groups use: https://urf.life/#/sermon-blog
Resources: books and links for your faith journey: https://urf.life/#/resources
Table Group sign-up: https://urf.life/#/table-group-signup

One more thing worth doing is joining Realm. Realm is our online church community. Joining takes a couple of minutes, and it's how you stay connected with everyone here: https://urf.life/#/join-realm

Got questions about any of it? Just reply.

The Upper Room welcome team$b$, published = 1 WHERE step_number = 3;
INSERT INTO public.welcome_steps_church (step_number, delay_days, subject, body)
SELECT 3, 7, $b$Have you seen urf.life?$b$, $b$Hey {{first_name}},

We have a second website, just for our church family, and it's where a lot of the day-to-day stuff lives. It's called urf.life: https://urf.life

Here's what you'll find there:

Events and the calendar: what's coming up, with a button to add things to your own calendar: https://urf.life/#/calendar
The Happenings: our weekly update, so you always know what's going on this week: https://urf.life/#/announcements
The sermon blog: each week's message summary, plus the discussion questions our Table Groups use: https://urf.life/#/sermon-blog
Resources: books and links for your faith journey: https://urf.life/#/resources
Table Group sign-up: https://urf.life/#/table-group-signup

One more thing worth doing is joining Realm. Realm is our online church community. Joining takes a couple of minutes, and it's how you stay connected with everyone here: https://urf.life/#/join-realm

Got questions about any of it? Just reply.

The Upper Room welcome team$b$ WHERE NOT EXISTS (SELECT 1 FROM public.welcome_steps_church WHERE step_number = 3);

UPDATE public.welcome_steps_church SET delay_days = 14, subject = $b$Want to hear it again?$b$, body = $b$Hey {{first_name}},

Sometimes you want to hear a message again, or send one to a friend. They're all online.

Watch or listen to our messages: https://www.urfellowship.com/messages

And if you like podcasts, Shine is us talking with people from our church family about real life and faith: https://www.urfellowship.com/shine

Want to know more about who we are? Start here: https://www.urfellowship.com/about

We'd also love to pray for you. If there's anything on your mind, just reply to this email. A real person reads every one.

The Upper Room welcome team$b$, published = 1 WHERE step_number = 4;
INSERT INTO public.welcome_steps_church (step_number, delay_days, subject, body)
SELECT 4, 14, $b$Want to hear it again?$b$, $b$Hey {{first_name}},

Sometimes you want to hear a message again, or send one to a friend. They're all online.

Watch or listen to our messages: https://www.urfellowship.com/messages

And if you like podcasts, Shine is us talking with people from our church family about real life and faith: https://www.urfellowship.com/shine

Want to know more about who we are? Start here: https://www.urfellowship.com/about

We'd also love to pray for you. If there's anything on your mind, just reply to this email. A real person reads every one.

The Upper Room welcome team$b$ WHERE NOT EXISTS (SELECT 1 FROM public.welcome_steps_church WHERE step_number = 4);

UPDATE public.welcome_steps_church SET delay_days = 21, subject = $b$Just checking in$b$, body = $b$Hey {{first_name}},

Just checking in. How are you settling in?

Is there something we can help with? Finding a class, a question about the kids' programs, a prayer request, or just wanting to chat with someone? Reply to this email and we'll get you connected.

If you haven't yet, these two are worth a minute:

Sign up for a Table Group: https://urf.life/#/table-group-signup
Join Realm: https://urf.life/#/join-realm

You can always reach us here: https://www.urfellowship.com/contact

Thanks for letting us be a small part of your week.

The Upper Room welcome team$b$, published = 1 WHERE step_number = 5;
INSERT INTO public.welcome_steps_church (step_number, delay_days, subject, body)
SELECT 5, 21, $b$Just checking in$b$, $b$Hey {{first_name}},

Just checking in. How are you settling in?

Is there something we can help with? Finding a class, a question about the kids' programs, a prayer request, or just wanting to chat with someone? Reply to this email and we'll get you connected.

If you haven't yet, these two are worth a minute:

Sign up for a Table Group: https://urf.life/#/table-group-signup
Join Realm: https://urf.life/#/join-realm

You can always reach us here: https://www.urfellowship.com/contact

Thanks for letting us be a small part of your week.

The Upper Room welcome team$b$ WHERE NOT EXISTS (SELECT 1 FROM public.welcome_steps_church WHERE step_number = 5);
