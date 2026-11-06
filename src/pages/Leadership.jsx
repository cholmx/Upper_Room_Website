import React, { useMemo } from 'react';
import usePageMeta from '../hooks/usePageMeta';
import useFetch from '../hooks/useFetch';
import { isLive } from '../utils';
import { DEFAULT_LEADERS, HOW_WE_LEAD, LEADERS_AIM, LEADERSHIP_INTRO, LEADERSHIP_CLOSING } from '../content/leaders';
import { Section, SectionHeader, PageHeader, PhotoBox, SlotImage } from '../components/ui';
import RichText from '../components/RichText';

function Person({ p }) {
  const first = p.name.split(' ')[0];
  return (
    <li className="rounded-2xl overflow-hidden flex flex-col neu">
      <PhotoBox src={p.photo_url} alt={`Portrait of ${p.name}, ${p.role}`} label={`${p.name} headshot`} ratio="aspect-[4/5]" rounded={false} />
      <div className="p-6 flex flex-col flex-grow">
        <h2 className="text-2xl">{p.name}</h2>
        {p.role && <p className="mt-1 font-semibold text-[#1e2522]">{p.role}</p>}
        {p.bio && (p.markdown ? <RichText value={p.bio} className="mt-3" /> : <p className="mt-3 text-[#1e2522]/80 leading-relaxed">{p.bio}</p>)}
        {p.email && (
          <p className="mt-auto pt-4">
            <a href={`mailto:${p.email}`} className="inline-flex items-center min-h-[44px] font-semibold underline underline-offset-4 text-[#1e2522]">Email {first}</a>
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
      <PageHeader kicker="Leadership" title="Meet our leaders" intro={LEADERSHIP_INTRO} />
      <Section tone="white">
        <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {people.map(p => <Person key={p.id || p.name} p={p} />)}
        </ul>
      </Section>

      <Section tone="white">
        <SectionHeader title="How we lead" />
        <SlotImage slot="leadership-how" ratio="aspect-[21/9]" className="mb-10" />
        <dl className="grid md:grid-cols-2 gap-6">
          {HOW_WE_LEAD.map(i => (
            <div key={i.title} className="fcard !p-6">
              <dt className="text-xl font-semibold">{i.title}</dt>
              <dd className="mt-2 text-[#1e2522]/80 leading-relaxed">{i.text}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-10 max-w-3xl space-y-4 text-[0.95rem] text-[#1e2522]/80 leading-relaxed">
          <p>{LEADERS_AIM}</p>
          <p>{LEADERSHIP_CLOSING}</p>
        </div>
      </Section>
    </>
  );
}
