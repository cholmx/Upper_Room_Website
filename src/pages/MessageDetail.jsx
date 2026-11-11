import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import useFetch from '../hooks/useFetch';
import useJsonLd from '../hooks/useJsonLd';
import { useSite } from '../settings';
import { formatDate, isLive, messagePath, newestFirst, parseMessageId, safeUrl, seriesPath, slugify, ytEmbed, ytId, ytThumb } from '../utils';
import { plainText } from '../lib/markdown';
import RichText from '../components/RichText';
import { parseCategories } from '../lib/categories';
import LiteYouTube from '../components/LiteYouTube';
import MessageCard from '../components/MessageCard';
import { Btn, Section } from '../components/ui';
import ShareButtons from '../components/ShareButtons';
import { Spinner, ErrorState, NotFound } from '../components/StateViews';

export default function MessageDetail() {
  const { slug } = useParams();
  const id = parseMessageId(slug);
  const SITE = useSite();
  const { data, loading, error, reload } = useFetch(id ? `read/sermons?id=${encodeURIComponent(id)}` : null);
  const found = data?.find(s => String(s.id) === id);
  const m = found && isLive(found) ? found : null;
  const related = useFetch(m?.series ? `read/sermons?series=${encodeURIComponent(m.series)}&sort=date:desc` : null);
  const more = newestFirst(related.data).filter(isLive).filter(x => x.id !== m?.id).slice(0, 3);

  // The messages in order, so each one can point to the one before and after it.
  const everything = useFetch('read/sermons?sort=date:desc');
  const live = newestFirst(everything.data).filter(isLive);
  const sameSeries = m?.series ? live.filter(x => (x.series || '').trim() === m.series.trim()) : [];
  const myCats = m ? parseCategories(m.topic) : [];
  const similar = m && myCats.length
    ? live.filter(x => x.id !== m.id && (x.series || '').trim() !== (m.series || '').trim())
        .map(x => ({ x, n: parseCategories(x.topic).filter(c => myCats.includes(c)).length }))
        .filter(r => r.n > 0)
        .sort((a, b) => b.n - a.n)
        .slice(0, 3)
        .map(r => r.x)
    : [];
  const order = sameSeries.length > 1 ? sameSeries : live;
  const at = order.findIndex(x => x.id === m?.id);
  const newer = at > 0 ? order[at - 1] : null;
  const older = at >= 0 && at < order.length - 1 ? order[at + 1] : null;

  // Remember where a visitor is in a series, so the series page can offer the next message.
  useEffect(() => {
    if (!m?.series) return;
    try { localStorage.setItem(`urf-series-${slugify(m.series)}`, String(m.id)); } catch { /* storage is off */ }
  }, [m?.id, m?.series]);

  const [tab, setTab] = useState('');
  const tabs = [
    m?.description && { id: 'summary', label: 'Summary', value: m.description },
    m?.discussion_questions && { id: 'questions', label: 'Discussion questions', value: m.discussion_questions },
    m?.notes && { id: 'transcript', label: 'Notes and transcript', value: m.notes },
  ].filter(Boolean);
  const activeTab = tabs.some(t => t.id === tab) ? tab : tabs[0]?.id;
  const onTabKey = (e, id) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const i = tabs.findIndex(t => t.id === id);
    const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    setTab(next.id);
    requestAnimationFrame(() => document.getElementById(`tab-${next.id}`)?.focus());
  };

  const video = m?.video_url || m?.yt;
  const vid = ytId(video);
  const summary = plainText(m?.description).slice(0, 155);
  const about = m ? `${m.title}, a message${m.speaker ? ` by ${m.speaker}` : ''}${m.series ? ` in the ${m.series} series` : ''} at Upper Room Fellowship.${summary ? ` ${summary}` : ''}`.slice(0, 300) : '';
  usePageMeta(m ? m.title : 'Message', about || 'A message from Upper Room Fellowship in Columbiana, Ohio.', { image: vid ? ytThumb(vid) : undefined, type: 'video.other' });
  useJsonLd(m && vid ? {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: m.title,
    description: plainText(m.description) || m.title,
    uploadDate: String(m.date || m.created_at || '').slice(0, 10) || undefined,
    thumbnailUrl: ytThumb(vid),
    embedUrl: ytEmbed(video),
    publisher: { '@type': 'Organization', name: SITE.name },
  } : null);

  if (loading) return <Section><Spinner /></Section>;
  if (error) return <Section><ErrorState message={error} onRetry={reload} /></Section>;
  if (!m) return <NotFound what="message" />;

  const audio = safeUrl(m.audio_url);
  const notesUrl = safeUrl(m.notes_url);

  const cats = parseCategories(m.topic);

  return (
    <article>
      <Section tone="white" className="!pt-8 md:!pt-12">
        <Link to="/messages" className="inline-flex items-center min-h-[44px] font-display font-bold text-sm underline underline-offset-4">&larr; All messages</Link>
        <h1 className="text-3xl md:text-5xl mt-2 max-w-4xl">{m.title}</h1>
        <p className="mt-4 text-[1rem] text-black">{[m.speaker, m.date && formatDate(m.date), m.scripture].filter(Boolean).join('  |  ')}</p>
        {(m.series || cats.length > 0) && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Series and categories">
            {m.series && <li><Link to={seriesPath(m.series)} className="inline-block text-xs font-display font-bold px-3 py-1.5 rounded-full bg-[#1e2522] text-white">Series: {m.series}</Link></li>}
            {cats.map(c => <li key={c} className="text-xs font-display font-bold px-3 py-1.5 rounded-full bg-[#EDE9DC]">{c}</li>)}
          </ul>
        )}

        <div className="mt-10 grid lg:grid-cols-3 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-2">
            {vid && (
              <div className="aspect-video rounded-[10px] overflow-hidden bg-[#1e2522]">
                <LiteYouTube id={vid} title={m.title} />
              </div>
            )}
            {audio && (
              <div className="mt-8">
                <h2 className="text-xl mb-2">Listen</h2>
                <audio controls preload="none" src={audio} className="w-full" aria-label={`Audio of ${m.title}`}>
                  <a href={audio}>Download the audio</a>
                </audio>
              </div>
            )}
            {tabs.length > 0 && (
              <div className="mt-10">
                <div role="tablist" aria-label="About this message" className="flex flex-wrap gap-2 mb-6">
                  {tabs.map(t => (
                    <button key={t.id} id={`tab-${t.id}`} type="button" role="tab" aria-selected={activeTab === t.id} aria-controls={`panel-${t.id}`} tabIndex={activeTab === t.id ? 0 : -1} onClick={() => setTab(t.id)} onKeyDown={(e) => onTabKey(e, t.id)} className={`min-h-[44px] px-5 rounded-full font-display font-bold text-sm ${activeTab === t.id ? 'bg-[#1e2522] text-white' : 'bg-[#EDE9DC] text-[#1e2522] hover:bg-[#1e2522]/15'}`}>{t.label}</button>
                  ))}
                </div>
                {tabs.map(t => (
                  <div key={t.id} id={`panel-${t.id}`} role="tabpanel" aria-labelledby={`tab-${t.id}`} hidden={activeTab !== t.id}>
                    <RichText value={t.value} className="text-[1rem]" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-6" aria-label="More about this message">
            <div>
              <h2 className="text-xl mb-3">Share this message</h2>
              <ShareButtons title={m.title} />
            </div>
            {(notesUrl || audio) && (
              <div className="flex flex-wrap gap-3">
                {notesUrl && <Btn href={notesUrl} variant="primary">Download the notes</Btn>}
                {audio && <Btn href={audio} variant="dark">Download the audio</Btn>}
              </div>
            )}
          </aside>
        </div>
      </Section>

      {(newer || older) && (
        <Section tone="white" className="!py-10 md:!py-12">
          <nav aria-label="More messages" className="grid sm:grid-cols-2 gap-4">
            {older ? (
              <Link to={messagePath(older)} className="fcard !p-6 block">
                <span className="text-sm text-black">&larr; Older message{sameSeries.length > 1 ? ' in this series' : ''}</span>
                <span className="block text-xl mt-1">{older.title}</span>
              </Link>
            ) : <span />}
            {newer ? (
              <Link to={messagePath(newer)} className="fcard !p-6 block sm:text-right">
                <span className="text-sm text-black">Newer message{sameSeries.length > 1 ? ' in this series' : ''} &rarr;</span>
                <span className="block text-xl mt-1">{newer.title}</span>
              </Link>
            ) : <span />}
          </nav>
        </Section>
      )}

      {more.length > 0 && (
        <Section tone="gray">
          <h2 className="text-3xl md:text-5xl mb-8">More from {m.series}</h2>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {more.map(x => <li key={x.id}><MessageCard message={x} /></li>)}
          </ul>
          <div className="mt-8"><Btn to={seriesPath(m.series)} variant="primary">See the whole series</Btn></div>
        </Section>
      )}
      {similar.length > 0 && (
        <Section tone="white">
          <h2 className="text-3xl md:text-5xl mb-8">More on {myCats.slice(0, 2).join(' and ')}</h2>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similar.map(x => <li key={x.id}><MessageCard message={x} /></li>)}
          </ul>
        </Section>
      )}
    </article>
  );
}
