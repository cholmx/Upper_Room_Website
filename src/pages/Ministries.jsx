import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { MINISTRIES } from '../content/ministries';
import { Section, SectionHeader, PageHeader, Cards, Card, Todo, AdminOnly, EndCta } from '../components/ui';

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
        <AdminOnly><p className="mt-8"><Todo id="other-ministries">[ADD ANY OTHER MINISTRIES, such as men, women, seniors, young adults]</Todo></p></AdminOnly>
      </Section>
      <Section tone="white" id="outreach">
        <SectionHeader kicker="Outreach and missions" title="Love in action, near and far" intro="Jesus told His followers to be His witnesses in Jerusalem, Judea, Samaria, and to the ends of the earth. We take that seriously, so we serve locally, regionally, and globally through service projects, community partnerships, and missions." />
        <div className="space-y-5 max-w-3xl text-lg leading-relaxed text-black/80">
          <p>This is how we live the Gospel. We share the life of Christ through service and generosity, and we pass along the hope we have found.</p>
          <AdminOnly><p><Todo id="outreach-partners">[LIST CURRENT PARTNERS AND PROJECTS WITH PHOTOS]</Todo></p></AdminOnly>
          <p>If you have an hour a month, there is a place for you. If you feel called to something longer, speak with one of our pastors and we will help you find where your passion meets a need.</p>
        </div>
      </Section>
      <EndCta title="Not sure which one fits?" text="Tell us a little about you and we will point you the right way." to="/contact" label="Send a message" />
    </>
  );
}
