import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { Btn, Section, SectionHeader, PageHeader, Boxes, Box } from '../components/ui';

const P = 'text-lg leading-relaxed text-black/80';

export default function Ministries() {
  usePageMeta('ministries');
  return (
    <>
      <PageHeader
        kicker="Ministries"
        title="Ministries"
        intro="Find your place to connect and serve."
      />

      <Section tone="cream" narrow>
        <div className={`space-y-5 ${P}`}>
          <p className="lead">At Upper Room Fellowship, ministry is how we live out our faith together. We believe in knowing our greatness, that each person has a unique way of ministering to the world around them with excellence. There is no spectator Christianity, and inherent in every person is great value and destiny.</p>
          <p>Our ministries are designed to help you connect with God, build meaningful relationships, and discover the joy of serving others. Whatever your age, interests, or season of life, there is a place for you to belong and make a difference at Upper Room Fellowship.</p>
        </div>
      </Section>

      <Section tone="white">
        <Boxes on="white">
          <Box tone="sage" id="kids" title="Kids ministry: Upper Room Kids">
            <p>Upper Room Kids is a vibrant, exciting environment, and it is far more than childcare during service. Children from birth through 5th grade discover God’s love through age-appropriate teaching, fun activities, and caring relationships.</p>
            <p>We believe children are part of the church today and are more than the church of tomorrow. Our passionate team creates experiences that help kids build a strong spiritual foundation, form healthy relationships, and understand they have God-given purpose and value from a young age.</p>
            <h3>In Upper Room Kids, your children will</h3>
            <ul>
              <li>Experience engaging, Bible-based teaching that makes faith relevant</li>
              <li>Build friendships with other kids in a safe, fun environment</li>
              <li>Develop their own relationship with Jesus through worship and prayer</li>
              <li>Discover their unique gifts and how God can use them even now</li>
            </ul>
            <p>Our secure check-in system and background-checked volunteers ensure your children are safe while they learn and grow. For parents of young children, we also offer a parent viewing room where you can still experience the service while attending to your little ones.</p>
            <p><strong>Sundays:</strong> Children join their families for worship in the main service, then are dismissed to age-appropriate classes during the message time.</p>
            <p><strong>Special events:</strong> Throughout the year, we host special events and seasonal celebrations that create memorable experiences for the whole family.</p>
          </Box>
          <Box tone="amber" id="youth" title="Student ministry: Upper Room Youth">
            <p>Upper Room Youth creates a safe, engaging space where 6th to 12th graders can build authentic friendships, ask tough questions, and develop a faith that lasts beyond high school. We are passionate about helping students own a supernatural lifestyle and pursue healthy relationships during these formative years.</p>
            <p>The teenage years are crucial for spiritual development. At Upper Room Fellowship, we do not water down the gospel or entertain students with games alone. We challenge them to go deeper in their relationship with Jesus and equip them to live out their faith in school, at home, and in their community.</p>
            <h3>We are committed to</h3>
            <ul>
              <li>Relevant teaching that addresses real-life issues teenagers face</li>
              <li>Service opportunities that develop leadership skills and character</li>
              <li>Regular events and retreats that build lasting friendships and spiritual momentum</li>
            </ul>
            <p>Upper Room Youth meets every Wednesday night from 6:30 to 8:00pm in the Student Center.</p>
          </Box>
        </Boxes>
      </Section>

      <Section tone="cream">
        <Boxes>
          <Box tone="forest" light id="table-groups" title="Small groups: Table Groups">
            <p>Life is better together. Living out our value of pursuing healthy relationships, our Table Groups meet throughout the week in homes across the community to study, pray, and share life. These spaces allow us to show up authentically, with kindness and honor.</p>
            <p>In a church family our size, it is vital to have smaller communities where you can be known, loved, and challenged to grow. Table Groups provide that opportunity. They create environments where you can build meaningful relationships, apply biblical teachings to your daily life, and support one another through life’s ups and downs.</p>
            <h3>Our Table Groups are</h3>
            <ul>
              <li>Diverse: groups for every age and stage of life</li>
              <li>Convenient: meeting various days and times throughout the week</li>
              <li>Seasonal: most groups run in 8 to 12 week semesters, giving you flexibility</li>
              <li>Supportive: places where you can share struggles and celebrate victories</li>
              <li>Purposeful: focused on spiritual growth and genuine community</li>
            </ul>
            <p>Table Groups typically meet biweekly or monthly and include time for connection, Bible study or topical discussion, prayer, and occasionally serving together in the community.</p>
          </Box>
          <Box tone="terra" id="worship" title="Worship Ministry">
            <p>Our Worship Ministry creates environments where people can treasure God’s presence through music, art, and technology. We believe worship brings about a kingdom mindset that allows us to live loved and causes us to be fully alive.</p>
            <p>Worship is a lifestyle of honoring God in everything we do, and singing songs is one part of it. During our corporate gatherings, we create space for people to encounter God’s presence through Spirit-led worship that is both expressive and accessible. Our team strives for excellence while remaining authentic and focused on Jesus above all.</p>
            <h3>The Worship Ministry includes</h3>
            <ul>
              <li>Worship Team: vocalists and musicians who lead our congregation in worship</li>
              <li>Production Team: sound, lighting, and visual technicians who create immersive worship environments</li>
              <li>Creative Team: artists, designers, and decorators who enhance our physical space</li>
              <li>Media Team: photographers and videographers who capture and share special moments</li>
            </ul>
            <p>We believe worship is participatory and is never a performance. That is why we choose songs that are both theologically rich and easy to sing along with. Our musical style reflects who we are as a church: contemporary with some traditional elements, and always authentic and Spirit-led.</p>
            <p><strong>Join the team:</strong> If you are interested in serving with the Worship Ministry, we would love to help you discover how your gifts and talents can be used. After completing our Growth Track, you can audition for the worship team or shadow one of our production volunteers to learn the ropes.</p>
          </Box>
        </Boxes>
      </Section>

      <Section tone="white" id="outreach">
        <SectionHeader kicker="Outreach and missions" title="Outreach & Missions" />
        <div className={`max-w-3xl space-y-4 ${P}`}>
          <p>We extend God’s love beyond our walls through local service projects, community partnerships, and global missions. This is how we live the Gospel, by modeling and sharing the life of Christ through servanthood and overwhelming generosity.</p>
          <p>Jesus called us to be His witnesses in Jerusalem, Judea, Samaria, and to the ends of the earth. At Upper Room Fellowship, we take this commission seriously by engaging in strategic outreach efforts at the local, regional, and global levels. We are committed to demonstrating God’s love in practical ways while sharing the hope of the Gospel.</p>
          <p><strong>Get involved:</strong> Whether you have an hour a month or feel called to longer-term missions, there is a place for you in our outreach efforts. Speak with one of our pastors to discover where your passions and our opportunities meet.</p>
          <div className="pt-2"><Btn to="/contact" variant="ghost">Contact us</Btn></div>
        </div>
      </Section>
    </>
  );
}
