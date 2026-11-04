import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { Section, SectionHeader, PageHeader, Accordion } from '../components/ui';
import RichText from '../components/RichText';
import ScrollStory, { Stage } from '../components/immersive/ScrollStory';
import { BELIEFS } from '../content/beliefs';

export default function About() {
  usePageMeta('about');
  const items = BELIEFS.map(b => ({
    id: b.id,
    title: b.title,
    content: <RichText value={b.full} className="!font-sans text-lg text-black/80" />,
  }));
  return (
    <>
      <PageHeader
        kicker="About Us"
        title="About Us"
        intro="Founded in faith, rooted in relationship, and focused on transformation."
      />

      <Section tone="cream">
        <SectionHeader kicker="Our story" title="Our story" />
        <ScrollStory
          heading="h3"
          label="Our story"
          beats={[
            { kicker: '1971', title: 'An upper room', visual: <Stage big="1971" small="Above a veterinarian’s office" />, body: <p>Upper Room Fellowship began in 1971 when a group of believers gathered in an upper room above a veterinarian’s office in Columbiana, Ohio. This location reflected the biblical Upper Room where Jesus’ disciples gathered to pray and wait for the Holy Spirit. United by a hunger for God’s presence and a desire to experience authentic Christianity, they created a community where people could encounter God and build meaningful relationships.</p> },
            { kicker: 'Since then', title: 'More than five decades', visual: <Stage big="50+" small="Years in Columbiana" />, body: <p>For over five decades, we have remained committed to being a church that transforms lives through the power of the Holy Spirit. What started as a small gathering has grown into a thriving community dedicated to pursuing healthy relationships, accessing abundant wholeness, knowing our greatness, owning a supernatural lifestyle, treasuring His presence, and living the Gospel.</p> },
            { kicker: 'Today', title: 'Serving Columbiana and beyond', visual: <Stage big="Today" small="Columbiana and beyond" />, body: <p>Today, we continue helping people in our community discover their God-given purpose and experience the freedom and fullness Jesus promised. We believe God is calling us to greater impact as we serve Columbiana and beyond with the love and power of Jesus Christ.</p> },
          ]}
        />
      </Section>

      <Section tone="white" id="beliefs" narrow>
        <SectionHeader kicker="Our beliefs" title="Our beliefs" />
        <p className="lead mb-8">We believe certain truths within Scripture form the essential foundation that unites God’s people in experiencing authentic life within the family of God. While the church may differ on non-essential matters, where there should be liberty within the church family to grow in understanding, we are bound together as a family by love. Right belief, championed by love, reflects what Jesus embodied, and we, the Body of Christ, seek to be a living expression of the same.</p>
        <Accordion items={items} />
      </Section>
    </>
  );
}
