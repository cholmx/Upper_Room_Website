/*
# Growth Campaign: vision and Q&A only

The Growth Campaign page now shows only the vision and the questions and answers. This removes any update posts
and Living Stones already added to campaign_items_church, in case an earlier version of the migration loaded them.

Safe to run more than once.
*/

DELETE FROM public.campaign_items_church WHERE kind IN ('update', 'stone');
