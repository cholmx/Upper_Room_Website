import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import useFetch from '../hooks/useFetch';
import { downloadIcs, expandEvents, formatDate, isLive, safeUrl } from '../utils';
import { plainText } from '../lib/markdown';
import { MINISTRY_FILTERS, RECURRING_EVENTS } from '../content/events';
import { Btn, Section, PageHeader, EndCta, Todo, AdminOnly, PhotoBox } from '../components/ui';
import { Spinner } from '../components/StateViews';

const todayIso = () => new Date().toISOString().slice(0, 10);
const pad = (n) => String(n).padStart(2, '0');

function detailPath(e) {
  if (e.to) return e.to;
  return `/events/${e.id}?date=${e.occurrence_date}`;
}

function EventCard({ e, featured = false }) {
  const d = new Date(e.occurrence_date + 'T00:00:00');
  const text = plainText(e.description || e.desc_text);
  const reg = safeUrl(e.registration_url);
  return (
    <article className={`bg-white rounded-2xl border border-black/10 overflow-hidden ${featured ? 'md:grid md:grid-cols-2' : 'flex flex-col md:flex-row'}`}>
      {safeUrl(e.image_url) && <PhotoBox src={e.image_url} alt="" label={e.title} ratio={featured ? 'aspect-[16/10]' : 'aspect-[16/10] md:aspect-auto md:w-56'} rounded={false} />}
      <div className="p-6 flex gap-5 flex-grow">
        <div className="text-center flex-shrink-0 w-16" aria-hidden="true">
          <div className="text-sm font-bold uppercase tracking-wider text-[#8A6309]">{d.toLocaleDateString('en-US', { month: 'short' })}</div>
          <div className="text-3xl font-bold leading-none">{d.getDate()}</div>
        </div>
        <div className="min-w-0 flex-grow">
          {e.ministry && <p className="kicker text-[#8A6309] !mb-1">{e.ministry}</p>}
          <h2 className="text-xl md:text-2xl"><Link to={detailPath(e)} className="hover:text-[#8A6309]">{e.title}</Link></h2>
          <p className="mt-1 text-black/80"><span className="sr-only">Date: </span>{formatDate(e.occurrence_date)}{e.time ? `, ${e.time}` : ''}{e.location ? `, ${e.location}` : ''}</p>
          {text && <p className="mt-3 text-black/80 leading-relaxed line-clamp-3">{text}</p>}
          <div className="mt-4 flex flex-wrap gap-3 items-center">
            {reg && <Btn href={reg} variant="primary">Sign up</Btn>}
            <button type="button" onClick={() => downloadIcs(e)} className="inline-flex items-center min-h-[44px] font-semibold underline underline-offset-4 text-[#8A6309]">Add to Calendar</button>
          </div>
        </div>
      </div>
    </article>
  );
}

