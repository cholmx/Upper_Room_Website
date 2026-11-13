import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import useFetch from '../hooks/useFetch';
import { useSermonPodcastLists } from '../hooks/useSermonPodcast';
import { findEpisode, parseEpisodeTitle } from '../lib/podcastMatch';
import { formatDate, isLive, newestFirst, safeUrl } from '../utils';
import { plainText } from '../lib/markdown';
import { Section, PageHeader } from '../components/ui';

const PAGE = 20;

function Episode({ e }) {
  const page = safeUrl(e.page_url);
  const desc = plainText(e.description || '');
  return (
    <li className="py-5 border-b border-[#1e2522]/10 last:border-0">
      <p className="text-sm text-black">{[e.published_at && formatDate(e.published_at), e.speaker, e.series].filter(Boolean).join('  |  ')}</p>
      <h3 className="text-lg md:text-xl mt-1 !font-display">{e.title}</h3>
      {desc && <p className="mt-1 text-[1rem] leading-relaxed text-black line-clamp-2 font-normal">{desc}</p>}
      <audio controls preload="none" src={safeUrl(e.audio_url)} className="w-full mt-3" aria-label={`Play ${e.title}`} />
      {page && <p className="mt-1"><a href={page} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 font-semibold text-sm">Open the episode<span className="sr-only"> (opens in a new tab)</span></a></p>}
    </li>
  );
}

// A year of episodes. Nothing is drawn until the year is opened, so the page stays light.
function Year({ year, items, open, onToggle }) {
  const [shown, setShown] = useState(PAGE);
  const id = `year-${year}`;
  return (
    <section className="border border-[#1e2522]/15 rounded-[10px] bg-white overflow-hidden">
      <h2 className="!text-lg">
        <button type="button" aria-expanded={open} aria-controls={id} onClick={onToggle} className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 min-h-[56px]">
          <span className="font-display font-bold text-xl">{year}</span>
          <span className="flex items-center gap-4 text-sm font-normal text-black">{items.length} {items.length === 1 ? 'message' : 'messages'}<span aria-hidden="true" className={`text-2xl leading-none transition-transform ${open ? 'rotate-45' : ''}`}>+</span></span>
        </button>
      </h2>
      {open && (
        <div id={id} className="px-5 pb-5">
          <ul>{items.slice(0, shown).map(e => <Episode key={e.id} e={e} />)}</ul>
          {items.length > shown && <button type="button" onClick={() => setShown(n => n + PAGE)} className="btn btn-outline mt-4">Show {Math.min(PAGE, items.length - shown)} more</button>}
        </div>
      )}
    </section>
  );
}

// Older messages that only exist as audio on the podcast. Messages that have a video keep their audio on the video's page.
export default function AudioArchive() {
  usePageMeta('Audio Archive | Upper Room Fellowship', 'Older messages from the Upper Room Fellowship podcast that are audio only, grouped by year.');
  const lists = useSermonPodcastLists();
  const sermons = useFetch('read/sermons?sort=date:desc');
  const [q, setQ] = useState('');
  const [openYears, setOpenYears] = useState({});

  const messages = useMemo(() => newestFirst(sermons.data).filter(isLive), [sermons.data]);
  const archive = useMemo(() => {
    if (!lists) return [];
    const used = new Set();
    for (const m of messages) { const e = findEpisode(m, lists.feed); if (e) used.add(e.id); }
    return lists.feed
      .filter(e => !used.has(e.id) && safeUrl(e.audio_url))
      .map(e => ({ ...e, ...parseEpisodeTitle(e.title) }))
      .sort((a, b) => String(b.published_at || '').localeCompare(String(a.published_at || '')));
  }, [lists, messages]);

  const words = q.trim().toLowerCase();
  const found = words ? archive.filter(e => `${e.title} ${e.speaker} ${e.series}`.toLowerCase().includes(words)) : [];
  const years = useMemo(() => {
    const by = new Map();
    for (const e of archive) { const y = e.published_at ? String(e.published_at).slice(0, 4) : 'Earlier'; if (!by.has(y)) by.set(y, []); by.get(y).push(e); }
    return [...by.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [archive]);
  const loading = !lists || sermons.loading;

  return (
    <>
      <PageHeader kicker="Messages" title="Audio archive" intro="Older messages that only exist as audio. Messages with a video have their audio on the video's page." />
      <Section tone="white">
        <Link to="/messages" className="inline-flex items-center min-h-[44px] font-display font-bold text-sm underline underline-offset-4">&larr; All messages</Link>
        {loading ? (
          <p role="status" className="mt-6 text-black">Loading the archive.</p>
        ) : archive.length === 0 ? (
          <p className="mt-6 text-black max-w-xl">There are no audio-only messages to show right now.</p>
        ) : (
          <div className="mt-6 max-w-3xl">
            <form role="search" onSubmit={(e) => e.preventDefault()} className="mb-6 max-w-md">
              <label htmlFor="archive-q" className="block text-sm font-semibold mb-1">Search {archive.length} messages</label>
              <input id="archive-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="A title, a speaker, or a series" className="neu-field w-full min-h-[48px] px-4 py-3 rounded-xl border border-[#1e2522]/25 focus:outline-none focus:ring-2 focus:ring-[#1e2522] text-base" />
            </form>
            {words ? (
              <div>
                <p className="mb-3 text-sm text-black" aria-live="polite">{found.length} of {archive.length} messages</p>
                {found.length === 0 ? <p className="text-black">Nothing matches that search. Try a different word.</p> : <ul>{found.slice(0, 40).map(e => <Episode key={e.id} e={e} />)}</ul>}
                {found.length > 40 && <p className="mt-3 text-sm text-black">Showing the first 40. Add a word to narrow it down.</p>}
              </div>
            ) : (
              <div className="space-y-3">
                {years.map(([year, items]) => (
                  <Year key={year} year={year} items={items} open={!!openYears[year]} onToggle={() => setOpenYears(o => ({ ...o, [year]: !o[year] }))} />
                ))}
              </div>
            )}
          </div>
        )}
      </Section>
    </>
  );
}
