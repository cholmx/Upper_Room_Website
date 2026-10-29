import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { Section, SectionHeader, PageHeader, Todo, Photo, EndCta } from '../components/ui';

export default function Outreach() {
  usePageMeta('outreach');
  return (
    <>
      <PageHeader
        kicker="Outreach and missions"
        title="Outreach and Missions"
        intro="Jesus told His followers to be His witnesses in Jerusalem, Judea, Samaria, and to the ends of the earth. We take that seriously, so we serve locally, regionally, and globally through service projects, community partnerships, and missions."
        photo="outreach-1"
      />
      <Section tone="cream" narrow>
        <p className="text-lg leading-relaxed text-[#2b2f2d]">This is how we live the Gospel. We share the life of Christ through service and generosity, and we pass along the hope we have found.</p>
      </Section>
      <Section tone="sand">
        <SectionHeader kicker="Where we serve" title="Current partners and projects" />
        <p className="text-lg"><Todo id="outreach-partners">[LIST CURRENT PARTNERS AND PROJECTS WITH PHOTOS]</Todo></p>
      </Section>
      <Section tone="cream" narrow>
        <SectionHeader title="Get involved" />
        <p className="text-lg leading-relaxed text-[#2b2f2d]">If you have an hour a month, there is a place for you. If you feel called to something longer, we would love to talk. Speak with one of our pastors and we will help you find where your passion meets a need.</p>
      </Section>
      <EndCta title="Let’s find where you fit" text="Talk with a pastor about where your passion meets a need." to="/contact" label="Talk with a pastor" />
    </>
  );
}
