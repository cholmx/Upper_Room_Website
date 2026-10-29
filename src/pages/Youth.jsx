import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { Btn, Section, SectionHeader, PageHeader, QuickFacts, Todo, EndCta } from '../components/ui';

export default function Youth() {
  usePageMeta('youth');
  return (
    <>
      <PageHeader
        kicker="Upper Room Youth"
        title="Upper Room Youth"
        intro="Middle school and high school are a lot. Upper Room Youth is a safe place for 6th to 12th graders to make real friends, ask hard questions, and build a faith that holds up after graduation."
        photo="youth-center"
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
            <p className="text-lg leading-relaxed text-[#2b2f2d]">The teenage years shape a lot of what comes later. We teach the Bible straight and help students take it with them to school, home, and the community. We also care about helping students live a supernatural lifestyle and build healthy relationships during these years.</p>
          </div>
          <div>
            <SectionHeader title="What students get" className="!mb-4" />
            <ul className="list-disc pl-6 space-y-2 text-lg text-[#2b2f2d]">
              <li>Teaching that speaks to the real issues teenagers face</li>
              <li>Service opportunities that build leadership and character</li>
              <li>Regular events and retreats that build friendships and spiritual momentum</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="sand">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-2xl mb-3">Contact</h2>
            <p><Todo id="youth-leader">[YOUTH LEADER NAME, EMAIL, PHONE]</Todo></p>
          </div>
          <div>
            <h2 className="text-2xl mb-3">For parents</h2>
            <p><Todo id="youth-parents">[PERMISSION FORMS, SAFETY POLICY]</Todo></p>
          </div>
          <div>
            <h2 className="text-2xl mb-3">Upcoming events</h2>
            <p><Todo id="youth-events">[LIST]</Todo></p>
            <p className="mt-3"><Btn to="/events" variant="ghost">See the calendar</Btn></p>
          </div>
        </div>
      </Section>

      <EndCta title="Parents, your questions are welcome" text="Send us a message and we will help however we can." to="/contact" label="Send a message" />
    </>
  );
}
