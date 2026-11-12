/*
# Welcome emails for people who have already visited

Most people join the welcome emails at the church, after they have already been to a service, so the series no longer
explains what a Sunday is like or links to Plan Your Visit. It is now four short, casual emails. None of them promises that someone will be in touch by a certain time: glad to meet you
(day 0), finding your people (day 3), hearing a message again (day 10) and a check-in (day 17).

A starting email is only replaced if it still has the original text, so any email you edited yourself is left alone.
The old fifth email is removed only if it was never changed.

Safe to run more than once.
*/

UPDATE public.welcome_steps_church SET delay_days = 0, subject = $b$Glad to meet you$b$, body = $b$Hey {{first_name}},

Thanks for sharing your info with us. Whether you were with us this past Sunday or you're just getting to know us, we're really glad you're here.

If you have a question about anything, like the kids' programs, classes, or how to get connected, just hit reply. It comes straight to us.

And next Sunday, stop by the Connection Center. We'd love to give you a little welcome gift and say hi.

Talk soon,
The Upper Room welcome team$b$
WHERE step_number = 1 AND body IN ($b$Hi {{first_name}},

Thank you for sharing your information with us. We are glad you are thinking about joining us.

Sundays
Adult and kids classes begin at 9:30am. Worship starts at 10:30am.
500 Sponseller Road, Columbiana, Ohio 44408

Kids from birth through 5th grade have their own programs, and you are welcome to come just as you are.

A member of our welcome team will be in touch within 48 hours. If you have a question before then, just reply to this email.

See what a Sunday looks like: https://www.urfellowship.com/plan-your-visit

Upper Room Fellowship$b$, $b$Hey {{first_name}},

Thanks for sharing your info with us. Really glad you did!

If you're thinking about visiting, here's the quick version. We meet Sundays at 500 Sponseller Road in Columbiana. Classes start at 9:30am (totally optional), and worship starts at 10:30am. Come just as you are. Jeans are fine.

Got kids? Birth through 5th grade have their own programs, and the nursery stays open the whole service.

Someone from our welcome team will reach out within 48 hours. In the meantime, if you have a question, just hit reply. It comes straight to us.

Here's a peek at what a Sunday looks like: https://www.urfellowship.com/plan-your-visit

Talk soon,
The Upper Room welcome team$b$);

UPDATE public.welcome_steps_church SET delay_days = 3, subject = $b$Finding your people$b$, body = $b$Hey {{first_name}},

Church is a lot better with friends, so here are a couple of easy ways to find yours.

Sunday mornings at 9:30am: Adult classes meet an hour before worship. Our welcome team can help you find one that fits.

Wednesday evenings, 6:30 to 8:00pm: Classes on things like marriage and parenting, plus youth groups for junior high and high school, and childcare while you're in class.

Take a look: https://www.urfellowship.com/discipleship

Not sure where you'd fit? Just reply and tell us a little about yourself. We'll point you the right way.

The Upper Room welcome team$b$
WHERE step_number = 2 AND body IN ($b$Hi {{first_name}},

In case it helps to know what to expect, here is a Sunday morning at Upper Room Fellowship.

9:30am: Adult and kids classes begin (optional).
10:30am: Worship begins. The music is contemporary, and the words and Scripture are on the screens, so you can follow along without a Bible.
After worship: A short coffee break. We never single out visitors or ask anyone to stand and introduce themselves.
Then: The message for adults and teens, and kids programs for children birth through 5th grade.
About 11:45am: The service ends, and our team is available to talk or pray with you.

Wear whatever is comfortable. We care much more about meeting you than about what you have on.

More about your first visit: https://www.urfellowship.com/plan-your-visit

Upper Room Fellowship$b$, $b$Hey {{first_name}},

Walking into a new church can feel a little nerve-wracking, so here's exactly what to expect.

9:30am: Classes for adults and kids start. They're optional, so feel free to skip them.
10:30am: Worship. The music is contemporary, and the words and Scripture are up on the screens, so you don't need a Bible. Sit, stand, or raise your hands. Whatever feels right.
After worship: A short coffee break. We won't ask you to stand up or introduce yourself. Promise.
Then: The message for adults and teens, while the kids head to their own programs.
About 11:45am: We wrap up, and someone from our team is around if you want to talk or have us pray with you.

Wear whatever's comfortable. We'd much rather meet you than check your outfit.

Questions? Hit reply. We're happy to help.

More about your first visit: https://www.urfellowship.com/plan-your-visit

The Upper Room welcome team$b$);

