import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import useFetch from '../hooks/useFetch';
import { Btn, Section, SectionHeader, PageHeader, Photo, Gloss, Todo } from '../components/ui';
import FormBlock from '../components/FormBlock';

const sel = 'w-full min-h-[48px] px-3 py-2 bg-white rounded-xl border border-black/25 focus:outline-none focus:ring-2 focus:ring-[#8A6309]';

function F({ label, value, onChange, options }) {
  const id = `tg-${label.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold mb-1">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={sel}>
        <option value="">Any</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function TableGroups() {
  usePageMeta('tableGroups');
  const { data, error } = useFetch('read/table_groups_church?sort=name');
  const groups = useMemo(() => (data ?? []).filter(g => g.published !== 0), [data]);
  const [day, setDay] = useState('');
  const [time, setTime] = useState('');
  const [area, setArea] = useState('');
  const [stage, setStage] = useState('');
  const [status, setStatus] = useState('');
  const [picked, setPicked] = useState('');
  const formRef = useRef(null);

  const uniq = (k) => [...new Set(groups.map(g => g[k]).filter(Boolean))];
  const shown = groups.filter(g => (!day || g.day === day) && (!time || g.time_of_day === time) && (!area || g.area === area) && (!stage || g.life_stage === stage) && (!status || (g.status || 'open') === status));
  const join = (g) => { setPicked(g.name); setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0); };

  return (
    <>
      <PageHeader
        kicker="Table Groups"
        title="Table Groups"
        intro={<>Life goes better with people who know you. <Gloss k="tableGroups" /> in homes around the community.</>}
        photo="table-group"
      />

      <Section tone="cream">
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <SectionHeader title="Why a small group" className="!mb-4" />
            <p className="text-lg leading-relaxed text-[#2b2f2d]">In a church our size, smaller circles are where people really get known. A Table Group gives you a place to build friendships, apply what you hear on Sunday to ordinary life, and get support when things get hard.</p>
          </div>
          <div>
            <SectionHeader title="What to expect" className="!mb-4" />
            <ul className="list-disc pl-6 space-y-2 text-lg text-[#2b2f2d]">
              <li>Groups for every age and stage of life</li>
              <li>Meetings on different days and at different times</li>
              <li>Most groups run in seasons of 8 to 12 weeks, so you can try one without a long commitment</li>
              <li>Meetings that are usually biweekly or monthly</li>
              <li>Time to connect, a Bible study or topic discussion, prayer, and now and then a project serving the community</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="sand" id="groups">
        <SectionHeader kicker="Group finder" title="Find a group" />
        {groups.length === 0 ? (
          <div className="bg-white rounded-2xl border border-black/10 p-6">
            <p className="text-lg text-[#2b2f2d]">{error ? 'We could not load the group list just now.' : 'Our current groups are being added.'} Tell us what works for you using the form below and we will help you find a fit.</p>
            <p className="mt-3"><Todo id="current-groups">[ADD CURRENT GROUPS]</Todo></p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-black/10 p-5 mb-6 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <F label="Day" value={day} onChange={setDay} options={uniq('day')} />
              <F label="Time of day" value={time} onChange={setTime} options={uniq('time_of_day')} />
              <F label="Area" value={area} onChange={setArea} options={uniq('area')} />
              <F label="Life stage" value={stage} onChange={setStage} options={uniq('life_stage')} />
              <F label="Open or full" value={status} onChange={setStatus} options={['open', 'full']} />
            </div>
            <p className="sr-only" aria-live="polite">{shown.length} groups shown</p>
            {shown.length === 0 ? <p className="text-lg">No groups match yet. Try different choices, or use the form below.</p> : (
              <ul className="grid md:grid-cols-2 gap-6">
                {shown.map(g => (
                  <li key={g.id} className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col">
                    <h3 className="text-xl">{g.name}</h3>
                    <p className="mt-1 text-sm font-semibold text-[#8A6309]">{[g.day, g.time_of_day, g.area, g.life_stage].filter(Boolean).join('  |  ')}</p>
                    {g.description && <p className="mt-3 text-[#2b2f2d]">{g.description}</p>}
                    <div className="mt-auto pt-4 flex items-center gap-4">
                      <span className={`text-sm font-bold ${(g.status || 'open') === 'full' ? 'text-red-800' : 'text-green-900'}`}>{(g.status || 'open') === 'full' ? 'Full' : 'Open'}</span>
                      <Btn onClick={() => join(g)} variant="ghost" aria-label={`${(g.status || 'open') === 'full' ? 'Ask about a spot in' : 'Join'} ${g.name}`}>{(g.status || 'open') === 'full' ? 'Ask about a spot' : 'Join'}</Btn>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Section>

      <Section tone="cream" id="help">
        <div ref={formRef} className="grid md:grid-cols-5 gap-10 items-start scroll-mt-24">
          <div className="md:col-span-2">
            <SectionHeader title="Help me find a group" className="!mb-4" />
            <p className="text-lg leading-relaxed text-[#2b2f2d]">Tell us what days work for you and what stage of life you are in, and we will help you find a fit.</p>
            <p className="mt-6 text-lg text-[#2b2f2d]">Interested in hosting or leading a group? <Link className="underline underline-offset-4 font-semibold text-[#8A6309]" to="/contact">Send us a message</Link>.</p>
            <p className="mt-3"><Todo id="groups-contact">[NAME OF THE PERSON WHO LEADS TABLE GROUPS]</Todo></p>
          </div>
          <div className="md:col-span-3"><FormBlock key={picked} formKey="tablegroup" defaults={{ group: picked }} /></div>
        </div>
      </Section>

      <Section tone="ink" narrow>
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl">Not ready to join a group yet?</h2>
          <p className="mt-4 text-lg md:text-xl text-white/90">Come to a Sunday first. We would love to meet you.</p>
          <div className="mt-8"><Btn to="/plan-your-visit" variant="primary">Plan Your Visit</Btn></div>
        </div>
      </Section>
    </>
  );
}
