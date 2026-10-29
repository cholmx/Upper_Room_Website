import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { Btn, Section, SectionHeader, PageHeader, Photo, Todo, AdminOnly, EndCta } from '../components/ui';

export default function Kids() {
  usePageMeta('kids');
  return (
    <>
      <PageHeader
        kicker="Upper Room Kids"
        title="Upper Room Kids"
        intro="Kids are part of the church today, and we treat them that way. Upper Room Kids is a lively, safe place for children from birth through 5th grade to learn about God’s love through age-appropriate teaching, games, and friends who know their names."
      />

      <Section tone="cream">
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <SectionHeader title="How Sunday works" className="!mb-4" />
            <p className="text-lg leading-relaxed text-black/80">Kids start the morning with you in worship. Right before the message begins, they head to classes for their age group.</p>
            <AdminOnly><p className="mt-3"><Todo id="kids-rooms">[AGE GROUPS AND ROOM LOCATIONS]</Todo></p></AdminOnly>
          </div>
          <div>
            <SectionHeader title="Safety" className="!mb-4" />
            <p className="text-lg leading-relaxed text-black/80">Every volunteer is background-checked and trained, and check-in makes sure only authorized adults can pick up your child. The nursery is open for the whole service, and a parent viewing room lets you follow along while you tend to a little one.</p>
            <AdminOnly><p className="mt-3"><Todo id="child-safety">[LINK TO CHILD SAFETY POLICY]</Todo></p></AdminOnly>
          </div>
        </div>
      </Section>

      <Section tone="sand">
        <SectionHeader title="What your kids will do" className="!mb-4" />
        <ul className="list-disc pl-6 space-y-2 text-lg text-black/80 max-w-3xl">
          <li>Hear Bible-based teaching that connects to their everyday lives</li>
          <li>Make friends in a safe, fun space</li>
          <li>Build their own relationship with Jesus through worship and prayer</li>
          <li>Discover their gifts and how God can use them right now</li>
        </ul>
        <AdminOnly>
          <p className="mt-6 text-lg"><Todo id="kids-events">[UPCOMING EVENTS]</Todo></p>
          <p className="mt-3 text-lg"><Todo id="kids-leader">[KIDS MINISTRY LEADER NAME, EMAIL]</Todo></p>
          <p className="mt-3 text-lg"><Todo id="kids-prereg">[CONNECT PRE-REGISTRATION TO A CHECK-IN SYSTEM OR FORM]</Todo></p>
        </AdminOnly>
        <div className="mt-8 flex flex-wrap gap-3">
          <Btn to="/plan-your-visit#connect-card" variant="ghost">Pre-register your child</Btn>
          <Btn to="/events" variant="ghost">See upcoming events</Btn>
        </div>
      </Section>

      <EndCta title="Questions about your child?" text="Send us a message and we will help you get ready for Sunday." to="/contact" label="Send a message" />
    </>
  );
}