UPDATE public.welcome_steps_church SET delay_days = 10, subject = $b$Want to hear it again?$b$, body = $b$Hey {{first_name}},

Sometimes you want to hear a message again, or send one to a friend. They're all online.

Watch or listen to our messages: https://www.urfellowship.com/messages

And if you like podcasts, Shine is us talking with people from our church family about real life and faith: https://www.urfellowship.com/shine

We'd also love to pray for you. If there's anything on your mind, just reply to this email. A real person reads every one.

The Upper Room welcome team$b$
WHERE step_number = 3 AND body IN ($b$Hi {{first_name}},

Church is better with friends. Here are a few ways to find yours.

Sunday mornings at 9:30am: Adult Discipleship Training classes meet one hour before worship. Our welcome team can help you find the right one.

Wednesday evenings, 6:30 to 8:00pm: Adult enrichment classes such as marriage and parenting, junior high and high school youth groups, and childcare.

Read more about our classes: https://www.urfellowship.com/discipleship

If you would like help finding a place, reply to this email and we will point you in the right direction.

Upper Room Fellowship$b$, $b$Hey {{first_name}},

Church is a lot better with friends, so here are a couple of easy ways to find yours.

Sunday mornings at 9:30am: Adult classes meet an hour before worship. Our welcome team can help you find one that fits.

Wednesday evenings, 6:30 to 8:00pm: Classes on things like marriage and parenting, plus youth groups for junior high and high school, and childcare while you're in class.

Take a look: https://www.urfellowship.com/discipleship

Not sure where you'd fit? Just reply and tell us a little about yourself. We'll point you the right way.

The Upper Room welcome team$b$);

UPDATE public.welcome_steps_church SET delay_days = 17, subject = $b$Just checking in$b$, body = $b$Hey {{first_name}},

Just checking in. How are you settling in?

Is there something we can help with? Finding a class, a question about the kids' programs, a prayer request, or just wanting to chat with someone? Reply to this email and we'll get you connected.

Thanks for letting us be a small part of your week.

The Upper Room welcome team$b$
WHERE step_number = 4 AND body IN ($b$Hi {{first_name}},

If you cannot make it on a Sunday, or you would like to hear more about what we teach, our messages are online.

Watch or listen to our messages: https://www.urfellowship.com/messages
The Shine podcast, conversations with people in our church family: https://www.urfellowship.com/shine

We would love to pray for you. If there is anything we can pray about, just reply to this email.

We hope to see you soon.

Upper Room Fellowship$b$, $b$Hey {{first_name}},

If Sundays are tricky, or you'd just like a feel for what we're about first, you can listen from home.

Our messages are all online: https://www.urfellowship.com/messages

And if you like podcasts, Shine is us talking with people from our church family about real life and faith: https://www.urfellowship.com/shine

We'd also love to pray for you. If there's anything on your mind, just reply to this email. A real person reads every one.

The Upper Room welcome team$b$);

DELETE FROM public.welcome_steps_church WHERE step_number = 5 AND body = $b$Hey {{first_name}},

Just checking in. How are things going?

If you've been by on a Sunday, we'd love to hear what you thought, good or not so good. If you haven't made it yet, no pressure at all. We'll be here whenever you're ready.

Is there something we can help with? Finding a class, a question about the kids' programs, a prayer request, or just wanting to chat with someone? Reply to this email and we'll get you connected.

Thanks for letting us be a small part of your week.

The Upper Room welcome team$b$;
