import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { Section, PageHeader } from '../components/ui';
import FormBlock from '../components/FormBlock';

export default function Connect() {
  usePageMeta('connect');
  return (
    <>
      <PageHeader
        kicker="Connect with us"
        title="We would love to meet you"
        intro="Planning your first visit? Been with us once or a few times? Ready to get connected? Fill out the Connect Card so we can welcome you well, answer your questions, and help you find your place in our church family."
      />
      <Section tone="white" narrow>
        <FormBlock formKey="connect" heading="Connect Card" intro="Fill out as much as you feel comfortable with. Only your name and email are required. Anything else helps us welcome you and your family well." />
      </Section>
    </>
  );
}
