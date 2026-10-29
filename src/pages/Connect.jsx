import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { Section, PageHeader, EndCta } from '../components/ui';
import FormBlock from '../components/FormBlock';

export default function Connect() {
  usePageMeta('connect');
  return (
    <>
      <PageHeader
        kicker="Connect card"
        title="We would love to meet you"
        intro="Whether you are planning your first visit or have been with us a few times, fill this out so we can welcome you well, answer your questions, and help you find your place."
      />
      <Section tone="cream" narrow>
        <FormBlock formKey="connect" />
        <p className="mt-4 text-sm text-[#2b2f2d]">We only use your information to help with your visit.</p>
      </Section>
      <EndCta title="Not ready to fill this out?" text="No problem. You are welcome on Sunday whether or not you send a card." to="/plan-your-visit" label="Plan Your Visit" />
    </>
  );
}
