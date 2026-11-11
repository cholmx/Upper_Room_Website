/*
# Growth Campaign (Transforming Together)

1. New table
- campaign_items_church: everything on the Growth Campaign page. kind is one of
  vision (a page of text) or qa (a question and its answer, in order). The kinds update and stone are
  allowed in the table but the page does not show them. Columns: title, body (formatted text),
  image_url, item_date, sort_order_num, published (the on/off switch).

2. Security
- RLS is on. Visitors can read only items that are turned on. Signed-in staff manage everything.
- The image column must be empty or start with http:// or https://.

3. Starting content
- The vision and the questions already on the Growth Campaign page of the church app are added once, when the
  table is empty, so they can be edited here.

Safe to run more than once.
*/

CREATE TABLE IF NOT EXISTS campaign_items_church (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  kind text NOT NULL,
  title text,
  body text,
  image_url text,
  item_date date,
  sort_order_num integer NOT NULL DEFAULT 0,
  published integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT campaign_items_kind CHECK (kind IN ('update', 'vision', 'qa', 'stone')),
  CONSTRAINT campaign_items_title_len CHECK (title IS NULL OR char_length(title) <= 300),
  CONSTRAINT campaign_items_body_len CHECK (body IS NULL OR char_length(body) <= 30000)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'campaign_items_church_image_url_http_only') THEN
    ALTER TABLE public.campaign_items_church ADD CONSTRAINT campaign_items_church_image_url_http_only
      CHECK (image_url IS NULL OR btrim(image_url) = '' OR image_url ~* '^https?://');
  END IF;
END $$;

ALTER TABLE campaign_items_church ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON campaign_items_church TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON campaign_items_church TO authenticated;

DROP POLICY IF EXISTS anon_read_live_campaign_items ON campaign_items_church;
CREATE POLICY anon_read_live_campaign_items ON campaign_items_church
  FOR SELECT TO anon USING (published <> 0);

