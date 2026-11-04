import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { useSite } from '../settings';
import { Btn, Section, SectionHeader, PageHeader, Steps, Cards, Card, EndCta } from '../components/ui';

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
            { title: 'Uncovering real needs', body: <p>Child welfare professionals, teachers, law enforcement officers, and other community workers identify specific needs of the vulnerable children and families they serve. They know firsthand which needs, once met, could keep children safe, families together, and communities strong.</p> },
            { title: 'Sharing verified requests', body: <p>After careful vetting, these professionals enter specific needs into the CarePortal system. Each request is legitimate, accurate, and tied directly to a child’s wellbeing. Needs range from basics like beds and appliances to more specialized support like mentoring, transportation, or housing help.</p> },
            { title: 'Connecting needs with our church', body: <p>Our Upper Room Fellowship CarePortal team gets email alerts about needs in our community. We share those opportunities with our church family through announcements, our email list, and social media, so everyone can take part with the gifts and resources they have.</p> },
            { title: 'Our church family responds', body: <p>When we see a need we can meet, our team coordinates the response by gathering the items, funds, or volunteers we need. Over half of CarePortal requests get a response within 48 hours. Specially trained team members often help deliver items, which builds real connections with the families we serve.</p> },
          ]} />
        </div>
      </Section>

      <Section tone="sand">
        <SectionHeader title="The impact" />
        <div className="max-w-3xl space-y-4 text-lg leading-relaxed text-black/80">
          <p>Each need that gets met is a life touched. When we provide a bed for a child, we deliver furniture and we also give that child a safe place to sleep. We show the family that they matter to God and to our community.</p>
          <p>These practical acts of love often open the door to ongoing relationships. What starts as meeting a physical need can grow into mentoring, friendship, and spiritual support.</p>
        </div>
      </Section>

      <Section tone="cream">
        <SectionHeader title="Ways to get involved" />
        <Cards cols={4}>
          <Card title="Join the response team"><p>Become part of the core group that reviews needs and coordinates our church’s responses.</p></Card>
          <Card title="Contribute items or funds"><p>Donate requested items or give toward meeting specific needs.</p></Card>
          <Card title="Offer your skills"><p>Volunteer your talents in areas like moving furniture, making repairs, or providing rides.</p></Card>
          <Card title="Pray"><p>Support this ministry with steady prayer for the families served and for our response team.</p></Card>
        </Cards>
        <p className="mt-8 text-lg">To learn more or join our response team, email <a className="underline underline-offset-4 font-semibold text-[#2b433e]" href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
      </Section>

      <EndCta title="See the current needs" text="Open requests from our community are listed on CarePortal." href={SITE.careportalUrl} label="Go to the CarePortal" />
    </>
  );
}
