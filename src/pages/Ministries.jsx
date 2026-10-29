import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { MINISTRIES } from '../content/ministries';
import { Section, PageHeader, Cards, Card, Todo, EndCta } from '../components/ui';

export default function Ministries() {
  usePageMeta('ministries');
  return (
    <>
      <PageHeader
        kicker="Ministries"
        title="Find your place"
        intro="Nobody watches from the sidelines here. Whatever your age or season of life, there is a place for you to belong and make a difference."
      />
      <Section tone="cream">
        <Cards>
          {MINISTRIES.map(m => (
            <Card key={m.to} as="h2" title={m.title} to={m.to} linkLabel="Learn more"><p>{m.text}</p></Card>
          ))}
        </Cards>
        <p className="mt-8"><Todo id="other-ministries">[ADD ANY OTHER MINISTRIES, such as men, women, seniors, young adults]</Todo></p>
      </Section>
      <EndCta title="Not sure which one fits?" text="Tell us a little about you and we will point you the right way." to="/contact" label="Send a message" />
    </>
  );
}
