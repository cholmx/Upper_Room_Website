import React from 'react';
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import { useSite } from '../settings';
import { Btn, Section, SectionHeader, PageHeader, Steps, PhotoBand, Beats, Cards, Card } from '../components/ui';
import FormBlock from '../components/FormBlock';

const P = 'text-[1rem] leading-relaxed text-black';

const GLANCE = [
  ['9:30am', 'Adult and kids classes begin (optional).'],
  ['10:30am', 'Worship begins.'],
  ['After worship', 'A short coffee break.'],
  ['Then', 'The message for adults and teens, and kids programs for children birth through 5th grade.'],
  ['About 11:45am', 'The service ends, and our team is available to talk or pray with you.'],
];

export default function PlanYourVisit() {
  usePageMeta('plan');
  const SITE = useSite();

  return (
    <>
      <PageHeader
        kicker="New Here?"
        title="New Here?"
        intro="Walking into a church for the first time takes some courage. This page walks through a Sunday morning so you know what to expect before you arrive. Come as you are. We are glad you are coming."
      >
        <Btn to="/connect" variant="primary">Fill Out the Connect Card</Btn>
      </PageHeader>

      <Section tone="white" narrow>
        <SectionHeader title="Sunday at a glance" />
        <dl className="divide-y divide-[#1e2522]/10">
          {GLANCE.map(([when, what]) => (
            <div key={when} className="grid sm:grid-cols-4 gap-1 sm:gap-6 py-4">
              <dt className="font-display font-bold sm:col-span-1">{when}</dt>
              <dd className={`sm:col-span-3 ${P}`}>{what}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section tone="white">
        <Beats heading="h3" beats={[
          { title: 'Worship', photo: 'plan-worship', body: <p>Adults and children begin the service together. The music is contemporary, and lyrics and Scripture appear on screens, so you can follow along without a Bible. Sit, stand, or raise your hands, whichever feels right to you.</p> },
          { title: 'For your kids', photo: 'plan-kids', body: <p>Kids classes begin at 9:30am. During worship, children sit with their families and then go to age-appropriate programs just before the message. Check-in is secure, every volunteer is background checked and trained, and only authorized adults can pick up a child. The nursery stays open for the whole service, and a parent viewing room lets you follow along while you care for little ones.</p> },
        ]} />
        <div className="mt-14 md:mt-20">
          <Cards cols={2}>
            <Card title="Coffee and conversation" as="h3"><p>After worship, we pause for coffee and a chance to greet one another. It is an easy time to meet someone new. We never single out visitors or ask anyone to stand and introduce themselves.</p></Card>
            <Card title="The message" as="h3"><p>Our teaching is practical and rooted in the Bible, and it helps you live out your faith in everyday life. Adults and teens stay in the sanctuary for the message while children head to their programs.</p></Card>
            <Card title="What to wear" as="h3"><p>Wear whatever is comfortable. You will see everything from jeans to business casual, and we care much more about meeting you than about what you have on.</p></Card>
            <Card title="Wednesday nights" as="h3"><p>Adult enrichment classes such as marriage and parenting, junior high youth group (6th through 8th grade), and high school youth group (9th through 12th grade) meet Wednesdays from 6:30 to 8:00pm. Childcare is offered during Wednesday classes.</p></Card>
            <Card title="Accessibility" as="h3"><p>Our building is fully wheelchair accessible, with designated seating areas. For hearing needs, the free Listen Everywhere app streams our audio straight to your phone or tablet on iOS and Android. Bring your own headphones. If you have other needs, tell us ahead of time and we will plan for them.</p><div className="flex flex-wrap gap-3 pt-1"><Btn href={SITE.listenApps.apple} variant="ghost">App Store</Btn><Btn href={SITE.listenApps.google} variant="ghost">Google Play</Btn></div></Card>
          </Cards>
        </div>
      </Section>

      <PhotoBand slot="plan-connect" id="connect-card">
        <h2 className="text-3xl md:text-5xl mb-5">Let us know you are coming</h2>
        <p className="text-base leading-relaxed">Fill out our short online Connect Card, and our welcome team will be ready to greet you. We keep your information confidential and use it only to serve you well.</p>
        <div className="mt-6"><Btn to="/connect" variant="primary">Fill Out the Connect Card</Btn></div>
      </PhotoBand>

      <Section tone="gray" narrow>
        <h2 className="text-3xl md:text-5xl mb-5">After the service</h2>
        <p className={P}>Stop by the Connection Center to pick up a welcome gift and learn more about our church. Our team members are glad to answer questions or pray with you.</p>
      </Section>

      <Section tone="white">
        <SectionHeader title="Your next steps" />
        <div className="max-w-3xl">
          <Steps items={[
            { title: 'Let us know you are coming', body: <p>Fill out the <Link className="underline underline-offset-4 font-semibold" to="/connect">Connect Card</Link>.</p> },
            { title: 'Join us Sunday', body: <p>Worship starts at 10:30am at {SITE.addressLine}.</p> },
            { title: 'Find your people', body: <p>Join a Sunday morning adult class. Our welcome team can help you find the right one.</p> },
          ]} />
        </div>
      </Section>

      <Section tone="white">
        <div className="grid md:grid-cols-5 gap-10 items-start">
          <div className="md:col-span-2">
            <SectionHeader title="Questions before you visit?" className="!mb-6" />
            <p className={P}>Email <a className="underline underline-offset-4 font-semibold text-[#1e2522]" href={`mailto:${SITE.email}`}>{SITE.email}</a>, call <a className="underline underline-offset-4 font-semibold text-[#1e2522]" href={SITE.phoneHref}>{SITE.phone}</a>, or send us a message below.</p>
          </div>
          <div className="md:col-span-3"><FormBlock formKey="contact" /></div>
        </div>
      </Section>
    </>
  );
}
