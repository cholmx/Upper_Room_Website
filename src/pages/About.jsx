import React, { useMemo } from 'react';
import useFetch from '../hooks/useFetch';
import { isLive } from '../utils';
import RichText from '../components/RichText';
import ScrollStory, { Stage } from '../components/immersive/ScrollStory';
import usePageMeta from '../hooks/usePageMeta';
import { Btn, Section, SectionHeader, PageHeader, PhotoBox, Split, Todo, AdminOnly, EndCta } from '../components/ui';
import { SITE } from '../config';

function Stories() {
  const { data } = useFetch('read/stories_church?sort=created_at:desc');
  const stories = useMemo(() => (data ?? []).filter(isLive), [data]);
  return (
    <>
      {stories.length > 0 && (
        <Section tone="sand" id="stories">
          <SectionHeader kicker="Stories" title="Stories from our church family" intro="These are real stories from people who call this place home. Each one is shared with permission." />
          <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map(s => (
              <li key={s.id} className="bg-white rounded-2xl border border-black/10 overflow-hidden flex flex-col">
                <PhotoBox src={s.photo_url} alt={s.name ? `Photo of ${s.name}` : ''} label={`${s.name || 'story'} photo`} ratio="aspect-[4/3]" rounded={false} />
                <div className="p-6 flex flex-col flex-grow">
                  <blockquote className="text-xl leading-snug">“{s.quote}”</blockquote>
                  {s.name && <p className="mt-3 font-semibold text-[#8A6309]">{s.name}</p>}
                  {s.body && (
                    <details className="mt-4 u-acc">
                      <summary className="cursor-pointer list-none min-h-[44px] flex items-center font-semibold underline underline-offset-4 text-[#8A6309]">Read more</summary>
                      <RichText value={s.body} className="mt-3" />
                    </details>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-8"><Btn to="/contact#story" variant="ghost">Share your story</Btn></p>
        </Section>
      )}
      {stories.length === 0 && <AdminOnly><Section tone="sand"><Todo id="stories">[ADD 3 TO 5 SHORT STORIES WITH WRITTEN PERMISSION. They appear here once published in the admin.]</Todo></Section></AdminOnly>}
    </>
  );
}

export default function About() {
  usePageMeta('about');
  return (
    <>
      <PageHeader
        kicker="Our story"
        title="Our story"
        intro="A church family in Columbiana since 1971."
      />

      <Section tone="cream">
        <ScrollStory
          heading="h2"
          label="Our story"
          beats={[
            { kicker: '1971', title: 'An upper room', visual: <Stage big="1971" small="Above a vet’s office" />, body: <p>The Upper Room Fellowship started in 1971 when a group of believers met in an upper room above a veterinarian’s office in Columbiana, Ohio. They had no building fund and no master plan. They chose the room because it reminded them of the upper room where Jesus’ first followers gathered to pray and wait for the Holy Spirit. They were hungry for God’s presence, and they wanted a community where people could meet Him and make real friends.</p> },
            { kicker: 'Since then', title: 'More than fifty years', visual: <Stage big="50+" small="Years in Columbiana" />, body: <p>That small gathering has grown into a church family that has called Columbiana home for more than fifty years. We have outgrown our space several times, and each time God has provided what we needed. Our commitment has stayed the same since the beginning. We want to be a church that changes lives through the power of the Holy Spirit.</p> },
            { kicker: 'Today', title: 'Where we are headed', visual: <Stage big="Today" small={SITE.address.street} />, body: <p>Today we help people find the purpose God made them for and enjoy the freedom and fullness Jesus promised. We believe God is calling us to even greater impact in Columbiana and beyond.</p> },
          ]}
        />
        <AdminOnly><p className="mt-10 text-lg"><Todo id="milestones">[ADD KEY MILESTONES AND DATES FOR EACH BUILDING EXPANSION]</Todo></p></AdminOnly>
      </Section>

      <Section tone="cream">
        <Split photo="about-columbiana">
          <div>
            <SectionHeader kicker="What we believe" title="What we believe, in brief" intro="Our full statement is on the beliefs page. The short version follows." className="!mb-6" />
            <ul className="space-y-3 text-lg text-black/80 list-disc pl-6">
              <li>There is one God in three persons: Father, Son, and Holy Spirit.</li>
              <li>Jesus is the Son of God. He died for our sins and rose again.</li>
              <li>The Bible is our final authority for faith and life.</li>
              <li>Salvation is a free gift of grace, received by faith in Jesus.</li>
              <li>The Holy Spirit is active today, giving gifts and power for everyday life.</li>
              <li>Everyone is welcome to belong before they believe.</li>
            </ul>
            <div className="mt-7"><Btn to="/beliefs" variant="ghost">Read our full statement of beliefs</Btn></div>
          </div>
        </Split>
      </Section>

      <Section tone="ink">
        <div className="max-w-3xl">
          <p className="kicker text-[#D49E46]">Our vision</p>
          <h2 className="text-3xl md:text-4xl">Our vision</h2>
          <p className="mt-4 text-lg md:text-xl text-white/90 leading-relaxed">
            We exist to help people know God deeply, share life authentically, and serve others selflessly. Real change happens from the inside out as our hearts line up with God’s heart. Along the way we pursue healthy relationships, abundant wholeness, our God-given greatness, a supernatural lifestyle, God’s presence, and a life that lives out the Gospel.
          </p>
          <blockquote className="mt-6 border-l-4 border-[#D49E46] pl-5 text-xl font-serif italic">
            “By this everyone will know that you are my disciples, if you love one another.”
            <footer className="mt-2 text-base font-sans text-white/80">John 13:35</footer>
          </blockquote>
        </div>
      </Section>

      <Stories />

      <Section tone="cream">
        <SectionHeader kicker="Leadership" title="Meet our leaders" intro="A team of elders and pastors shares the work of teaching, spiritual oversight, and caring for people here." />
        <Btn to="/leadership" variant="ghost">Meet our leaders</Btn>
      </Section>

      <EndCta title="We would love to meet you" text="The best way to know us is to join us on a Sunday." to="/plan-your-visit" label="Plan Your Visit" />
    </>
  );
}
