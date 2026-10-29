import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { Section, PageHeader, Todo } from '../components/ui';
import FormBlock from '../components/FormBlock';

export default function Prayer() {
  usePageMeta('prayer');
  return (
    <>
      <PageHeader
        kicker="Prayer"
        title="We would love to pray with you"
        intro="Whatever you are carrying, you do not have to carry it alone. Send us a request and our church family will pray."
      />
      <Section tone="cream" narrow>
        <FormBlock formKey="prayer" />
        <p className="mt-5 text-sm text-[#2b2f2d]"><Todo id="prayer-who">[CONFIRM WHO RECEIVES REQUESTS AND WHETHER FOLLOW-UP HAPPENS]</Todo></p>
      </Section>
    </>
  );
}
