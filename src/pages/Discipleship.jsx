import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { useSite } from '../settings';
import { DISCIPLESHIP_FAQ as FAQ } from '../content/faqs';
import { Section, SectionHeader, PageHeader, PageNav, Accordion, Band, Panel, PhotoSplit, PhotoBand } from '../components/ui';

const P = 'text-[1rem] leading-relaxed text-black';

const GROUPS = [
  { name: 'Know God', tagline: 'Draw close to Him through worship, prayer, and Scripture.', practices: [
    ['Prayer', 'Ongoing conversation with God, on your own and with others.'],
    ['Scripture', 'Reading, studying, and living by the Word.'],
    ['Solitude', 'Quiet time alone with God, away from noise and demands.'],
  ] },
  { name: 'Share Life', tagline: 'Build honest friendships and find a church family.', practices: [
    ['Sabbath', 'Weekly rest that trusts God with your time and your worth.'],
    ['Community', 'Honest, committed relationships where you are known and cared for.'],
    ['Generosity', 'Open-handed living with your money, time, and attention.'],
  ] },
  { name: 'Serve Others', tagline: 'Use your gifts to love your neighbors and your city.', practices: [
    ['Service', 'Using your gifts to meet real needs at church and in the community.'],
    ['Witness', 'Sharing the good news of Jesus through your words and your life.'],
    ['Fasting', 'Setting aside food or other comforts to turn your hunger toward God.'],
  ] },
];

export default function Discipleship() {
  usePageMeta('discipleship');
  const SITE = useSite();
  return (
    <>
      <PageHeader kicker="Discipleship" title="Adult Discipleship Training" intro="Sunday morning classes where adults learn to know God, share life, and serve others." />

      <PageNav items={[['classes', 'When we meet'], ['practices', 'The nine practices'], ['values', 'Values In The Kingdom'], ['years', 'The five years'], ['wednesday', 'Wednesdays'], ['faq', 'Questions']]} />

      <Section tone="white" id="classes">
        <div className="max-w-3xl">
        <p className="lead">Every Sunday at 9:30am, one hour before worship, adults meet to learn and practice what it means to follow Jesus together.</p>
        <p className={`mt-4 ${P}`}>The classes follow a five-year plan. It focuses on nine spiritual practices and the core values of our church. There are more spiritual practices than these, and these nine are the ones we use for this training track. The plan repeats, so you can join at any point and still cover everything.</p>
      </div>
      </Section>

      <Band>
        <Panel title="When we meet">
          <p>Sunday mornings at 9:30am, one hour before worship.</p>
          <p>Kids classes meet at the same time.</p>
          <p>Classes run in the fall, winter, and spring. We do not hold classes in the summer.</p>
        </Panel>
        <Panel title="Where to begin">
          <p>Join the class that is meeting on Sunday morning. If you would like help finding the right room, ask anyone on our welcome team or email <a className="underline underline-offset-4 font-semibold" href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
        </Panel>
      </Band>

      <Section tone="white" narrow>
        <SectionHeader title="What you will learn" intro="There are two kinds of classes. Some teach nine of the spiritual practices. Others teach the core values of our church." className="!mb-0" />
      </Section>

      <PhotoBand slot="discipleship-practices" id="practices">
        <h2 className="text-3xl md:text-5xl mb-5">Nine practices we focus on</h2>
        <p className="text-base leading-relaxed">A spiritual practice is a regular habit that helps you grow closer to God. There are many of them, and these nine are the ones we focus on in this training track. We group them under our three words: Know God, Share Life, and Serve Others.</p>
      </PhotoBand>

      <Section tone="white">
        <div className="grid md:grid-cols-3 gap-6">
          {GROUPS.map(g => (
            <div key={g.name} className="fcard !p-8 md:!p-10">
              <h3 className="text-3xl md:text-4xl">{g.name}</h3>
              <span className="block mt-3 font-serif italic font-normal text-[1rem] leading-snug text-black">{g.tagline}</span>
              <dl className="mt-8 space-y-7">
                {g.practices.map(([t, d]) => (
                  <div key={t}>
                    <dt className="font-display font-bold text-xl text-[#c74f2f] leading-tight">{t}</dt>
                    <dd className="mt-1.5 text-[1rem] leading-snug text-black">{d}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="gray" id="values">
        <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl mb-5">Values In The Kingdom</h2>
        <div className={`space-y-4 ${P}`}>
          <p>Values In The Kingdom is our class on the core values of our church. We offer two of them, a Yellow class and a Green class.</p>
          <p>Each class runs for three semesters, fall, winter, and spring, and goes through our six core values, from healthy relationships to living the Gospel.</p>
        </div>
      </div>
      </Section>

      <Section tone="white" narrow id="years">
        <SectionHeader title="How the five years work" />
        <div className={`space-y-4 ${P}`}>
          <p>Each year on Sunday mornings is one of two kinds. A practices year goes through three of these nine practices, one in the fall, one in the winter, and one in the spring. A Values In The Kingdom year studies the core values of our church in one class that runs through the fall, winter, and spring.</p>
          <p>The two kinds of years take turns over five years, and then the plan starts over. Wherever you join, you will come back around to everything you missed.</p>
        </div>
      </Section>

      <PhotoBand slot="discipleship-wednesday" id="wednesday">
        <h2 className="text-3xl md:text-5xl mb-5">Wednesday evenings</h2>
        <div className="space-y-4 text-base leading-relaxed">
          <p>Wednesday evenings from 6:30 to 8:00pm are for enrichment classes. These are separate from Adult Discipleship Training.</p>
          <p>The classes cover everyday life, with topics such as Marriage, Parenting, and Finances, and Spirit Class, a class about the Holy Spirit.</p>
          <p>Junior high (6th through 8th grade) and high school (9th through 12th grade) youth groups meet at the same time, and childcare is offered during Wednesday classes.</p>
        </div>
      </PhotoBand>

      <Section tone="white" narrow id="faq">
        <SectionHeader title="Questions" />
        <Accordion group="discipleship-faq" items={FAQ.map(([q, a]) => ({ id: q.toLowerCase().replace(/[^a-z]+/g, '-'), title: q, content: <p className={P}>{a}</p> }))} />
      </Section>
    </>
  );
}
