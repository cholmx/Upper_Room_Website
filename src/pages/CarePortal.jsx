import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { useSite } from '../settings';
import { Btn, Section, SectionHeader, PageHeader, Steps, Cards, Card, Todo, EndCta } from '../components/ui';

export default function CarePortal() {
  usePageMeta('careportal');
  const SITE = useSite();
  return (
    <>
      <PageHeader
        kicker="CarePortal"
        title="CarePortal"
        intro="Local teachers, social workers, and other community workers know which children and families are in crisis, and they know what would help. Through CarePortal, they share those needs with us, and our church family steps in. A bed, an appliance, a ride, a mentor. Small things like these can keep a family together."
      >
        <Btn href={SITE.careportalUrl} variant="primary">Go to the CarePortal</Btn>
      </PageHeader>

      <Section tone="cream">
        <SectionHeader title="How it works" />
        <div className="max-w-3xl">
          <Steps items={[
            { title: 'Uncovering real needs', body: <><p>Teachers, social workers, and other community workers see which children and families are in crisis.</p><p><Todo id="careportal-text">[PASTE THE CAREPORTAL TEXT FOR THIS STEP]</Todo></p></> },
            { title: 'Sharing verified requests', body: <p><Todo id="careportal-text">[PASTE THE CAREPORTAL TEXT FOR THIS STEP]</Todo></p> },
            { title: 'Connecting needs with our church', body: <p><Todo id="careportal-text">[PASTE THE CAREPORTAL TEXT FOR THIS STEP]</Todo></p> },
            { title: 'Our church family responds', body: <p>Our church family responds with beds, appliances, rides, mentoring, and more. Over half of CarePortal requests get a response within 48 hours.</p> },
          ]} />
        </div>
      </Section>

      <Section tone="sand">
        <SectionHeader title="Ways to get involved" />
        <Cards cols={4}>
          <Card title="Join the response team"><p>Be one of the people who answers when a need comes in.</p></Card>
          <Card title="Contribute items or funds"><p>Give toward the beds, appliances, and basics families need.</p></Card>
          <Card title="Offer your skills"><p>Repairs, rides, mentoring, and more. Tell us what you are good at.</p></Card>
          <Card title="Pray"><p>Pray for the children and families behind each request.</p></Card>
        </Cards>
        <p className="mt-8 text-lg">To learn more or join our response team, email <a className="underline underline-offset-4 font-semibold text-[#8A6309]" href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
      </Section>

      <EndCta title="See the current needs" text="Open requests from our community are listed on CarePortal." href={SITE.careportalUrl} label="Go to the CarePortal" />
    </>
  );
}
