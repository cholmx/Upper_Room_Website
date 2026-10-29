import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { BELIEFS } from '../content/beliefs';
import { Section, PageHeader, Accordion, Todo, EndCta } from '../components/ui';
import RichText from '../components/RichText';

export default function Beliefs() {
  usePageMeta('beliefs');
  const items = BELIEFS.map(b => ({
    id: b.id,
    title: b.title,
    content: (
      <>
        <p className="font-semibold text-[#080c0b]">{b.plain}</p>
        {b.full ? <RichText value={b.full} /> : <p><Todo id="beliefs-full">[PASTE THE FULL STATEMENT FOR THIS TOPIC]</Todo></p>}
      </>
    ),
  }));

  return (
    <>
      <PageHeader
        kicker="What we believe"
        title="What we believe"
        intro="We hold a short list of beliefs tightly and give each other room to grow on the rest. Love holds us together. Each topic below starts with a plain-English line."
      />
      <Section tone="cream" narrow>
        <nav aria-label="Topics on this page" className="bg-white rounded-2xl border border-black/10 p-6 mb-10">
          <h2 className="text-xl mb-3">On this page</h2>
          <ul className="grid sm:grid-cols-2 gap-x-6">
            {BELIEFS.map(b => (
              <li key={b.id}><a href={`#${b.id}`} className="inline-flex items-center min-h-[44px] underline underline-offset-4 text-[#8A6309] font-medium">{b.title}</a></li>
            ))}
          </ul>
        </nav>
        <Accordion items={items} />
      </Section>
      <EndCta title="Questions about what we believe?" text="We are glad to talk. Send a message and a pastor will reply." to="/contact" label="Send a message" />
    </>
  );
}
