import React, { useEffect, useMemo, useState } from 'react';
import usePageMeta from '../hooks/usePageMeta';
import useFetch from '../hooks/useFetch';
import useJsonLd from '../hooks/useJsonLd';
import { useSite } from '../settings';
import { Btn, Section, PageHeader } from '../components/ui';
import { CardSkeletons, ErrorState } from '../components/StateViews';
import { upcoming, timeRange, frequencyLabel, groupOf, plain, blurb, eventJsonLd } from '../lib/events';
import { safeUrl } from '../utils';

const MONTH = (d) => d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

function Card({ ev, date }) {
  const time = timeRange(ev);
  const freq = frequencyLabel(ev);
  const link = safeUrl(ev.link);
  const more = ev.summary && ev.details && ev.details !== ev.summary ? ev.details : '';
  return (
    <li className="bg-white rounded-[10px] elev-1 p-5 md:p-6 flex gap-5">
      <div className="shrink-0 w-16 md:w-20 self-start text-center bg-[#F4ECDD] rounded-[6px] py-2" aria-hidden="true">
        <div className="font-display font-bold text-sm uppercase tracking-wide text-[#1C2A2B]">{date.toLocaleDateString('en-US', { month: 'short' })}</div>
        <div className="font-display font-bold text-4xl md:text-5xl leading-none">{date.getDate()}</div>
        <div className="mt-1 text-xs text-black">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-xl md:text-2xl leading-[1.05] md:leading-[1.05]">{plain(ev.title)}</h3>
        <p className="mt-1 text-sm text-black">
          {[date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }), time, ev.location].filter(Boolean).join('  |  ')}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {freq && <span className="text-xs font-display font-bold px-3 py-1 rounded-full bg-[#F4ECDD]">{freq}</span>}
          {ev.ministry && <span className="text-xs font-display font-bold px-3 py-1 rounded-full bg-[#F4ECDD]">{ev.ministry}</span>}
        </div>
        {(ev.summary || ev.details) && <p className="mt-3 text-[1rem] leading-snug text-black">{blurb(ev)}</p>}
        {more && (
          <details className="mt-3">
            <summary className="cursor-pointer text-sm font-semibold underline underline-offset-4">More details</summary>
            <p className="mt-2 text-[1rem] leading-snug text-black">{plain(more)}</p>
          </details>
        )}
        {link && <div className="mt-4"><Btn href={link} variant="green">{ev.needs_signup ? 'Sign up' : 'Learn more'}</Btn></div>}
      </div>
    </li>
  );
}

export default function Events() {
  usePageMeta('events');
  const SITE = useSite();
  const { data, loading, error, reload } = useFetch('read/urf_events_church?sort=event_date:asc');
  const [group, setGroup] = useState('');
  const list = useMemo(() => upcoming(data), [data]);
  const groups = useMemo(() => [...new Set(list.map(x => groupOf(x.ev)))].sort((a, b) => (a === 'Whole church' ? -1 : b === 'Whole church' ? 1 : a.localeCompare(b))), [list]);
  const shown = list.filter(x => !group || groupOf(x.ev) === group);
  const byMonth = useMemo(() => {
    const out = [];
    shown.forEach(x => { const k = MONTH(x.date); const last = out[out.length - 1]; if (last && last.k === k) last.items.push(x); else out.push({ k, items: [x] }); });
    return out;
  }, [shown]);

  useEffect(() => { if (group && !groups.includes(group)) setGroup(''); }, [groups, group]);

  useJsonLd(list.length ? list.slice(0, 20).map(({ ev, date }) => eventJsonLd(ev, date, SITE)) : null);

  return (
    <>
      <PageHeader kicker="What is coming up" title="Events" intro="Gatherings, classes and ways to get connected at Upper Room Fellowship." />
      <Section tone="white">
        {error ? <ErrorState message={error} onRetry={reload} /> : loading && !data ? <CardSkeletons count={3} /> : (
          <>
            {groups.length > 1 && (
              <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Show events for">
                {['', ...groups].map(g => (
                  <button key={g || 'all'} type="button" aria-pressed={group === g} onClick={() => setGroup(g)} className={`px-4 py-2 rounded-full text-sm font-display font-bold ${group === g ? 'bg-[#1C2A2B] text-white' : 'bg-[#F4ECDD] text-[#1C2A2B] hover:bg-[#1C2A2B]/15'}`}>{g || 'All events'}</button>
                ))}
              </div>
            )}
            {byMonth.length === 0 ? (
              <p className="text-black max-w-xl">There are no upcoming events listed right now. Check back soon, or ask us what is happening at <a className="underline underline-offset-4 font-semibold" href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
            ) : byMonth.map(m => (
              <section key={m.k} className="mb-12" aria-labelledby={`m-${m.k.replace(/\W+/g, '-')}`}>
                <h2 id={`m-${m.k.replace(/\W+/g, '-')}`} className="text-2xl md:text-4xl mb-5">{m.k}</h2>
                <ul className="space-y-4 max-w-3xl">{m.items.map(({ ev, date }) => <Card key={ev.id} ev={ev} date={date} />)}</ul>
              </section>
            ))}
          </>
        )}
      </Section>
    </>
  );
}
