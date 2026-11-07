import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import useFetch from '../hooks/useFetch';
import { dateRangeLabel, formatDate, groupSeries, isLive, messagePath, newestFirst, slugify, ytId } from '../utils';
import { plainText } from '../lib/markdown';
import { Btn, Section, SectionHeader, PageHeader } from '../components/ui';
import LiteYouTube from '../components/LiteYouTube';
import MessageCard from '../components/MessageCard';
import { Spinner, ErrorState, NotFound } from '../components/StateViews';

export default function MessageSeries() {
  const { series: slug } = useParams();
  const { data, loading, error, reload } = useFetch('read/sermons?sort=date:desc');
  const all = useMemo(() => newestFirst(data).filter(isLive), [data]);
  const items = useMemo(() => all.filter(m => m.series && slugify(m.series) === slug), [all, slug]);
  const info = groupSeries(items)[0];
  usePageMeta(info ? `${info.name} message series` : 'Message series', info ? `Messages from the ${info.name} series at Upper Room Fellowship in Columbiana, Ohio.` : 'Message series from Upper Room Fellowship.');

  if (loading) return <Section><Spinner /></Section>;
  if (error) return <Section><ErrorState message={error} onRetry={reload} /></Section>;
  if (!info) return <NotFound what="series" />;

  const [latest, ...rest] = items;
  const video = ytId(latest.video_url || latest.yt);
  const range = dateRangeLabel(info.first, info.last);

  return (
    <>
      <PageHeader
        kicker="Message series"
        title={info.name}
        image={info.image}
        intro={`${info.count} ${info.count === 1 ? 'message' : 'messages'}${range ? `, ${range}` : ''}.`}
      >
        <Link to="/messages" className="underline underline-offset-4 font-semibold min-h-[44px] inline-flex items-center">All messages</Link>
      </PageHeader>

      <Section tone="white">
        <SectionHeader title="Latest in this series" />
        <div className="grid md:grid-cols-5 gap-8 md:gap-12 items-center">
          <div className="md:col-span-3 aspect-video rounded-[10px] overflow-hidden bg-[#1e2522]">
            {video ? <LiteYouTube id={video} title={latest.title} /> : <div className="w-full h-full flex items-center justify-center text-white/80">Video coming soon</div>}
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-[#1e2522]/70">{[latest.date && formatDate(latest.date), latest.speaker].filter(Boolean).join('  |  ')}</p>
            <h2 className="text-2xl md:text-3xl mt-1"><Link to={messagePath(latest)}>{latest.title}</Link></h2>
            {latest.scripture && <p className="mt-2 font-semibold text-sm">{latest.scripture}</p>}
            {latest.description && <p className="mt-3 text-[0.95rem] leading-relaxed text-[#1e2522]/80 line-clamp-4">{plainText(latest.description)}</p>}
            <div className="mt-6"><Btn to={messagePath(latest)} variant="primary">Watch and read</Btn></div>
          </div>
        </div>
      </Section>

      {rest.length > 0 && (
        <Section tone="gray">
          <SectionHeader title={`More from ${info.name}`} />
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map(m => <li key={m.id}><MessageCard message={m} as="h3" /></li>)}
          </ul>
        </Section>
      )}
    </>
  );
}