function MonthView({ events, cursor, setCursor }) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const byDay = {};
  for (const e of events) {
    const [y, m, d] = e.occurrence_date.split('-').map(Number);
    if (y === year && m === month + 1) (byDay[d] ||= []).push(e);
  }
  const cells = [...Array(first.getDay()).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const label = first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const move = (delta) => setCursor(new Date(year, month + delta, 1));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={() => move(-1)} className="btn btn-outline">Previous<span className="sr-only"> month</span></button>
        <h2 className="text-xl md:text-2xl" aria-live="polite">{label}</h2>
        <button type="button" onClick={() => move(1)} className="btn btn-outline">Next<span className="sr-only"> month</span></button>
      </div>

      {/* Phones: a plain agenda for the month */}
      <ul className="md:hidden space-y-3">
        {Object.keys(byDay).length === 0 && <li className="text-lg">Nothing scheduled this month.</li>}
        {Object.keys(byDay).map(Number).sort((a, b) => a - b).map(day => (
          <li key={day} className="bg-white rounded-xl border border-black/10 p-4">
            <p className="font-semibold">{new Date(year, month, day).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <ul className="mt-1">{byDay[day].map(e => <li key={e.id + e.occurrence_date}><Link to={detailPath(e)} className="underline underline-offset-4 text-[#8A6309]">{e.title}</Link>{e.time ? `, ${e.time}` : ''}</li>)}</ul>
          </li>
        ))}
      </ul>

      <table className="hidden md:table w-full table-fixed border-collapse bg-white rounded-xl overflow-hidden border border-black/10">
        <caption className="sr-only">{label}</caption>
        <thead>
          <tr>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <th key={d} scope="col" className="p-2 text-sm font-bold text-black/80 border-b border-black/10">{d}</th>)}</tr>
        </thead>
        <tbody>
          {Array.from({ length: cells.length / 7 }, (_, r) => (
            <tr key={r}>
              {cells.slice(r * 7, r * 7 + 7).map((day, i) => (
                <td key={i} className="align-top h-28 p-2 border border-black/10">
                  {day && (
                    <>
                      <span className="text-sm font-semibold">{day}</span>
                      <ul className="mt-1 space-y-1">
                        {(byDay[day] || []).map(e => (
                          <li key={e.id + e.occurrence_date}><Link to={detailPath(e)} className="block text-xs leading-snug underline underline-offset-2 text-[#8A6309]">{e.title}</Link></li>
                        ))}
                      </ul>
                    </>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Events() {
  usePageMeta('events');
  const { data, loading } = useFetch('read/events_church?sort=date:asc');
  const [view, setView] = useState('list');
  const [showAll, setShowAll] = useState(false);
  const [ministry, setMinistry] = useState('');
  const [cursor, setCursor] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1); });

  const all = useMemo(() => [...(data ?? []).filter(isLive), ...RECURRING_EVENTS].filter(e => !ministry || e.ministry === ministry), [data, ministry]);
  const upcoming = useMemo(() => expandEvents(all, todayIso(), 120), [all]);
  const monthEvents = useMemo(() => {
    const start = `${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}-01`;
    const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    return expandEvents(all, start, days - 1);
  }, [all, cursor]);

  const featured = useMemo(() => {
    const dbOnly = upcoming.filter(e => typeof e.id === 'number' || /^\d+$/.test(String(e.id)));
    return dbOnly.find(e => e.featured === 1 || e.featured === true) || null;
  }, [upcoming]);
  const rest = upcoming.filter(e => e !== featured);

  return (
    <>
      <PageHeader kicker="Events" title="What is happening" intro="This is what is coming up at the church." />
      <Section tone="cream">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div role="group" aria-label="Calendar view" className="inline-flex rounded-full border border-black/30 overflow-hidden">
            {['list', 'month'].map(v => (
              <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)} className={`min-h-[48px] px-6 font-semibold ${view === v ? 'bg-[#0B1613] text-white' : 'bg-white text-[#080c0b] hover:bg-white'}`}>
                {v === 'list' ? 'List' : 'Month'}
              </button>
            ))}
          </div>
          <div>
            <label htmlFor="ev-ministry" className="block text-sm font-semibold mb-1">Show events for</label>
            <select id="ev-ministry" value={ministry} onChange={(e) => setMinistry(e.target.value)} className="min-h-[48px] px-3 bg-white rounded-xl border border-black/25 focus:outline-none focus:ring-2 focus:ring-[#8A6309]">
              <option value="">Everything</option>
              {MINISTRY_FILTERS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {loading ? <Spinner /> : view === 'month' ? (
          <MonthView events={monthEvents} cursor={cursor} setCursor={setCursor} />
        ) : (
          <>
            {featured && (
              <div className="mb-8">
                <p className="kicker text-[#8A6309]">Featured</p>
                <EventCard e={featured} featured />
              </div>
            )}
            {rest.length === 0 ? <p className="text-lg">Nothing else is on the calendar yet. Check back soon or follow us on Facebook and Instagram.</p> : (
              <ul className="space-y-5">
                {rest.slice(0, showAll ? rest.length : 6).map(e => <li key={`${e.id}-${e.occurrence_date}`}><EventCard e={e} /></li>)}
              </ul>
            )}
          </>
        )}
        {view !== 'month' && rest.length > 6 && !showAll && (
          <div className="mt-8"><button type="button" className="btn btn-outline" onClick={() => setShowAll(true)}>Show all {rest.length} events</button></div>
        )}
        <AdminOnly><p className="mt-8"><Todo id="events-other">[ADD OTHER EVENTS]</Todo></p></AdminOnly>
      </Section>
      <EndCta title="Come to Sunday" text="Our weekly gathering is the easiest place to start." to="/plan-your-visit" label="Plan Your Visit" />
    </>
  );
}
