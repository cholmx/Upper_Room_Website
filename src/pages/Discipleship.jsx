import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { useSite } from '../settings';
import { Section, SectionHeader, PageHeader, Accordion, Band, Panel, PhotoSplit, PhotoBand } from '../components/ui';

const P = 'text-[0.95rem] leading-relaxed text-[#1e2522]/80';

const GROUPS = [
  { name: 'Know God', practices: [
    ['Prayer', 'Ongoing conversation with God, on your own and with others.'],
    ['Scripture', 'Reading, studying, and living by the Word.'],
    ['Solitude', 'Quiet time alone with God, away from noise and demands.'],
  ] },
  { name: 'Share Life', practices: [
    ['Sabbath', 'Weekly rest that trusts God with your time and your worth.'],
    ['Community', 'Honest, committed relationships where you are known and cared for.'],
    ['Generosity', 'Open-handed living with your money, time, and attention.'],
  ] },
  { name: 'Serve Others', practices: [
    ['Service', 'Using your gifts to meet real needs at church and in the community.'],
    ['Witness', 'Sharing the good news of Jesus through your words and your life.'],
    ['Fasting', 'Setting aside food or other comforts to turn your hunger toward God.'],
  ] },
];

const FAQ = [
  ['Do I have to start in the fall?', 'No. Come when you are ready. The five years repeat, so anything you miss at the start comes back around.'],
  ['What does Values In The Kingdom mean?', 'Values In The Kingdom is the name of our classes on the core values of our church. There are two, a Yellow class and a Green class, and each one runs for three semesters, fall, winter, and spring.'],
  ['Is Wednesday evening part of Adult Discipleship Training?', 'No. Adult Discipleship Training meets on Sunday mornings. Wednesday evenings are for enrichment classes such as Marriage, Parenting, and Finances.'],
  ['What is Spirit Class?', 'Spirit Class is a Wednesday evening enrichment class about the Holy Spirit.'],
  ['Where should I begin?', 'Start with the class that is meeting on Sunday morning. If you are not sure where to go, ask anyone on our welcome team.'],
];

export default function Discipleship() {
  usePageMeta('discipleship');
  const SITE = useSite();
  return (
    <>
      <PageHeader kicker="Discipleship" title="Adult Discipleship Training" intro="Sunday morning classes where adults learn to know God, share life, and serve others." />

      <PhotoSplit tone="white" slot="discipleship-intro" side="right">
        <p className="lead">Every Sunday at 9:30am, one hour before worship, adults meet to learn and practice what it means to follow Jesus together.</p>
        <p className={`mt-4 ${P}`}>The classes follow a five-year plan. It covers nine spiritual practices and the core values of our church. The plan repeats, so you can join at any point and still cover everything.</p>
      </PhotoSplit>

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
        <SectionHeader title="What you will learn" intro="There are two kinds of classes. Some teach the nine spiritual practices. Others teach the core values of our church." className="!mb-0" />
      </Section>

      <PhotoBand slot="discipleship-practices">
        <h2 className="text-3xl md:text-5xl mb-5">The nine spiritual practices</h2>
        <p className="text-base leading-relaxed">A spiritual practice is a regular habit that helps you grow closer to God. We group the nine practices under our three words: Know God, Share Life, and Serve Others.</p>
      </PhotoBand>

      <Section tone="white">
        <div className="grid md:grid-cols-3 gap-6">
          {GROUPS.map(g => (
            <div key={g.name} className="fcard !p-8">
              <h4 className="text-2xl mb-4">{g.name}</h4>
              <dl className="space-y-4">
                {g.practices.map(([t, d]) => (
                  <div key={t}>
                    <dt className="font-display font-bold">{t}</dt>
                    <dd className={P}>{d}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </Section>

      <PhotoSplit tone="gray" slot="discipleship-values" side="left">
        <h2 className="text-3xl md:text-5xl mb-5">Values In The Kingdom</h2>
        <div className={`space-y-4 ${P}`}>
          <p>Values In The Kingdom is our class on the core values of our church. We offer two of them, a Yellow class and a Green class.</p>
          <p>Each class runs for three semesters, fall, winter, and spring, and goes through our six core values, from healthy relationships to living the Gospel.</p>
        </div>
      </PhotoSplit>

      <Section tone="white" narrow>
        <SectionHeader title="How the five years work" />
        <div className={`space-y-4 ${P}`}>
          <p>Each year on Sunday mornings is one of two kinds. A practices year goes through three of the nine spiritual practices, one in the fall, one in the winter, and one in the spring. A Values In The Kingdom year studies the core values of our church in one class that runs through the fall, winter, and spring.</p>
          <p>The two kinds of years take turns over five years, and then the plan starts over. Wherever you join, you will come back around to everything you missed.</p>
        </div>
      </Section>

      <PhotoSplit tone="gray" slot="discipleship-wednesday" side="right">
        <h2 className="text-3xl md:text-5xl mb-5">Wednesday evenings</h2>
        <div className={`space-y-4 ${P}`}>
          <p>Wednesday evenings from 6:30 to 8:00pm are for enrichment classes. These are separate from Adult Discipleship Training.</p>
          <p>The classes cover everyday life, with topics such as Marriage, Parenting, and Finances, and Spirit Class, a class about the Holy Spirit.</p>
          <p>Junior high (6th through 8th grade) and high school (9th through 12th grade) youth groups meet at the same time, and childcare is offered during Wednesday classes.</p>
        </div>
      </PhotoSplit>

      <Section tone="white" narrow>
        <SectionHeader title="Questions" />
        <Accordion items={FAQ.map(([q, a]) => ({ id: q.toLowerCase().replace(/[^a-z]+/g, '-'), title: q, content: <p className={P}>{a}</p> }))} />
      </Section>
    </>
  );
}
