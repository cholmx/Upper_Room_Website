import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { Btn, Section, SectionHeader, PageHeader, Accordion, Todo, Steps, QuickFacts } from '../components/ui';
import FormBlock from '../components/FormBlock';
import { useSite } from '../settings';

const PASTE = (id, what) => <p><Todo id={id}>[PASTE THE EXISTING SOZO TEXT: {what}]</Todo></p>;

export default function Sozo() {
  usePageMeta('sozo');
  const SITE = useSite();
  return (
    <>
      <PageHeader
        kicker="Sozo"
        title="Sozo ministry"
        intro="Sozo is a Greek word that appears over a hundred times in the New Testament. It means to save, deliver, make whole, restore, and heal. Sozo ministry is a gentle, prayer-based time to ask the Father, Son, and Holy Spirit about the places where you feel stuck. If you sense there is more to your relationship with God than you are experiencing now, this is a good place to start."
      >
        <Btn href="#sozo-form" variant="primary">Request a Sozo session</Btn>
      </PageHeader>

      <Section tone="cream" className="!pb-0 md:!pb-0">
        <QuickFacts items={[
          { label: 'Length', value: 'About two hours' },
          { label: 'Arrive', value: '10 to 15 minutes early' },
          { label: 'Suggested donation', value: '$40. Financial assistance is available.' },
          { label: 'Who can come', value: 'Members and non-members' },
        ]} />
      </Section>

      <Section tone="cream">
        <div className="grid md:grid-cols-2 gap-10">
          <div><SectionHeader title="What is Sozo" className="!mb-4" />{PASTE('sozo-text', 'What is Sozo, with the Matthew 9:22 passage')}</div>
          <div><SectionHeader title="Biblical foundation" className="!mb-4" />{PASTE('sozo-text', 'Biblical foundation')}</div>
          <div><SectionHeader title="Our approach" className="!mb-4" />{PASTE('sozo-text', 'Our approach')}</div>
          <div>
            <SectionHeader title="Our Sozo tools" className="!mb-4" />
            <ul className="list-disc pl-6 space-y-1 text-lg">
              <li>The Father Ladder</li>
              <li>The Wall</li>
              <li>Presenting Jesus</li>
            </ul>
            {PASTE('sozo-text', 'a short description of each tool')}
          </div>
        </div>
      </Section>

      <Section tone="sand">
        <SectionHeader title="How to begin" />
        <div className="max-w-3xl">
          <Steps items={[
            { title: 'Step 1', body: PASTE('sozo-text', 'step 1') },
            { title: 'Reach out', body: <p>Fill out the form below and our Sozo coordinator will contact you within 3 to 5 business days. You can also email <a className="underline underline-offset-4 font-semibold" href={`mailto:${SITE.email}`}>{SITE.email}</a> with your name, phone number, and best times to reach you. Your inquiry is confidential and handled with care.</p> },
            { title: 'Step 3', body: PASTE('sozo-text', 'step 3') },
            { title: 'Step 4', body: PASTE('sozo-text', 'step 4') },
          ]} />
        </div>
      </Section>

      <Section tone="cream">
        <SectionHeader title="Common questions" />
        <Accordion items={[
          { id: 'q-length', title: 'How long is a session?', content: <p>A session lasts about two hours. Please arrive 10 to 15 minutes early.</p> },
          { id: 'q-cost', title: 'What does it cost?', content: <p>We suggest a donation of $40. Financial assistance is available.</p> },
          { id: 'q-reply', title: 'How soon will I hear back?', content: <p>Our Sozo coordinator will reply within 3 to 5 business days.</p> },
          { id: 'q-who', title: 'Who can receive Sozo?', content: <p>Sozo is open to members and non-members.</p> },
          { id: 'q-private', title: 'Is it confidential?', content: <p>Yes. What you share is kept confidential, except where we are legally required to report.</p> },
          { id: 'q-counsel', title: 'Is Sozo counseling?', content: <p>No. Sozo does not replace professional counseling or medical care.</p> },
          { id: 'q-more', title: 'Other questions', content: PASTE('sozo-text', 'the rest of the FAQ') },
        ]} />
      </Section>

      <Section tone="sand">
        <div className="grid md:grid-cols-2 gap-10">
          <div><SectionHeader title="What Sozo is not" className="!mb-4" /><p className="text-lg leading-relaxed text-[#2b2f2d]">Sozo does not replace professional counseling or medical care.</p>{PASTE('sozo-text', 'what Sozo is NOT')}</div>
          <div><SectionHeader title="Our team" className="!mb-4" />{PASTE('sozo-text', 'our Sozo team')}</div>
          <div><SectionHeader title="Recommended resources" className="!mb-4" />{PASTE('sozo-text', 'recommended resources')}</div>
          <div><SectionHeader title="A closing word" className="!mb-4" />{PASTE('sozo-text', 'closing with Isaiah 61:1')}</div>
        </div>
      </Section>

      <Section tone="cream" id="sozo-form">
        <div className="grid md:grid-cols-5 gap-10 items-start">
          <div className="md:col-span-2">
            <SectionHeader title="Request a Sozo session" className="!mb-4" />
            <p className="text-lg leading-relaxed text-[#2b2f2d]">Your inquiry is confidential. Prefer email? Write to <a className="underline underline-offset-4 font-semibold" href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
          </div>
          <div className="md:col-span-3"><FormBlock formKey="sozo" /></div>
        </div>
      </Section>
    </>
  );
}
