import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import useFetch from '../hooks/useFetch';
import { useSite } from '../settings';
import { dateRangeLabel, formatDate, groupSeries, isLive, messagePath, scriptureBook, seriesPath, ytId } from '../utils';
import { plainText } from '../lib/markdown';
import { Btn, Section, SectionHeader, PageHeader, EndCta } from '../components/ui';
import LiteYouTube from '../components/LiteYouTube';
import MessageCard from '../components/MessageCard';
import { Spinner, ErrorState } from '../components/StateViews';

const select = 'w-full min-h-[48px] px-3 py-2 bg-white rounded-xl border border-black/25 focus:outline-none focus:ring-2 focus:ring-[#8A6309]';

function Filter({ label, value, onChange, options }) {
  const id = `f-${label.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold mb-1">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={select}>
        <option value="">All</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function Messages() {
  usePageMeta('messages');
  const SITE = useSite();
  const { data, loading, error, reload } = useFetch('read/sermons?sort=date:desc');
  const messages = useMemo(() => (data ?? []).filter(isLive), [data]);
  const [q, setQ] = useState('');
  const [series, setSeries] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [book, setBook] = useState('');
  const [topic, setTopic] = useState('');

  const latest = messages[0];
  const seriesList = useMemo(() => groupSeries(messages), [messages]);
  const uniq = (fn) => [...new Set(messages.map(fn).filter(Boolean))].sort();
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return messages.filter(m => (
      (!series || m.series === series) &&
      (!speaker || m.speaker === speaker) &&
      (!book || scriptureBook(m.scripture) === book) &&
      (!topic || m.topic === topic) &&
      (!needle || [m.title, m.speaker, m.scripture, m.topic, m.series, plainText(m.description)].some(v => String(v || '').toLowerCase().includes(needle)))
    ));
  }, [messages, q, series, speaker, book, topic]);
  const anyFilter = q || series || speaker || book || topic;
  const clear = () => { setQ(''); setSeries(''); setSpeaker(''); setBook(''); setTopic(''); };
  const latestVideo = ytId(latest?.video_url || latest?.yt);

  return (
    <>
      <PageHeader
        kicker="Messages"
        title="Messages"
        intro="Missed a Sunday? Want to hear what we teach before you visit? You can watch, listen, or read right here. Our messages are practical, rooted in the Bible, and aimed at real life."
      />

      {error ? (
        <Section tone="cream"><ErrorState message={error} onRetry={reload} /></Section>
      ) : loading ? (
        <Section tone="cream"><Spinner /></Section>
      ) : (
        <>
          <Section tone="cream">
            <SectionHeader kicker="Latest" title="Latest message" />
            {latest ? (
              <div className="grid md:grid-cols-5 gap-8 items-center">
                <div className="md:col-span-3 aspect-video rounded-2xl overflow-hidden bg-[#0B1613]">
                  {latestVideo ? <LiteYouTube id={latestVideo} title={latest.title} /> : <div className="w-full h-full flex items-center justify-center text-white/80">Video coming soon</div>}
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-2xl md:text-3xl"><Link to={messagePath(latest)} className="hover:text-[#8A6309]">{latest.title}</Link></h3>
                  <p className="mt-2 text-[#2b2f2d]">{[latest.speaker, latest.date && formatDate(latest.date), latest.scripture].filter(Boolean).join('  |  ')}</p>
                  {latest.description && <p className="mt-3 text-[#2b2f2d] leading-relaxed line-clamp-4">{plainText(latest.description)}</p>}
                  <div className="mt-6"><Btn to={messagePath(latest)} variant="primary">Watch, listen, and read</Btn></div>
                </div>
              </div>
            ) : (
              <p className="text-lg text-[#2b2f2d]">New messages are on the way. Check back after Sunday.</p>
            )}
          </Section>

          {seriesList.length > 0 && (
            <Section tone="sand">
              <SectionHeader kicker="Series" title="Message series" />
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {seriesList.map(s => (
                  <li key={s.name}>
                    <Link to={seriesPath(s.name)} className="block bg-white rounded-2xl border border-black/10 overflow-hidden hover:shadow-lg h-full">
                      <div className="aspect-[16/9] bg-[#0B1613] flex items-center justify-center">
                        {s.image ? <img src={s.image} alt="" loading="lazy" className="w-full h-full object-cover" /> : <span className="font-display text-2xl text-[#FFC44F] px-4 text-center">{s.name}</span>}
                      </div>
                      <div className="p-5">
                        <h3 className="text-xl">{s.name}</h3>
                        <p className="mt-1 text-sm text-[#2b2f2d]">{dateRangeLabel(s.first, s.last)}{dateRangeLabel(s.first, s.last) ? '  |  ' : ''}{s.count} {s.count === 1 ? 'message' : 'messages'}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section tone="cream" id="archive">
            <SectionHeader kicker="Archive" title="All messages" />
            <form role="search" aria-label="Search messages" onSubmit={(e) => e.preventDefault()} className="bg-white rounded-2xl border border-black/10 p-5 mb-8">
              <label htmlFor="msg-search" className="block text-sm font-semibold mb-1">Search by topic, passage, or speaker</label>
              <input id="msg-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} className={select} />
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <Filter label="Series" value={series} onChange={setSeries} options={uniq(m => m.series)} />
                <Filter label="Speaker" value={speaker} onChange={setSpeaker} options={uniq(m => m.speaker)} />
                <Filter label="Scripture book" value={book} onChange={setBook} options={uniq(m => scriptureBook(m.scripture))} />
                <Filter label="Topic" value={topic} onChange={setTopic} options={uniq(m => m.topic)} />
              </div>
              {anyFilter && <button type="button" onClick={clear} className="mt-4 underline underline-offset-4 font-semibold text-[#8A6309] min-h-[44px]">Clear search and filters</button>}
            </form>
            <p className="sr-only" aria-live="polite">{filtered.length} messages shown</p>
            {filtered.length === 0 ? (
              <p className="text-lg text-[#2b2f2d]">No messages match yet. Try a different word.</p>
            ) : (
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(m => <li key={m.id}><MessageCard message={m} /></li>)}
              </ul>
            )}
          </Section>
        </>
      )}

      <Section tone="sand">
        <SectionHeader kicker="Podcast" title="Take us with you" intro="Subscribe on Apple Podcasts or Spotify and new messages show up on their own. They work well for commutes, workouts, and folding laundry." />
        <div className="flex flex-wrap gap-3">
          <Btn href={SITE.podcasts.apple} variant="dark">Apple Podcasts</Btn>
          <Btn href={SITE.podcasts.spotify} variant="dark">Spotify</Btn>
          <Btn href={SITE.youtubeChannel} variant="ghost">YouTube channel</Btn>
        </div>
      </Section>

      <EndCta title="Hear it in person" text="Messages are better with a coffee and a friendly face. Come this Sunday." to="/plan-your-visit" label="Plan Your Visit" />
    </>
  );
}
