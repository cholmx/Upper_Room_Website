import React from 'react';
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import { VISIT_FAQ_GROUPS } from '../content/faqs';
import { Section, SectionHeader, PageHeader, Accordion, Btn } from '../components/ui';

const slug = (q) => q.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');

// Answers to the questions first-time visitors ask. The same text is described to search engines as FAQ data.
export default function Faq() {
  usePageMeta('faq');
  return (
    <>
      <PageHeader kicker="New Here?" title="Frequently asked questions" intro="Straight answers to what first-time visitors ask about Sundays, kids, what we believe, and how to get connected." />
      {VISIT_FAQ_GROUPS.map((g, i) => (
        <Section key={g.title} tone={i % 2 === 0 ? 'white' : 'gray'} narrow>
          <SectionHeader title={g.title} />
          <Accordion group={`faq-${i}`} items={g.items.map(([q, a, link]) => ({
            id: slug(q),
            title: q,
            content: (
              <>
                <p className="text-[1rem] leading-relaxed text-black">{a}</p>
                {link && <p className="mt-3"><Link to={link[1]} className="underline underline-offset-4 font-semibold">{link[0]}</Link></p>}
              </>
            ),
          }))} />
        </Section>
      ))}
      <Section tone="white" narrow>
        <SectionHeader title="Still have a question?" intro="We would love to hear from you. Send us a message and someone from our church family will reply." className="!mb-6" />
        <div className="flex flex-wrap gap-3">
          <Btn to="/contact" variant="primary">Contact us</Btn>
          <Btn to="/plan-your-visit" variant="ghost">Plan your visit</Btn>
        </div>
      </Section>
    </>
  );
}
