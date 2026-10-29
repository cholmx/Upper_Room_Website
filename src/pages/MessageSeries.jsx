import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import useFetch from '../hooks/useFetch';
import { dateRangeLabel, groupSeries, isLive, slugify } from '../utils';
import { Section, PageHeader, EndCta } from '../components/ui';
import MessageCard from '../components/MessageCard';
import { Spinner, ErrorState, NotFound } from '../components/StateViews';

export default function MessageSeries() {
  const { series: slug } = useParams();
  const { data, loading, error, reload } = useFetch('read/sermons?sort=date:desc');
  const all = useMemo(() => (data ?? []).filter(isLive), [data]);
  const items = useMemo(() => all.filter(m => m.series && slugify(m.series) === slug), [all, slug]);
  const info = groupSeries(items)[0];
  usePageMeta(info ? `${info.name} message series` : 'Message series', info ? `Messages from the ${info.name} series at Upper Room Fellowship in Columbiana, Ohio.` : 'Message series from Upper Room Fellowship.');

  if (loading) return <Section><Spinner /></Section>;
  if (error) return <Section><ErrorState message={error} onRetry={reload} /></Section>;
  if (!info) return <NotFound what="series" />;

  return (
    <>
      <PageHeader kicker="Message series" title={info.name} intro={`${info.count} ${info.count === 1 ? 'message' : 'messages'}${dateRangeLabel(info.first, info.last) ? `, ${dateRangeLabel(info.first, info.last)}` : ''}.`}>
        <Link to="/messages" className="underline underline-offset-4 font-semibold text-[#8A6309] min-h-[44px] inline-flex items-center">All messages</Link>
      </PageHeader>
      <Section tone="cream">
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(m => <li key={m.id}><MessageCard message={m} as="h2" /></li>)}
        </ul>
      </Section>
      <EndCta title="Join us this Sunday" text="We would love to meet you in person." to="/plan-your-visit" label="Plan Your Visit" />
    </>
  );
}
