import React from 'react';
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import { useSite } from '../settings';
import { Btn, Section, SectionHeader, PageHeader, Steps, PhotoBand, Cards, Card } from '../components/ui';
import SafeIcon from '../common/SafeIcon';
import { FiMusic, FiUsers, FiBookOpen, FiCoffee, FiSmile, FiCalendar, FiGift, FiHeart } from 'react-icons/fi';
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

      <Section tone="gray">
        <SectionHeader title="Sunday at a glance" />
        <ol className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {GLANCE.map(([when, what]) => (
            <li key={when} className="bg-white rounded-[10px] p-6 elev-1">
              <p className="font-display font-bold text-2xl md:text-3xl text-[#c74f2f] leading-tight">{when}</p>
              <p className="mt-3 text-[1rem] leading-snug text-black">{what}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="white">
        <SectionHeader title="What to expect" intro="Come as you are. Here is what the rest of the morning looks like." />
        <Cards cols={3}>
          <Card title="Worship" as="h3" icon={<SafeIcon icon={FiMusic} size={32} aria-hidden="true" className="text-[#c74f2f]" />}><p>Adults and children begin the service together. The music is contemporary, and lyrics and Scripture appear on screens, so you can follow along without a Bible. Sit, stand, or raise your hands, whichever feels right to you.</p></Card>
          <Card title="For your kids" as="h3" icon={<SafeIcon icon={FiUsers} size={32} aria-hidden="true" className="text-[#c74f2f]" />}><p>Kids classes begin at 9:30am. During worship, children sit with their families and then go to age-appropriate programs just before the message. Check-in is secure, every volunteer is background checked and trained, and only authorized adults can pick up a child. The nursery stays open for the whole service, and a parent viewing room lets you follow along while you care for little ones.</p></Card>
          <Card title="The message" as="h3" icon={<SafeIcon icon={FiBookOpen} size={32} aria-hidden="true" className="text-[#c74f2f]" />}><p>Our teaching is practical and rooted in the Bible, and it helps you live out your faith in everyday life. Adults and teens stay in the sanctuary for the message while children head to their programs.</p></Card>
          <Card title="Coffee and conversation" as="h3" icon={<SafeIcon icon={FiCoffee} size={32} aria-hidden="true" className="text-[#c74f2f]" />}><p>After worship, we pause for coffee and a chance to greet one another. It is an easy time to meet someone new. We never single out visitors or ask anyone to stand and introduce themselves.</p></Card>
          <Card title="What to wear" as="h3" icon={<SafeIcon icon={FiSmile} size={32} aria-hidden="true" className="text-[#c74f2f]" />}><p>Wear whatever is comfortable. You will see everything from jeans to business casual, and we care much more about meeting you than about what you have on.</p></Card>
          <Card title="Wednesday nights" as="h3" icon={<SafeIcon icon={FiCalendar} size={32} aria-hidden="true" className="text-[#c74f2f]" />}><p>Adult enrichment classes such as marriage and parenting, junior high youth group (6th through 8th grade), and high school youth group (9th through 12th grade) meet Wednesdays from 6:30 to 8:00pm. Childcare is offered during Wednesday classes.</p></Card>
          <Card title="After the service" as="h3" icon={<SafeIcon icon={FiGift} size={32} aria-hidden="true" className="text-[#c74f2f]" />}><p>Stop by the Connection Center to pick up a welcome gift and learn more about our church. Our team members are glad to answer questions or pray with you.</p></Card>
          <Card title="Accessibility" as="h3" className="md:col-span-2 lg:col-span-2" icon={<SafeIcon icon={FiHeart} size={32} aria-hidden="true" className="text-[#c74f2f]" />}><p>Our building is fully wheelchair accessible, with designated seating areas. For hearing needs, the free Listen Everywhere app streams our audio straight to your phone or tablet on iOS and Android. Bring your own headphones. If you have other needs, tell us ahead of time and we will plan for them.</p><div className="flex flex-wrap gap-3 pt-1"><Btn href={SITE.listenApps.apple} variant="ghost">App Store</Btn><Btn href={SITE.listenApps.google} variant="ghost">Google Play</Btn></div></Card>
        </Cards>
      </Section>

      <PhotoBand slot="plan-connect" id="connect-card">
        <h2 className="text-3xl md:text-5xl mb-5">Let us know you are coming</h2>
        <p className="text-base leading-relaxed">Fill out our short online Connect Card, and our welcome team will be ready to greet you. We keep your information confidential and use it only to serve you well.</p>
        <div className="mt-6"><Btn to="/connect" variant="primary">Fill Out the Connect Card</Btn></div>
      </PhotoBand>

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

      <Section tone="gray">
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
