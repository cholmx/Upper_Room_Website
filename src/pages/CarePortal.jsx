import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { useSite } from '../settings';
import { Btn, Section, SectionHeader, PageHeader, Steps, Band, Panel, PhotoSplit } from '../components/ui';

const P = 'text-[0.95rem] leading-relaxed text-[#1e2522]/80';
const PORTAL = 'https://system.careportal.org/church/103440?q[status][0]=Open';

export default function CarePortal() {
  usePageMeta('careportal');
  const SITE = useSite();
  return (
    <>
      <PageHeader
        kicker="CarePortal"
        title="CarePortal"
        intro="Making a tangible difference in children’s lives. We partner with CarePortal to connect our church family directly with local children and families in crisis."
      >
        <Btn href={PORTAL} variant="primary">Go to the CarePortal</Btn>
      </PageHeader>

      <PhotoSplit tone="white" slot="careportal-intro" side="right">
        <SectionHeader title="How CarePortal works" className="!mb-6" />
        <div>
          <Steps items={[
            { title: 'Uncovering real needs', body: <p>Child welfare professionals, teachers, law enforcement officers, and other community workers identify specific needs of vulnerable children and families they serve. When those needs are met, children stay safe, families stay together, and communities grow stronger.</p> },
            { title: 'Sharing verified requests', body: <p>After thorough vetting, these professionals enter specific needs into the CarePortal system. Each request is legitimate and accurate. Needs range from basic necessities like beds and appliances to mentoring, transportation, or housing assistance.</p> },
            { title: 'Connecting needs with our church', body: <p>Our CarePortal team receives email alerts about needs in our community. We share these opportunities with our church family through announcements, our email list, and social media, so everyone can take part according to their gifts and resources.</p> },
            { title: 'Our church family responds', body: <p>When we see a need we can meet, our team coordinates the response, gathering needed items, funds, or volunteers. Over half of CarePortal requests receive responses within 48 hours. Trained team members often help deliver items, which creates real connections with the families we serve.</p> },
          ]} />
        </div>
      </PhotoSplit>

      <Band>
        <Panel tone="forest" title="The impact of CarePortal">
          <p>Each need met represents a life touched. When we provide a bed for a child, we give that child a safe place to sleep and show their family that they matter to God and to our community.</p>
          <p>These expressions of love often open doors to ongoing relationships. What begins as meeting a physical need can grow into mentoring, friendship, and spiritual support.</p>
        </Panel>
        <Panel tone="terra" title="How you can get involved">
          <ul>
            <li>Join our response team to review needs and coordinate our church’s responses.</li>
            <li>Contribute requested items or give financially toward specific needs.</li>
            <li>Offer skills like moving furniture, making repairs, or providing transportation.</li>
            <li>Pray for the families served and for our response team.</li>
          </ul>
        </Panel>
      </Band>

      <PhotoSplit tone="white" slot="careportal-involved" side="left">
        <SectionHeader title="Connect with our CarePortal ministry" className="!mb-6" />
        <p className={P}>To learn more about our involvement with CarePortal or to join our response team, email <a className="underline underline-offset-4 font-semibold text-[#1e2522]" href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
        <p className={`mt-4 ${P}`}>CarePortal is a platform that connects churches to vetted needs in their community. Through this technology, we respond to the needs of local children and families in crisis. Together, we are building a community where every child is safe and loved.</p>
      </PhotoSplit>
    </>
  );
}
