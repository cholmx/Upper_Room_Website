import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { useSite } from '../settings';
import { Btn, Section, SectionHeader, PageHeader, Cards, Card, Steps, Band, Panel, Beats } from '../components/ui';
import FormBlock from '../components/FormBlock';

const P = 'text-lg leading-relaxed text-black/80';

export default function PlanYourVisit() {
  usePageMeta('plan');
  const SITE = useSite();

  return (
    <>
      <PageHeader
        kicker="New Here?"
        title="Welcome to Upper Room Fellowship!"
        intro="We are so glad you found us! Whether you are just curious about church or looking for a spiritual community to call home, you are welcome at Upper Room Fellowship. Visiting a church for the first time can feel intimidating, so we have put together this guide to help you know what to expect."
      >
        <Btn to="/connect" variant="primary">Fill out the Connect Card</Btn>
      </PageHeader>

      <Section tone="cream">
        <SectionHeader kicker="Sundays" title="What to expect on Sundays" />
        <Beats heading="h3" beats={[
            { title: 'Family worship together', body: <p>Our Sunday gatherings begin with everyone worshiping together, adults and children of all ages. We believe there is something powerful about families experiencing God’s presence as one community. You will hear contemporary worship music with lyrics projected on screens so everyone can follow along easily. Scripture readings are also displayed, so do not worry if you did not bring a Bible. Feel free to participate however you are comfortable, whether standing, sitting, or raising your hands.</p> },
            { title: 'Coffee and connection break', body: <p>After worship, we take a short break to grab coffee and greet each other. This casual time helps everyone, including first-time guests, feel welcome and connected. It is a perfect opportunity to meet someone new or catch up with friends. We never single out visitors or ask you to stand up and introduce yourself.</p> },
            { title: 'Message time and kids’ programs', body: <><p>Following our break, adults and youth remain in the sanctuary for the message, while children (birth through 5th grade) are dismissed to age-appropriate programs. Our nursery is open throughout the entire service for parents to use for infants and toddlers if needed.</p><p>Our messages are practical, Bible-based, and designed to help you live out your faith in everyday life. Each week, we explore how to know God more deeply, build healthy relationships, and discover our purpose.</p></> },
            { title: 'Casual atmosphere and accessibility', body: <><p>Do not worry about what to wear. Come as you are! You will see people in everything from jeans to business casual. We are more interested in meeting you than in what you are wearing.</p><p>Our building is fully wheelchair accessible with designated seating areas. For those with hearing needs, we offer the Listen Everywhere app that streams our audio directly to your smartphone or tablet. Just bring your own headphones. The free app is available in the Apple App Store and Google Play and works with both iOS and Android devices. If you have other specific needs, please let us know so we can better serve you.</p><div className="flex flex-wrap gap-3 pt-1"><Btn href={SITE.listenApps.apple} variant="ghost">Apple App Store</Btn><Btn href={SITE.listenApps.google} variant="ghost">Google Play</Btn></div></> },
          ]}
        />
      </Section>

      <Band id="connect-card">
        <Panel tone="forest" title="Let us know you are coming">
          <p className="font-serif text-[1.5rem] leading-snug">Let us know you are coming by filling out our Connect Card, and our welcome team will be ready for you!</p>
          <p>We meet every Sunday at 10:30am at {SITE.addressLine}.</p>
          <p>After your first visit, we would love to help you find a small group where you can build relationships and grow in faith.</p>
        </Panel>
        <Panel tone="terra" title="Fill out the Connect Card">
          <p>Our Connect Card is a simple online form. You will just need to provide your name, email, and the date you plan to visit. This helps our welcome team prepare for your arrival. All information is kept confidential and is only used to help us better serve you during your visit.</p>
          <div className="pt-2"><Btn to="/connect" variant="light">Go to the Connect Card</Btn></div>
        </Panel>
      </Band>

      <Section tone="cream">
        <SectionHeader kicker="Your first visit" title="Your first visit" />
        <Cards>
          <Card title="When you arrive" as="h3"><p>Our friendly greeters will be at the doors to say hello and help you find your way around. If you have children, they will direct you to our secure check-in area.</p></Card>
          <Card title="For your kids" as="h3"><p>We value your children’s safety. All our volunteers undergo background checks and training. Our check-in system ensures only authorized adults can pick up your child. Children stay with you during the worship time and are dismissed to their programs just before the message begins.</p></Card>
          <Card title="After the service" as="h3"><p>The service usually ends around 11:45am. Our team members are available to talk, answer questions, or pray with you. We also have a Connection Center where first-time guests can receive a special gift and learn more about our church.</p></Card>
        </Cards>
      </Section>

      <Section tone="white">
        <SectionHeader kicker="Next steps" title="Next steps at Upper Room Fellowship" intro="Ready to check us out? Here is how to get started." />
        <div className="max-w-3xl">
          <Steps items={[
            { title: 'Plan your visit', body: <p>Let us know you are coming by filling out our Connect Card online, and our welcome team will be ready to greet you.</p> },
            { title: 'Join us this Sunday', body: <p>We meet at 10:30am at {SITE.addressLine}.</p> },
            { title: 'Connect in community', body: <p>After your first visit, we would love to help you find a small group where you can build relationships and grow in faith.</p> },
          ]} />
        </div>
      </Section>

      <Section tone="cream">
        <div className="grid md:grid-cols-5 gap-10 items-start">
          <div className="md:col-span-2">
            <SectionHeader title="Any questions?" className="!mb-4" />
            <p className={P}>Have questions before you visit? Fill out the form, email us at <a className="underline underline-offset-4 font-semibold text-[#2b433e]" href={`mailto:${SITE.email}`}>{SITE.email}</a>, or call <a className="underline underline-offset-4 font-semibold text-[#2b433e]" href={SITE.phoneHref}>{SITE.phone}</a>.</p>
            <p className={`mt-4 ${P}`}>We are here to help make your first experience a great one!</p>
          </div>
          <div className="md:col-span-3"><FormBlock formKey="contact" /></div>
        </div>
      </Section>
    </>
  );
}
