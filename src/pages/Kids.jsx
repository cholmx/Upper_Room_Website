import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { Btn, Section, SectionHeader, PageHeader, Photo, Todo, EndCta } from '../components/ui';

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
          </div>
          <div>
            <SectionHeader title="Safety" className="!mb-4" />
            <p className="text-lg leading-relaxed text-black/80">Every volunteer is background-checked and trained. Our check-in system makes sure only authorized adults can pick up your child. The nursery is open for the whole service for infants and toddlers, and a parent viewing room lets you follow the service while you tend to a little one.</p>
            <p className="mt-3"><Todo id="child-safety">[LINK TO CHILD SAFETY POLICY]</Todo></p>
          </div>
        </div>
      </Section>

      <Section tone="sand">
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <SectionHeader title="Classrooms by age" className="!mb-4" />
            <p><Todo id="kids-rooms">[AGE GROUPS AND ROOM LOCATIONS]</Todo></p>
          </div>
          <div>
            <SectionHeader title="What your kids will do" className="!mb-4" />
            <ul className="list-disc pl-6 space-y-2 text-lg text-black/80">
              <li>Hear Bible-based teaching that connects to their everyday lives</li>
              <li>Make friends in a safe, fun space</li>
              <li>Build their own relationship with Jesus through worship and prayer</li>
              <li>Discover their gifts and how God can use them right now</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="cream">
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <SectionHeader title="Special events" className="!mb-4" />
            <p className="text-lg leading-relaxed text-black/80">Throughout the year we host seasonal celebrations and family events. Check the events page for what is coming up.</p>
            <p className="mt-3"><Todo id="kids-events">[UPCOMING EVENTS]</Todo></p>
            <div className="mt-5"><Btn to="/events" variant="ghost">See upcoming events</Btn></div>
          </div>
          <div>
            <SectionHeader title="Contact" className="!mb-4" />
            <p className="text-lg"><Todo id="kids-leader">[KIDS MINISTRY LEADER NAME, EMAIL]</Todo></p>
            <p className="mt-3 text-lg"><Todo id="kids-prereg">[CONNECT PRE-REGISTRATION TO A CHECK-IN SYSTEM OR FORM]</Todo></p>
            <div className="mt-5"><Btn to="/connect" variant="ghost">Pre-register your child</Btn></div>
          </div>
        </div>
      </Section>

      <EndCta title="Questions about your child?" text="Send us a message and we will help you get ready for Sunday." to="/contact" label="Send a message" />
    </>
  );
}
