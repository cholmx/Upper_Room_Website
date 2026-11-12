import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { Section, SectionHeader, PageHeader, Accordion, PhotoSplit, PhotoBand } from '../components/ui';
import RichText from '../components/RichText';
import { BELIEFS } from '../content/beliefs';

const CONVICTIONS = [
  ['One story', 'Scripture is the authoritative story of God. We read it as one narrative, from creation to new creation.'],
  ['Jesus at the center', 'Our theology is orthodox and Trinitarian, and everything points to Jesus.'],
  ['Discipleship to Jesus', 'Following Jesus means being His disciple and learning from Him how to live.'],
  ['Ordinary means of growth', 'Spiritual disciplines such as prayer, Scripture, Sabbath, and fasting are how we are formed over time.'],
  ['Unhurried', 'Hurry is an enemy of the spiritual life, so we make room to slow down and be with God.'],
  ['Now and not yet', 'God’s kingdom is already present and is still coming in full.'],
  ['The Spirit is here', 'The Holy Spirit is active and available to us today.'],
  ['An embodied faith', 'Faith involves our bodies, our time, our work, and the places where we live.'],
  ['Formed on purpose', 'Phones, consumerism, and the pace of modern life shape people in ways that compete with the way of Jesus. We choose habits that shape us toward Him.'],
  ['Grace and truth', 'We avoid legalism and we avoid prosperity teaching.'],
];

const P = 'text-[1rem] leading-relaxed text-black';

export default function About() {
  usePageMeta('about');
  const items = BELIEFS.map(b => ({
    id: b.id,
    title: b.title,
    content: <RichText value={b.full} className="!font-serif text-[1rem] text-black" />,
  }));
  return (
    <>
      <PageHeader
        kicker="About Us"
        title="About Us"
        intro="Founded in faith, rooted in relationship, and focused on transformation."
      />

      <Section tone="gray">
        <div className="max-w-3xl">
          <h2 className="text-3xl md:text-5xl mb-5">Who we are</h2>
          <div className={`space-y-4 ${P}`}>
            <p>We are evangelical Christians with Pentecostal and charismatic roots. We still believe the Holy Spirit is at work today, and we pray for healing, listen for God’s voice, and expect Him to move.</p>
            <p>Along the way we have gone back to what Christians have practiced since the early church: Scripture, prayer, Sabbath, fasting, and unhurried time with God. We think the church’s long history has a lot to teach us, and we care about creation, culture, and the city we live in.</p>
          </div>
        </div>
        <ul className="grid md:grid-cols-2 gap-5 md:gap-6 mt-10">
          {CONVICTIONS.map(([t, d]) => (
            <li key={t} className="bg-white rounded-[10px] p-6 md:p-7">
              <h3 className="text-xl md:text-2xl mb-2">{t}</h3>
              <p className={P}>{d}</p>
            </li>
          ))}
        </ul>
      </Section>

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
