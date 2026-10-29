import React from 'react';
import { Link, useParams } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import useFetch from '../hooks/useFetch';
import useJsonLd from '../hooks/useJsonLd';
import { useSite } from '../settings';
import { formatDate, isLive, messagePath, parseMessageId, safeUrl, seriesPath, ytEmbed, ytId, ytThumb } from '../utils';
import { plainText } from '../lib/markdown';
import RichText from '../components/RichText';
import LiteYouTube from '../components/LiteYouTube';
import MessageCard from '../components/MessageCard';
import { Btn, Section, EndCta } from '../components/ui';
import { Spinner, ErrorState, NotFound } from '../components/StateViews';

export default function MessageDetail() {
  const { slug } = useParams();
  const id = parseMessageId(slug);
  const SITE = useSite();
  const { data, loading, error, reload } = useFetch(id ? `read/sermons?id=${encodeURIComponent(id)}` : null);
  const found = data?.find(s => String(s.id) === id);
  const m = found && isLive(found) ? found : null;
  const related = useFetch(m?.series ? `read/sermons?series=${encodeURIComponent(m.series)}&sort=date:desc` : null);
  const more = (related.data ?? []).filter(isLive).filter(x => x.id !== m?.id).slice(0, 3);

  const video = m?.video_url || m?.yt;
  const vid = ytId(video);
  const summary = plainText(m?.description).slice(0, 155);
  usePageMeta(m ? `${m.title} | Messages` : 'Message', summary || 'A message from Upper Room Fellowship in Columbiana, Ohio.');
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

  return (
    <>
      <article>
        <header className="bg-[#F2F1ED]">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10 md:py-14">
            <Link to="/messages" className="inline-flex items-center min-h-[44px] font-semibold text-[#8A6309] underline underline-offset-4">All messages</Link>
            <h1 className="text-3xl md:text-5xl mt-2">{m.title}</h1>
            <dl className="mt-5 grid sm:grid-cols-2 gap-x-8 gap-y-2 text-[#2b2f2d]">
              {m.speaker && <div><dt className="inline font-semibold">Speaker: </dt><dd className="inline">{m.speaker}</dd></div>}
              {m.date && <div><dt className="inline font-semibold">Date: </dt><dd className="inline">{formatDate(m.date)}</dd></div>}
              {m.series && <div><dt className="inline font-semibold">Series: </dt><dd className="inline"><Link to={seriesPath(m.series)} className="underline underline-offset-4">{m.series}</Link></dd></div>}
              {m.scripture && <div><dt className="inline font-semibold">Scripture: </dt><dd className="inline">{m.scripture}</dd></div>}
            </dl>
          </div>
        </header>

        <Section tone="cream" narrow>
          {vid && (
            <div className="aspect-video rounded-2xl overflow-hidden bg-[#0B1613] mb-8">
              <LiteYouTube id={vid} title={m.title} />
            </div>
          )}
          {audio && (
            <div className="mb-8">
              <h2 className="text-xl mb-2">Listen</h2>
              <audio controls preload="none" src={audio} className="w-full" aria-label={`Audio of ${m.title}`}>
                <a href={audio}>Download the audio</a>
              </audio>
            </div>
          )}
          {m.description && (
            <div className="mb-8">
              <h2 className="text-2xl mb-3">Summary</h2>
              <RichText value={m.description} className="text-lg" />
            </div>
          )}
          {notesUrl && <p className="mb-8"><Btn href={notesUrl} variant="ghost">Download the notes</Btn></p>}
          {m.notes && (
            <div className="bg-white rounded-2xl border border-black/10 p-6 md:p-8">
              <h2 className="text-2xl mb-4">Notes and transcript</h2>
              <RichText value={m.notes} />
            </div>
          )}
        </Section>

        {more.length > 0 && (
          <Section tone="sand">
            <h2 className="text-2xl md:text-3xl mb-6">More from this series</h2>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {more.map(x => <li key={x.id}><MessageCard message={x} /></li>)}
            </ul>
            <p className="mt-6"><Link to={seriesPath(m.series)} className="font-semibold underline underline-offset-4 text-[#8A6309]">See the whole series</Link></p>
          </Section>
        )}
      </article>
      <EndCta title="Hear it in person" text="We meet every Sunday, and there is a seat for you." to="/plan-your-visit" label="Plan Your Visit" />
    </>
  );
}
