import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { Btn, Section, SectionHeader, PageHeader, Photo, Todo, EndCta } from '../components/ui';
import { SITE } from '../config';

export default function About() {
  usePageMeta('about');
  return (
    <>
      <PageHeader
        kicker="Our story"
        title="Our story"
        intro="A church family in Columbiana since 1971."
        photo="about-story"
      />

      <Section tone="cream" narrow>
        <div className="space-y-6 text-lg leading-relaxed text-[#2b2f2d]">
          <p>The Upper Room Fellowship started in 1971 when a group of believers met in an upper room above a veterinarian’s office in Columbiana, Ohio. They had no building fund and no master plan. They chose the room because it reminded them of the upper room where Jesus’ first followers gathered to pray and wait for the Holy Spirit. They were hungry for God’s presence, and they wanted a community where people could meet Him and make real friends.</p>
          <p>That small gathering has grown into a church family that has called Columbiana home for more than fifty years. We have outgrown our space several times, and each time God has provided what we needed. Our commitment has stayed the same since the beginning. We want to be a church that changes lives through the power of the Holy Spirit.</p>
          <p>Today we help people find the purpose God made them for and enjoy the freedom and fullness Jesus promised. We believe God is calling us to even greater impact in Columbiana and beyond.</p>
        </div>
      </Section>

      <Section tone="sand">
        <SectionHeader kicker="Timeline" title="How we got here" />
        <ol className="max-w-3xl space-y-8 border-l-2 border-[#8A6309]/50 pl-6">
          <li>
            <p className="text-2xl font-display font-semibold">1971</p>
            <p className="text-lg text-[#2b2f2d]">A small group meets above a veterinarian’s office in Columbiana.</p>
          </li>
          <li>
            <p className="text-2xl font-display font-semibold"><Todo id="milestones">[ADD KEY MILESTONES AND DATES FOR EACH BUILDING EXPANSION]</Todo></p>
          </li>
          <li>
            <p className="text-2xl font-display font-semibold">Today</p>
            <p className="text-lg text-[#2b2f2d]">A growing church family at {SITE.address.street}, planning for what comes next.</p>
          </li>
        </ol>
      </Section>

      <Section tone="cream">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <SectionHeader kicker="What we believe" title="What we believe, in brief" intro="Our full statement is on the beliefs page. The short version follows." className="!mb-6" />
            <ul className="space-y-3 text-lg text-[#2b2f2d] list-disc pl-6">
              <li>There is one God in three persons: Father, Son, and Holy Spirit.</li>
              <li>Jesus is the Son of God. He died for our sins and rose again.</li>
              <li>The Bible is our final authority for faith and life.</li>
              <li>Salvation is a free gift of grace, received by faith in Jesus.</li>
              <li>The Holy Spirit is active today, giving gifts and power for everyday life.</li>
              <li>Everyone is welcome to belong before they believe.</li>
            </ul>
            <div className="mt-7"><Btn to="/beliefs" variant="ghost">Read our full statement of beliefs</Btn></div>
          </div>
          <Photo slot="about-columbiana" />
        </div>
      </Section>

      <Section tone="ink">
        <div className="max-w-3xl">
          <p className="u-kicker text-[#FFC44F]">Our vision</p>
          <h2 className="text-3xl md:text-4xl">Our vision</h2>
          <p className="mt-4 text-lg md:text-xl text-white/90 leading-relaxed">
            We exist to help people know God deeply, share life authentically, and serve others selflessly. Real change happens from the inside out as our hearts line up with God’s heart. Along the way we pursue healthy relationships, abundant wholeness, our God-given greatness, a supernatural lifestyle, God’s presence, and a life that lives out the Gospel.
          </p>
          <blockquote className="mt-6 border-l-4 border-[#FFC44F] pl-5 text-xl font-display">
            “By this everyone will know that you are my disciples, if you love one another.”
            <footer className="mt-2 text-base font-sans text-white/80">John 13:35</footer>
          </blockquote>
        </div>
      </Section>

      <Section tone="cream">
        <SectionHeader kicker="Leadership" title="Meet our leaders" intro="A team of elders and pastors shares the work of teaching, spiritual oversight, and caring for people here." />
        <Btn to="/leadership" variant="ghost">Meet our leaders</Btn>
      </Section>

      <EndCta title="We would love to meet you" text="The best way to know us is to join us on a Sunday." to="/plan-your-visit" label="Plan Your Visit" />
    </>
  );
}
