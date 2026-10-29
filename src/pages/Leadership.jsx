import React, { useMemo } from 'react';
import usePageMeta from '../hooks/usePageMeta';
import useFetch from '../hooks/useFetch';
import { isLive } from '../utils';
import { DEFAULT_LEADERS, HOW_WE_LEAD, LEADERS_AIM } from '../content/leaders';
import { Section, SectionHeader, PageHeader, PhotoBox, Todo, EndCta } from '../components/ui';
import RichText from '../components/RichText';

function Person({ p }) {
  const first = p.name.split(' ')[0];
  return (
    <li className="bg-white rounded-2xl border border-black/10 overflow-hidden flex flex-col">
      <PhotoBox src={p.photo_url} alt={`Portrait of ${p.name}, ${p.role}`} label={`${p.name} headshot`} ratio="aspect-[4/5]" rounded={false} />
      <div className="p-6 flex flex-col flex-grow">
        <h2 className="text-2xl">{p.name}</h2>
        {p.role && <p className="mt-1 font-semibold text-[#8A6309]">{p.role}</p>}
        {p.bio && (p.markdown ? <RichText value={p.bio} className="mt-3" /> : <p className="mt-3 text-black/80 leading-relaxed">{p.bio}</p>)}
        {!p.markdown && !p.hasBio && <p className="mt-2 text-sm"><Todo id="leader-bios">[BIO: 2 to 3 sentences]</Todo></p>}
        {p.confirm && <p className="mt-2 text-sm"><Todo id="leader-bios">[CONFIRM THIS BIO]</Todo></p>}
        {p.email && (
          <p className="mt-auto pt-4">
            <a href={`mailto:${p.email}`} className="inline-flex items-center min-h-[44px] font-semibold underline underline-offset-4 text-[#8A6309]">Email {first}</a>
          </p>
        )}
      </div>
    </li>
  );
}

export default function Leadership() {
  usePageMeta('leadership');
  const { data } = useFetch('read/staff_church?sort=sort_order_num');
  const fromAdmin = useMemo(() => (data ?? []).filter(isLive).map(p => ({ ...p, markdown: true, hasBio: Boolean(p.bio) })), [data]);
  const people = fromAdmin.length > 0 ? fromAdmin : DEFAULT_LEADERS;

  return (
    <>
      <PageHeader
        kicker="Leadership"
        title="Meet our leaders"
        intro="A team of elders and pastors shares the work of teaching, spiritual oversight, and caring for people here. We believe leadership works best when it is shared and passed along, so we are always looking for the next leader."
      />
      <Section tone="cream">
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {people.map(p => <Person key={p.id || p.name} p={p} />)}
          {fromAdmin.length === 0 && (
            <li className="rounded-2xl border-2 border-dashed border-[#8A6309]/60 bg-white p-6 flex items-center justify-center text-center">
              <Todo id="fifth-leader">[FIFTH PERSON: NAME AND TITLE, PHOTO SUPPLIED]</Todo>
            </li>
          )}
        </ul>
      </Section>

      <Section tone="sand">
        <SectionHeader kicker="Elders" title="Our elders" />
        <p className="text-lg"><Todo id="elders">[LIST ELDER NAMES AND PHOTOS]</Todo></p>
      </Section>

      <Section tone="cream">
        <SectionHeader kicker="How we lead" title="How we lead" />
        <dl className="grid md:grid-cols-2 gap-6">
          {HOW_WE_LEAD.map(i => (
            <div key={i.title} className="bg-white rounded-2xl border border-black/10 p-6">
              <dt className="text-xl font-bold">{i.title}</dt>
              <dd className="mt-2 text-black/80 leading-relaxed">{i.text}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-10 max-w-3xl">
          <h3 className="text-2xl mb-3">Our leaders aim to</h3>
          <ul className="list-disc pl-6 space-y-1 text-lg text-black/80">
            {LEADERS_AIM.map(a => <li key={a}>{a}</li>)}
          </ul>
          <p className="mt-6 text-lg text-black/80 leading-relaxed">We are grateful for the men and women who serve this church family with humility and a lot of love for Jesus. Their faithful leadership makes our vision possible.</p>
        </div>
      </Section>

      <EndCta title="Have a question for a pastor?" text="Send a message and someone will reply within 48 hours." to="/contact" label="Send a message" />
    </>
  );
}
