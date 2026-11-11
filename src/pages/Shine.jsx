import React, { useMemo, useState } from 'react';
import usePageMeta from '../hooks/usePageMeta';
import useFetch from '../hooks/useFetch';
import { Btn, Section, SectionHeader, PageHeader } from '../components/ui';
import { CardSkeletons, ErrorState } from '../components/StateViews';
import { safeUrl, formatDate } from '../utils';

const PAGE = 12;

// "1830" seconds or "30:30" both read as 30:30.
function length(d) {
  const t = String(d || '').trim();
  if (!t) return '';
  if (/^\d+$/.test(t)) {
    const s = Number(t);
    const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60);
    return h ? `${h} hr ${m} min` : `${m} min`;
  }
  const p = t.split(':').map(Number);
  if (p.some(Number.isNaN)) return '';
  return p.length === 3 ? `${p[0]} hr ${p[1]} min` : `${p[0]} min`;
}

function Episode({ ep, cover, featured = false }) {
  const art = safeUrl(ep.image_url) || safeUrl(cover);
  const audio = safeUrl(ep.audio_url);
  const page = safeUrl(ep.page_url);
  const meta = [ep.published_at && formatDate(ep.published_at), length(ep.duration)].filter(Boolean).join('  |  ');
  return (
    <article className="fcard !p-5 md:!p-6">
      <div className="flex gap-4 md:gap-5 items-start">
        {art && <img src={art} alt="" loading={featured ? 'eager' : 'lazy'} decoding="async" width="600" height="600" className={`${featured ? 'w-24 md:w-40' : 'w-20 md:w-24'} shrink-0 aspect-square object-cover rounded-[10px] bg-[#EDE9DC]`} />}
        <div className="min-w-0 flex-1">
          <p className="text-sm text-black">{meta}</p>
          {featured ? <h2 className="text-2xl md:text-3xl mt-1">{ep.title}</h2> : <h3 className="text-lg md:text-xl mt-1">{ep.title}</h3>}
          {ep.description && <p className={`mt-2 text-[1rem] leading-relaxed text-black whitespace-pre-line ${featured ? '' : 'line-clamp-3'}`}>{ep.description}</p>}
        </div>
      </div>
      {audio && <audio controls preload="none" src={audio} className="w-full mt-4" aria-label={`Play ${ep.title}`} />}
      {page && <p className="mt-2"><a href={page} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 font-semibold text-sm">Episode page<span className="sr-only"> (opens in a new tab)</span></a></p>}
    </article>
  );
}

export default function Shine() {
  usePageMeta('shine');
  const shows = useFetch('read/podcast_shows_church');
  const [shown, setShown] = useState(PAGE);
  // Only the newest episodes are loaded at first; "Show more" asks for the next batch.
  const eps = useFetch(`read/podcast_episodes_church?sort=published_at:desc&limit=${shown + 2}`);
  const show = (shows.data || []).find(s => s.slug === 'shine');
  const episodes = useMemo(() => (eps.data || []).filter(e => e.show_slug === 'shine').sort((a, b) => String(b.published_at || '').localeCompare(String(a.published_at || ''))), [eps.data]);
  const [latest, ...rest] = episodes;
  const links = [['Apple Podcasts', show?.apple_url], ['Spotify', show?.spotify_url], ['YouTube', show?.youtube_url]].filter(([, u]) => safeUrl(u));

  return (
    <>
      <PageHeader
        kicker="Podcast"
        title="The Shine Podcast"
        intro={show?.description || 'Conversations with people in our church family, and episodes on topics that matter to life and faith.'}
      >
        {links.map(([label, u], i) => <Btn key={label} href={safeUrl(u)} variant={i === 0 ? 'primary' : 'light'}>{label}</Btn>)}
      </PageHeader>

      {eps.loading && !eps.data && <Section tone="white"><CardSkeletons count={3} /></Section>}
      {eps.error && <Section tone="white"><ErrorState message={eps.error} onRetry={eps.reload} /></Section>}

      {!eps.loading && !eps.error && !latest && (
        <Section tone="white" narrow>
          <SectionHeader title="Episodes are on the way" intro="New episodes of the Shine podcast will appear here. In the meantime, subscribe in your podcast app." />
        </Section>
      )}

      {latest && (
        <Section tone="white">
          <SectionHeader title="Latest episode" />
          <div className="max-w-3xl"><Episode ep={latest} cover={show?.image_url} featured /></div>
        </Section>
      )}

      {rest.length > 0 && (
        <Section tone="gray">
          <SectionHeader title="More episodes" />
          <ul className="grid md:grid-cols-2 gap-6">
            {rest.slice(0, shown).map(ep => <li key={ep.id}><Episode ep={ep} cover={show?.image_url} /></li>)}
          </ul>
          {rest.length > shown && <div className="mt-8"><button type="button" className="btn btn-outline" onClick={() => setShown(n => n + PAGE)}>Show more episodes</button></div>}
        </Section>
      )}
    </>
  );
}
