import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import useFetch from '../hooks/useFetch';
import { useSite } from '../settings';
import { seriesTitleSize, dateRangeLabel, formatDate, groupSeries, isLive, messagePath, newestFirst, safeUrl, scriptureBook, seriesPath, ytId } from '../utils';
import { plainText } from '../lib/markdown';
import { parseCategories } from '../lib/categories';
import { Btn, Section, SectionHeader, PageHeader, PhotoBand } from '../components/ui';
import LiteYouTube from '../components/LiteYouTube';
import MessageCard from '../components/MessageCard';
import SeriesCover from '../components/SeriesCover';
import NewBadge from '../components/NewBadge';
import { CardSkeletons, ErrorState } from '../components/StateViews';

const select = 'w-full min-h-[48px] px-3 py-2 bg-white rounded-xl border border-[#1e2522]/25 focus:outline-none focus:ring-2 focus:ring-[#1e2522]';

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
  const messages = useMemo(() => newestFirst(data).filter(isLive), [data]);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  // Filters live in the address (?q=, ?topic=, ?speaker=, ?series=, ?book=) so a filtered list can be shared or bookmarked.
  const q = params.get('q') || '';
  const series = params.get('series') || '';
  const speaker = params.get('speaker') || '';
  const book = params.get('book') || '';
  const topic = params.get('topic') || '';
  const oldest = params.get('sort') === 'oldest';
  const setParam = (key, value) => setParams(prev => {
    const next = new URLSearchParams(prev);
    if (value) next.set(key, value); else next.delete(key);
    return next;
  }, { replace: true });
  const setQ = (v) => setParam('q', v);
  const setSeries = (v) => setParam('series', v);
  const setSpeaker = (v) => setParam('speaker', v);
  const setBook = (v) => setParam('book', v);
  const setTopic = (v) => setParam('topic', v);
  const [shown, setShown] = useState(12);
  const [allChips, setAllChips] = useState(false);

  const latest = messages[0];
  const seriesList = useMemo(() => groupSeries(messages).map(g => ({
    ...g,
    latest: messages.find(m => (m.series || '').trim() === g.name),
    // The newest message in the series that has a video lends its picture, which is blurred into the cover.
    thumb: ytId(messages.find(m => (m.series || '').trim() === g.name && ytId(m.video_url || m.yt))?.video_url || ''),
  })), [messages]);
  const details = (g) => [`${g.count} ${g.count === 1 ? 'message' : 'messages'}`, dateRangeLabel(g.first, g.last)].filter(Boolean).join('  |  ');
  const countBy = (list) => {
    const n = new Map();
    list.forEach(v => n.set(v, (n.get(v) || 0) + 1));
    return [...n.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  };
  const categoryCounts = useMemo(() => countBy(messages.flatMap(m => parseCategories(m.topic))), [messages]);
  const speakerCounts = useMemo(() => countBy(messages.map(m => (m.speaker || '').trim()).filter(Boolean)), [messages]);
  const uniq = (fn) => [...new Set(messages.map(fn).filter(Boolean))].sort();
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return messages.filter(m => (
      (!series || m.series === series) &&
      (!speaker || m.speaker === speaker) &&
      (!book || scriptureBook(m.scripture) === book) &&
      (!topic || parseCategories(m.topic).includes(topic)) &&
      (!needle || [m.title, m.speaker, m.scripture, m.topic, m.series, plainText(m.description)].some(v => String(v || '').toLowerCase().includes(needle)))
    ));
  }, [messages, q, series, speaker, book, topic]);
  const ordered = useMemo(() => (oldest ? [...filtered].reverse() : filtered), [filtered, oldest]);
  const anyFilter = q || series || speaker || book || topic;
  useEffect(() => { setShown(12); }, [q, series, speaker, book, topic, oldest]);
  const clear = () => setParams({}, { replace: true });
  const surprise = () => { if (filtered.length) navigate(messagePath(filtered[Math.floor(Math.random() * filtered.length)])); };
  const chip = (on) => `px-4 py-2 rounded-full text-sm font-display font-bold ${on ? 'bg-[#1e2522] text-white' : 'bg-[#e8e7e3] text-[#1e2522] hover:bg-[#1e2522]/15'}`;
  const active = [['Search', q, () => setQ('')], ['Series', series, () => setSeries('')], ['Speaker', speaker, () => setSpeaker('')], ['Book', book, () => setBook('')], ['Category', topic, () => setTopic('')]].filter(([, v]) => v);
  const latestVideo = ytId(latest?.video_url || latest?.yt);

  return (
    <>
      <PageHeader
        kicker="Messages"
        title="Messages"
        intro="Our teaching helps you line up your heart with God’s heart and step into the freedom and fullness He intends for you. Every message pairs solid Bible teaching with practical application, so you can live out our core values in everyday life."
      />

      {error ? (
        <Section tone="cream"><ErrorState message={error} onRetry={reload} /></Section>
      ) : loading ? (
        <Section tone="white"><CardSkeletons /></Section>
      ) : (
        <>
          <Section tone="cream">
            <SectionHeader title="Latest message" />
            {latest ? (
              <div className="grid md:grid-cols-5 gap-8 items-center">
                <div className="md:col-span-3 aspect-video rounded-[10px] overflow-hidden bg-[#1e2522]">
                  {latestVideo ? <LiteYouTube id={latestVideo} title={latest.title} /> : <div className="w-full h-full flex items-center justify-center text-white/80">Video coming soon</div>}
                </div>
                <div className="md:col-span-2">
                  <NewBadge date={latest.date} className="mb-2" />
                  {parseCategories(latest.topic).length > 0 && (
                    <ul className="mb-3 flex flex-wrap gap-2" aria-label="Categories">
                      {parseCategories(latest.topic).map(c => <li key={c} className="text-xs font-display font-bold px-3 py-1 rounded-full bg-[#e8e7e3]">{c}</li>)}
                    </ul>
                  )}
                  <h3 className="text-2xl md:text-3xl"><Link to={messagePath(latest)} className="hover:text-[#1e2522]">{latest.title}</Link></h3>
                  <p className="mt-2 text-black">{[latest.speaker, latest.date && formatDate(latest.date), latest.scripture].filter(Boolean).join('  |  ')}</p>
                  {latest.description && <p className="mt-3 text-black leading-relaxed line-clamp-4">{plainText(latest.description)}</p>}
                  <div className="mt-6 flex flex-wrap gap-3"><Btn to={messagePath(latest)} variant="primary">Watch</Btn><Btn href={safeUrl(latest.audio_url) || SITE.podcasts.apple} variant="dark">Listen</Btn></div>
                </div>
              </div>
            ) : (
              <p className="text-[0.95rem] text-black">New messages are on the way. Check back after Sunday.</p>
            )}
          </Section>

          {seriesList.length > 0 && (
            <Section tone="gray">
              <SectionHeader title="Message series" />
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                {seriesList.map(s => (
                  <li key={s.name}>
                    <Link to={seriesPath(s.name)} className="thumb-link flex flex-col h-full rounded-[10px] overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="aspect-video bg-[#1e2522] relative overflow-hidden">
                        {s.image ? (
                          <>
                            <img src={s.image} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                            <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#1e2522]/80 to-transparent" />
                            <span className="absolute inset-x-0 bottom-0 p-4 text-white">
                              <span className={`block leading-[0.95] ${seriesTitleSize(s.name)}`}>{s.name}</span>
                              <span className="block mt-1.5 text-xs font-display font-bold">{details(s)}</span>
                            </span>
                          </>
                        ) : (
                          <SeriesCover name={s.name} details={details(s)} thumb={s.thumb} />
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section tone="cream" id="archive">
            <SectionHeader title="Sermon library" intro="Missed a Sunday? Want to hear a message again? Browse current and past teaching from Upper Room Fellowship below." />
            {categoryCounts.length > 0 && (
              <div className="mb-6" role="group" aria-label="Browse by category">
                <p className="text-sm font-semibold mb-2">Category</p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" aria-pressed={!topic} onClick={() => setTopic('')} className={chip(!topic)}>All</button>
                  {(allChips ? categoryCounts : categoryCounts.slice(0, 10)).map(([c, n]) => (
                    <button key={c} type="button" aria-pressed={topic === c} onClick={() => setTopic(topic === c ? '' : c)} className={chip(topic === c)}>{c} <span className="font-normal opacity-70">{n}</span></button>
                  ))}
                  {categoryCounts.length > 10 && (
                    <button type="button" onClick={() => setAllChips(v => !v)} className="px-4 py-2 rounded-full text-sm font-display font-bold underline underline-offset-4">{allChips ? 'Show fewer' : `Show ${categoryCounts.length - 10} more`}</button>
                  )}
                </div>
              </div>
            )}
            {speakerCounts.length > 1 && (
              <div className="mb-6" role="group" aria-label="Browse by speaker">
                <p className="text-sm font-semibold mb-2">Speaker</p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" aria-pressed={!speaker} onClick={() => setSpeaker('')} className={chip(!speaker)}>Everyone</button>
                  {speakerCounts.slice(0, 8).map(([s, n]) => (
                    <button key={s} type="button" aria-pressed={speaker === s} onClick={() => setSpeaker(speaker === s ? '' : s)} className={chip(speaker === s)}>{s} <span className="font-normal opacity-70">{n}</span></button>
                  ))}
                </div>
              </div>
            )}
            <form role="search" aria-label="Search messages" onSubmit={(e) => e.preventDefault()} className="rounded-[10px] p-5 md:p-6 mb-6 bg-[#e8e7e3]">
              <label htmlFor="msg-search" className="block text-sm font-semibold mb-1">Search by title, passage, speaker or topic</label>
              <input id="msg-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} className={select} />
              <div className="grid sm:grid-cols-3 gap-4 mt-4">
                <Filter label="Series" value={series} onChange={setSeries} options={uniq(m => m.series)} />
                <Filter label="Scripture book" value={book} onChange={setBook} options={uniq(m => scriptureBook(m.scripture))} />
                <div>
                  <label htmlFor="msg-sort" className="block text-sm font-semibold mb-1">Order</label>
                  <select id="msg-sort" value={oldest ? 'oldest' : 'newest'} onChange={(e) => setParam('sort', e.target.value === 'oldest' ? 'oldest' : '')} className={select}>
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button type="button" onClick={surprise} disabled={!filtered.length} className="btn btn-outline !py-2 !px-4 text-sm disabled:opacity-40">Surprise me</button>
                {anyFilter && <button type="button" onClick={clear} className="underline underline-offset-4 font-semibold text-[#1e2522] min-h-[44px]">Clear search and filters</button>}
              </div>
            </form>
            {active.length > 0 && (
              <ul className="mb-4 flex flex-wrap gap-2" aria-label="Active filters">
                {active.map(([label, value, remove]) => (
                  <li key={label}><button type="button" onClick={remove} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1e2522] text-white text-sm font-display font-bold">{label}: {value}<span aria-hidden="true">&times;</span><span className="sr-only"> (remove)</span></button></li>
                ))}
              </ul>
            )}
            <p className="mb-6 text-sm text-black" aria-live="polite">{filtered.length === messages.length ? `${messages.length} messages` : `${filtered.length} of ${messages.length} messages`}</p>
            {filtered.length === 0 ? (
              <p className="text-[0.95rem] text-black">No messages match yet. Try a different word, or clear the filters.</p>
            ) : (
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {ordered.slice(0, shown).map(m => <li key={m.id}><MessageCard message={m} /></li>)}
              </ul>
            )}
            {ordered.length > shown && (
              <div className="mt-10 text-center">
                <button type="button" onClick={() => setShown(n => n + 12)} className="btn btn-outline">Show 12 more</button>
              </div>
            )}
          </Section>

          <PhotoBand slot="messages-podcast">
            <h2 className="text-3xl md:text-5xl mb-5">Listen anywhere</h2>
            <p className="text-base leading-relaxed mb-6">Subscribe to our podcast on Apple Podcasts, Spotify, or your favorite podcast app, and new messages arrive automatically. Take them along on a commute, a workout, or a quiet morning.</p>
            <div className="flex flex-wrap gap-3">
              <Btn href={SITE.podcasts.apple} variant="primary">Apple Podcasts</Btn>
              <Btn href={SITE.podcasts.spotify} variant="light">Spotify</Btn>
            </div>
          </PhotoBand>
        </>
      )}
    </>
  );
}
