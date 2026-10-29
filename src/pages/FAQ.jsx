import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import useJsonLd from '../hooks/useJsonLd';
import { FAQ, faqToAccordion } from '../content/faq';
import { Section, PageHeader, Accordion, EndCta } from '../components/ui';

export default function FAQPage() {
  usePageMeta('faq');
  useJsonLd({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(i => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.plain } })),
  });
  return (
    <>
      <PageHeader kicker="Questions" title="Questions people ask" intro="Short answers to the things first-time visitors often wonder." />
      <Section tone="cream" narrow>
        <Accordion items={faqToAccordion(FAQ)} />
      </Section>
      <EndCta title="Still have a question?" text="Ask us anything. Someone will reply within 48 hours." to="/contact" label="Send a message" />
    </>
  );
}