DROP POLICY IF EXISTS auth_all_campaign_items ON campaign_items_church;
CREATE POLICY auth_all_campaign_items ON campaign_items_church
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO campaign_items_church (kind, title, body, item_date, sort_order_num)
SELECT seed.kind, seed.title, seed.body, seed.item_date::date, seed.sort_order_num FROM (VALUES
  ('vision', $b$The Vision: Transforming Together$b$, $b$## Our Story: From a Seed to a Movement

In 1971, a handful of teenagers had a God-given dream. They wanted to create a space where their peers could encounter the transforming power of the Gospel. They met in a small upper room, praying and worshiping and inviting friends who needed Jesus. They had no idea what God would do next.

Over 50 years later, lives have been changed on every inhabited continent through this ministry. What started as a handful of teenagers saying yes to God has grown into something far beyond what any of them imagined. God took their small offering and multiplied it.

## A Legacy of Faith

Throughout our history, Upper Room has faced the same choice again and again. Make room for more people, or stay comfortable where we are?

Five times, we've chosen to expand. Five times, we've stepped out in faith when it didn't make perfect sense on paper. Each time required real sacrifice. People gave sacrificially. They dealt with construction noise and parking challenges and temporary inconvenience. They did it because they believed more people needed to encounter Jesus.

And each time, God was faithful. He provided the funds and preserved what made Upper Room special. The family atmosphere. The authentic relationships. The sense that you matter here.

Previous generations made room so you could be here. They gave so you could walk through these doors and discover a community where you're known and loved. They chose faith over comfort.

Now it's our turn.

## Our Vision: Transforming Lives Who Transform Communities

We believe God is raising up followers of Jesus who are so full of His love and life that it spills over into everything they touch. In a natural, beautiful way that makes people curious about what's different.

Jesus described it like this. The kingdom of heaven is like yeast that a woman took and mixed into sixty pounds of flour until it worked all through the dough.

Yeast is quiet. You can't see it working. But it transforms everything it touches from the inside out.

That's what we're seeing happen. A teacher walks into a chaotic classroom and somehow brings peace through presence. A business owner makes decisions based on integrity instead of profit, and the whole company culture shifts. A neighbor loves the difficult family on the street when everyone else has given up. A parent breaks patterns that have been passed down for generations and raises kids who actually know they're deeply loved.

This is kingdom yeast at work. Lives transformed by Jesus, transforming the spaces they occupy.

When you encounter the love of God, it changes you. And changed people change things.

## Why Now?

God is blessing us with growth. The organic kind that happens when people encounter Jesus and can't help but invite their friends.

Our sanctuary is full during worship. New families walk through our doors every week. First-time visitors sit in the back because there's nowhere else to sit. And we have a choice to make.

We can stay where we are. We can say we're comfortable at this size. We can turn away the growth God is bringing.

Or we can step out in faith and make room.

We're choosing to make room. Starting with sanctuary expansion to address the immediate need. Future phases may include children's ministry spaces, classrooms, maybe a multi-purpose area. But we're holding those plans loosely. God might redirect us. He might show us something we haven't considered. We'll keep listening.

This campaign recognizes what God is already doing and creates space for what He'll do next.

## Transforming Together: What It Really Means

Here's what we've learned over five decades. Transformation doesn't happen alone.

You can't become like Jesus in isolation. You can't learn to love people in a vacuum. You can't discover your purpose without community speaking into your life. You can't sustain kingdom work when you're trying to carry it solo.

We need each other. Iron sharpening iron. Friends who know your story and still choose to stay. People who've walked the road ahead and can point out the potholes. This is how God designed us to grow.

We're transformed as we encounter Jesus together. In worship that lifts our eyes beyond the immediate crisis. In teaching that challenges assumptions we didn't know we had. In prayer where we realize we're not the only ones struggling with doubt or fear or that same pattern we can't seem to break.

We grow together. Around tables where real conversations happen. In small groups where masks come off and people see the real you and don't run. Through friendships that go deep enough to speak truth when you need to hear it, even when it's uncomfortable.

This campaign invites everyone to participate. Not equal gifts, but equal sacrifice. What does sacrifice look like for you? That's between you and God. For some, significant financial giving that stretches your faith. For others, giving up something you planned to buy so you can redirect those resources. Some will fast from luxuries to free up margin. Others will sell something they've been holding onto.

The dollar amount varies widely. The point is sacrifice. Everyone giving in a way that costs something. Everyone stepping into faith together.

Because when we do that, when we all participate in sacrificial generosity, something shifts. In us. We learn that God is more trustworthy than our bank accounts. We discover that generosity creates more joy than accumulation ever did. We become people who hold things loosely and love people deeply.

This campaign is called Transforming Together because that's what happens when we step forward as one. The Upper Room family, all of us, moving together. United in mission. Generous in spirit. Committed to people who aren't here yet but will be because we chose to make room.

When we transform together, we expand kingdom impact.

Think about what happens when we create space for more people to encounter Jesus. More marriages that were headed for divorce find healing. More kids grow up in a community that teaches them they're loved before they're useful. More teenagers encounter Jesus during the years when the world is screaming at them about who they should be. More adults in their 30s and 40s break free from destructive patterns that have defined them since childhood.

And the impact ripples outward. Those transformed lives go back into the world. Into workplaces and neighborhoods and schools and families. They bring light into dark places. They bring hope into situations that feel hopeless. They bring love into relationships starved for it.

We strengthen the fabric of our entire community. One transformed life at a time.

We're also building a legacy. The teenagers who started this in 1971 couldn't have imagined we'd be here today. They just said yes to what God was doing in their moment. Fifty years from now, people we'll never meet will gather in spaces we're building today. They'll encounter the same Jesus we know. They'll experience the same transformation we've experienced. They'll continue this legacy of making room.

That's what transforming together looks like. A community that chooses faith over comfort. Generosity over security. Others over ourselves. A community that believes the next person who walks through our doors matters just as much as the people already here.

We're making space in our lives, our budgets, our priorities for what God wants to do next. We're saying yes before we have all the answers. We're trusting that the God who's been faithful for 50 years will be faithful for 50 more.

Let's make room. Together.$b$, NULL, 0),
  ('qa', $b$Why does Upper Room need to expand?$b$, $b$We're out of seats. During worship, especially when families with children are present, our sanctuary is full. When the kids head to their classes, space opens up. But we want families to worship together comfortably. We want visitors to walk in and find a welcoming spot. We want to keep growing without turning people away.

Throughout our history, we've chosen to create space for new people. We've expanded five times. Each time, it required faith. Each time, God was faithful. This is part of who we are. We make room.$b$, NULL, 0),
  ('qa', $b$What are we building?$b$, $b$We're starting with the sanctuary. More seating for worship. That's the immediate need. After that, we'll see. The vision includes spaces for children's ministry, classrooms, maybe a multi-purpose area. But we're holding those plans loosely. God might redirect us. He might show us something better. We'll keep listening.

Plans may change. We're following the Spirit, not a blueprint.$b$, NULL, 1),
  ('qa', $b$Will we go into debt?$b$, $b$Maybe some. We're committed to wise stewardship, so any debt will be at a level we're confident we can handle. We're not going to build ourselves into a corner. The goal is to raise as much as possible through the campaign, then responsibly manage whatever gap remains. We'll move forward only when we know it's sustainable.$b$, NULL, 2),
  ('qa', $b$I love our church family feel. Will that disappear?$b$, $b$No. And we can say that with confidence because we've done this before. Five times, actually. Each expansion, people worried about losing intimacy. Each time, we kept it.

Here's why. Intimacy isn't about building size. It's about intentionality. It's about commitment to authentic relationships. It's about small groups and table groups and the conversations that happen in hallways. It's about leadership staying invested in real community.

We're not trying to become a "big church." We're making room for more people to experience the family atmosphere we already have.$b$, NULL, 3),
  ('qa', $b$What about volunteers? We're already stretched.$b$, $b$More people actually means more volunteers. Think about every person currently serving. They were new once. They showed up, encountered Jesus, got connected, and stepped into serving. That pattern continues with each new person.

Yes, we'll need to be intentional about developing leaders and creating sustainable volunteer rhythms. But growth brings its own solution. More transformed lives means more people equipped and eager to serve.

The volunteer pool doesn't drain. It replenishes. But first we have to make room for those future volunteers to show up.$b$, NULL, 4),
  ('qa', $b$Won't this hurt our regular giving? What about missions?$b$, $b$Actually, the opposite tends to happen. When people catch a vision and step into faith-filled giving, it changes how they see everything. Churches often see increased regular giving and missions support during capital campaigns.

Plus, a healthy, growing church is better positioned to support missions long-term. More people means more people passionate about reaching the world.$b$, NULL, 5),
  ('qa', $b$What if we expand and then attendance drops?$b$, $b$Our growth over the decades has been steady and organic. Not driven by marketing. Not built on programs. The Holy Spirit has been drawing people and transforming lives. We're not speculating about future attendance. We're responding to what's already happening.

Also, our phased approach lets us pause and assess before moving to the next phase. We're not building on presumption. We're building on what God is already doing.$b$, NULL, 6),
  ('qa', $b$Can I give something other than cash?$b$, $b$Yes. Stocks, bonds, grants from donor-advised funds, required minimum distributions from your IRA, cryptocurrency, real estate. We can work with all of it. Contact the church office to figure out the details.$b$, NULL, 7),
  ('qa', $b$This is a three-year commitment. What if my situation changes?$b$, $b$Life happens. These are commitments made in faith, not legal contracts. If your circumstances change, just let leadership know. No judgment. No pressure. God honors the heart behind the gift.$b$, NULL, 8),
  ('qa', $b$I'm on a fixed income. Can I still participate?$b$, $b$Absolutely. Some people on fixed incomes give $5 or $10 a month. Others make a one-time gift. Some participate primarily through prayer. Your participation matters, whatever form it takes.$b$, NULL, 9),
  ('qa', $b$Can I give from my retirement account?$b$, $b$If you're 70½ or older, you can make a Qualified Charitable Distribution directly from your IRA. It satisfies your required minimum distribution without increasing your taxable income. Talk to the church office or your financial advisor about setting it up.$b$, NULL, 10),
  ('qa', $b$Why hire a consultant?$b$, $b$Same reason you hire an architect to design a building. Could we figure it out ourselves? Maybe. But expertise is worth the investment.

A consultant helps us avoid mistakes, run the campaign well, and free up our staff and volunteers to focus on ministry.$b$, NULL, 11),
  ('qa', $b$How will I know what's happening?$b$, $b$We're committed to regular updates through Sunday announcements, emails, URF.LIFE, and periodic vision nights. If plans change, you'll hear about it. If we hit a milestone, you'll celebrate with us.

Transparency matters. You'll be in the loop.$b$, NULL, 12),
  ('qa', $b$What if I don't think we need to expand?$b$, $b$We get it. Not everyone sees this the same way. This decision has been bathed in prayer and informed by congregation input.

We invite you to keep praying. If you have concerns or questions, talk to leadership. We want to hear from you.$b$, NULL, 13),
  ('qa', $b$What if I can't give a large amount?$b$, $b$Every gift matters. Some people will give $500 over three years. Others will give $50,000. God uses all of it.

Here's the phrase that guides our campaign. Not equal gifts, but equal sacrifice.

What does sacrifice look like for you? For some, it's cutting back on dining out. For others, it's postponing a purchase. For still others, it's giving from savings or selling an asset. God honors faith and obedience. He knows what sacrifice means for each of us.$b$, NULL, 14)
) AS seed(kind, title, body, item_date, sort_order_num)
WHERE NOT EXISTS (SELECT 1 FROM campaign_items_church);
