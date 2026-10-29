import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { Btn, Section, SectionHeader, PageHeader, QuickFacts, Todo, AdminOnly, EndCta } from '../components/ui';

export default function Youth() {
  usePageMeta('youth');
  return (
    <>
      <PageHeader
        kicker="Upper Room Youth"
        title="Upper Room Youth"
        intro="Middle school and high school are a lot. Upper Room Youth is a safe place for 6th to 12th graders to make real friends, ask hard questions, and build a faith that holds up after graduation."
      />

      <Section tone="cream" className="!pb-0 md:!pb-0">
        <QuickFacts items={[
          { label: 'Who', value: '6th to 12th graders' },
          { label: 'When', value: 'Every Wednesday, 6:30 to 8:00pm' },
          { label: 'Where', value: 'The Student Center' },
        ]} />
      </Section>

      <Section tone="cream">
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <SectionHeader title="Why it matters" className="!mb-4" />
            <p className="text-lg leading-relaxed text-black/80">The teenage years shape a lot of what comes later. We teach the Bible straight and help students take it with them to school, home, and the community. We also care about helping students live a supernatural lifestyle and build healthy relationships during these years.</p>
          </div>
          <div>
            <SectionHeader title="What students get" className="!mb-4" />
            <ul className="list-disc pl-6 space-y-2 text-lg text-black/80">
              <li>Teaching that speaks to the real issues teenagers face</li>
              <li>Service opportunities that build leadership and character</li>
              <li>Regular events and retreats that build friendships and spiritual momentum</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="sand">
        <AdminOnly>
          <p className="mb-3 text-lg"><Todo id="youth-leader">[YOUTH LEADER NAME, EMAIL, PHONE]</Todo></p>
          <p className="mb-3 text-lg"><Todo id="youth-parents">[PERMISSION FORMS, SAFETY POLICY]</Todo></p>
          <p className="mb-3 text-lg"><Todo id="youth-events">[LIST]</Todo></p>
        </AdminOnly>
        <h2 className="text-2xl mb-3">Upcoming events</h2>
        <p className="text-lg text-black/80 mb-5">Retreats and special nights are on the calendar.</p>
        <Btn to="/events" variant="ghost">See the calendar</Btn>
      </Section>

      <EndCta title="Parents, your questions are welcome" text="Send us a message and we will help however we can." to="/contact" label="Send a message" />
    </>
  );
}
