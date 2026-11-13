import React, { useMemo, useState } from 'react';
import { useSermonPodcastLists } from '../hooks/useSermonPodcast';
import { findEpisode, parseEpisodeTitle } from '../lib/podcastMatch';
import { formatDate, safeUrl } from '../utils';
import { plainText } from '../lib/markdown';
import { Section, SectionHeader } from './ui';

// Older messages that only exist as audio on the podcast, with no video message page. Each one plays right here.
export default function AudioArchive({ messages }) {
  const lists = useSermonPodcastLists();
  const [q, setQ] = useState('');
  const [shown, setShown] = useState(15);

  const archive = useMemo(() => {
    if (!lists || !lists.feed.length) return [];
    const used = new Set();
    for (const m of messages) { const e = findEpisode(m, lists.feed); if (e) used.add(e.id); }
    return lists.feed
      .filter(e => !used.has(e.id) && safeUrl(e.audio_url))
      .map(e => ({ ...e, ...parseEpisodeTitle(e.title) }))
      .sort((a, b) => String(b.published_at || '').localeCompare(String(a.published_at || '')));
  }, [lists, messages]);

  const words = q.trim().toLowerCase();
  const list = words ? archive.filter(e => `${e.title} ${e.speaker} ${e.series}`.toLowerCase().includes(words)) : archive;
  if (archive.length === 0) return null;

  return (
    <Section tone="white" id="audio-archive">
      <SectionHeader title="Audio archive" intro={`Older messages from our podcast, ${archive.length} in all. These are audio only. Press play, or open the episode to listen in your podcast app.`} className="!mb-6" />
      <form role="search" onSubmit={(e) => e.preventDefault()} className="mb-6 max-w-md">
        <label htmlFor="archive-q" className="block text-sm font-semibold mb-1">Search the audio archive</label>
        <input id="archive-q" type="search" value={q} onChange={(e) => { setQ(e.target.value); setShown(15); }} placeholder="A title, a speaker, or a series" className="neu-field w-full min-h-[48px] px-4 py-3 rounded-xl border border-[#1e2522]/25 focus:outline-none focus:ring-2 focus:ring-[#1e2522] text-base" />
      </form>
      <p className="mb-4 text-sm text-black" aria-live="polite">{words ? `${list.length} of ${archive.length} episodes` : `${archive.length} episodes`}</p>
      {list.length === 0 ? (
        <p className="text-black">Nothing matches that search. Try a different word.</p>
      ) : (
        <ul className="space-y-5 max-w-3xl">
          {list.slice(0, shown).map(e => {
            const page = safeUrl(e.page_url);
            const desc = plainText(e.description || '');
            return (
              <li key={e.id} className="fcard !p-5 md:!p-6">
                <p className="text-sm text-black">{[e.published_at && formatDate(e.published_at), e.speaker, e.series].filter(Boolean).join('  |  ')}</p>
                <h3 className="text-xl mt-1">{e.title}</h3>
                {desc && <p className="mt-2 text-[1rem] leading-relaxed text-black line-clamp-3">{desc}</p>}
                <audio controls preload="none" src={safeUrl(e.audio_url)} className="w-full mt-4" aria-label={`Play ${e.title}`} />
                {page && <p className="mt-2"><a href={page} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 font-semibold text-sm">Open the episode<span className="sr-only"> (opens in a new tab)</span></a></p>}
              </li>
            );
          })}
        </ul>
      )}
      {list.length > shown && (
        <div className="mt-8"><button type="button" onClick={() => setShown(n => n + 15)} className="btn btn-outline">Show 15 more</button></div>
      )}
    </Section>
  );
}
