import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { Section, SectionHeader, PageHeader, Accordion, PhotoSplit, PhotoBand } from '../components/ui';
import RichText from '../components/RichText';
import { BELIEFS } from '../content/beliefs';

const P = 'text-[0.95rem] leading-relaxed text-black';

export default function About() {
  usePageMeta('about');
  const items = BELIEFS.map(b => ({
    id: b.id,
    title: b.title,
    content: <RichText value={b.full} className="!font-serif text-[0.95rem] text-black" />,
  }));
  return (
    <>
      <PageHeader
        kicker="About Us"
        title="About Us"
        intro="Founded in faith, rooted in relationship, and focused on transformation."
      />

      <PhotoSplit tone="white" slot="about-story" side="right">
        <SectionHeader title="Our Story" className="!mb-6" />
        <div className={`space-y-4 ${P}`}>
          <p>Upper Room Fellowship began in 1971, when a group of believers gathered in an upper room above a veterinarian’s office in Columbiana, Ohio. The setting recalled the upper room where Jesus’ first disciples prayed and waited for the Holy Spirit. The group shared a hunger for God’s presence and a desire for authentic Christianity, and they built a community where people could meet God and form real friendships.</p>
          <p>That hunger has shaped us for more than fifty years. A small gathering grew into a church family committed to healthy relationships, wholeness, spiritual gifts, the Holy Spirit’s presence, and living out the Gospel. Today we help people in Columbiana and beyond find the purpose, freedom, and fullness Jesus offers.</p>
          <p>Columbiana is our home, and we love it. As you look around this site, you will see photos from Columbiana.</p>
        </div>
      </PhotoSplit>

      <PhotoBand slot="about-beliefs">
        <h2 className="text-3xl md:text-5xl mb-5">What We Believe</h2>
        <p className="text-base leading-relaxed">These truths are the foundation we share. On the essentials, we stand together. On everything else, we give each other room to keep growing, and love holds the family together.</p>
      </PhotoBand>

      <Section tone="white" id="beliefs" narrow>
        <Accordion items={items} />
      </Section>
    </>
  );
}
