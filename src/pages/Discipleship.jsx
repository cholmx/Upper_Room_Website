import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { useSite } from '../settings';
import { Btn, Section, SectionHeader, PageHeader, Accordion, Todo, Band, Panel, PhotoSplit, SlotImage } from '../components/ui';

const P = 'text-[0.95rem] leading-relaxed text-[#1e2522]/80';

const GROUPS = [
  ['Know God', 'Prayer, Scripture, Solitude'],
  ['Share Life', 'Sabbath, Community, Generosity'],
  ['Serve Others', 'Service, Witness, Fasting'],
];

const PRACTICES = [
  ['Prayer', 'Ongoing conversation with God, on your own and with others.'],
  ['Scripture', 'Reading, studying, and living by the Word.'],
  ['Solitude', 'Quiet time alone with God, away from noise and demands.'],
  ['Sabbath', 'Weekly rest that trusts God with your time and your worth.'],
  ['Community', 'Honest, committed relationships where you are known and cared for.'],
  ['Generosity', 'Open-handed living with your money, time, and attention.'],
  ['Service', 'Using your gifts to meet real needs at church and in the community.'],
  ['Witness', 'Sharing the good news of Jesus through your words and your life.'],
  ['Fasting', 'Setting aside food or other comforts to turn your hunger toward God.'],
];

const LOOP = [
  ['Year 1', 'Practice Year One: Sabbath, Prayer, Service'],
  ['Year 2', 'VIK Yellow'],
  ['Year 3', 'Practice Year Two: Community, Scripture, Witness'],
  ['Year 4', 'VIK Green'],
  ['Year 5', 'Practice Year Three: Generosity, Solitude, Fasting'],
];

const FAQ = [
  ['Do I have to sign up?', 'No. Come to any class that is meeting.'],
  ['Do I have to start in the fall?', 'No. Come whenever you are ready. The classes run on a repeating schedule, so whatever you miss at the start comes back around.'],
  ['What does VIK mean?', 'VIK stands for Values in the Kingdom. VIK Yellow and VIK Green are two classes that each run all year and cover the core values of our church.'],
  ['What is Spirit Class?', 'Spirit Class is a Wednesday evening class on the Holy Spirit.'],
  ['What is Open Class?', 'Open Class is a slot for a topic that has not been chosen yet. We announce it ahead of time.'],
  ['Where should I begin?', 'Whichever class is meeting now. Just come.'],
];

export default function Discipleship() {
  usePageMeta('discipleship');
  const SITE = useSite();
  return (
    <>
      <PageHeader kicker="Discipleship" title="Adult Discipleship Training" intro="Grow in Know God, Share Life, and Serve Others." />

      <PhotoSplit tone="white" slot="discipleship-intro" side="right">
        <p className="lead">Adult Discipleship Training is a set of Sunday morning and Wednesday evening classes for adults. Over about five years, you work through nine spiritual practices and study the core values of our church. There is nothing to sign up for. Come to any class, and the schedule repeats so you will not miss anything.</p>
      </PhotoSplit>

      <Band>
        <Panel tone="forest" title="When we meet">
          <p>Sunday mornings at 9:30am, one hour before worship. Kids classes meet at the same time.</p>
          <p>Wednesday evenings from 6:30 to 8:00pm. Childcare is provided.</p>
        </Panel>
        <Panel tone="sage" title="Just come">
          <p>There is no sign-up. Show up on a Sunday at 9:30am or a Wednesday at 6:30pm and join the class that is meeting. If you would like help finding the right room, ask anyone on our welcome team or email <a className="underline underline-offset-4 font-semibold" href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
        </Panel>
      </Band>

      <Section tone="white">
        <SectionHeader title="The nine practices" />
        <SlotImage slot="discipleship-practices" ratio="aspect-[21/9]" className="mb-10" />
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {GROUPS.map(([t, d]) => (
            <div key={t} className="fcard !p-6">
              <h3 className="text-xl mb-1">{t}</h3>
              <p className={P}>{d}</p>
            </div>
          ))}
        </div>
        <dl className="grid md:grid-cols-3 gap-x-10 gap-y-6">
          {PRACTICES.map(([t, d]) => (
            <div key={t}>
              <dt className="font-display font-bold text-lg">{t}</dt>
              <dd className={P}>{d}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section tone="white">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16">
          <div>
            <SectionHeader title="How Sunday mornings work" className="!mb-4" />
            <div className={`space-y-4 ${P}`}>
              <p>Each year on Sunday mornings is one of two kinds.</p>
              <p><strong>A practice year</strong> covers three practices. Fall is a Share Life practice, winter is a Know God practice, and spring is a Serve Others practice.</p>
              <p><strong>A VIK year</strong> studies the core values of our church. VIK stands for Values in the Kingdom. We offer two classes, VIK Yellow and VIK Green, and each one runs all year.</p>
              <p>The years follow a five-year loop, and then the loop starts over.</p>
            </div>
          </div>
          <div>
            <h3 className="text-2xl mb-4">The five-year loop</h3>
            <ol className="divide-y divide-[#1e2522]/10">
              {LOOP.map(([y, d]) => (
                <li key={y} className="grid grid-cols-4 gap-4 py-3">
                  <span className="font-display font-bold">{y}</span>
                  <span className={`col-span-3 ${P}`}>{d}</span>
                </li>
              ))}
            </ol>
            <p className={`mt-4 ${P}`}>Join whatever class is meeting now. After about five years, you will have covered everything.</p>
          </div>
        </div>
      </Section>

      <Section tone="gold">
        <SectionHeader title="This year, 2026-27" />
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-2xl mb-3">Sunday mornings, Practice Year One</h3>
            <ul className="space-y-1 text-[0.95rem]"><li>Fall: Sabbath</li><li>Winter: Prayer</li><li>Spring: Service</li></ul>
          </div>
          <div>
            <h3 className="text-2xl mb-3">Wednesday evenings</h3>
            <ul className="space-y-1 text-[0.95rem]"><li>Fall: Marriage</li><li>Winter: Spirit Class</li><li>Spring: Open Class</li></ul>
          </div>
        </div>
      </Section>

      <PhotoSplit tone="white" slot="discipleship-wednesday" side="left">
        <SectionHeader title="Wednesday evenings" className="!mb-6" />
        <p className={P}>Wednesday adult classes cover everyday life. Topics include Marriage, Parenting, Finances, and Spirit Class, a class on the Holy Spirit. Open Class is a slot for a topic still to be chosen, and we announce it ahead of time. Junior high (6th through 8th grade) and high school (9th through 12th grade) youth groups meet at the same time, and childcare is offered during Wednesday classes.</p>
        <div className="mt-6">
          {SITE.scheduleUrl
            ? <Btn href={SITE.scheduleUrl} variant="primary">Download the Full Ten-Year Schedule</Btn>
            : <Todo id="schedule-pdf">[Upload the ten-year schedule and link it here]</Todo>}
        </div>
      </PhotoSplit>

      <Section tone="white" narrow>
        <SectionHeader title="Questions" />
        <Accordion items={FAQ.map(([q, a]) => ({ id: q.toLowerCase().replace(/[^a-z]+/g, '-'), title: q, content: <p className={P}>{a}</p> }))} />
      </Section>
    </>
  );
}
