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
        title="We would love to meet you!"
        intro="Whether you are planning your first visit or you have just been with us, we want to connect with you! Fill out the form here so we can welcome you properly, answer any questions, and help you find your place in our church family."
      />
      <Section tone="cream" narrow>
        <FormBlock formKey="connect" heading="Connect Card" />
      </Section>
    </>
  );
}
