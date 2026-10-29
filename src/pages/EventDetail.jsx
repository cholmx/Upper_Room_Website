import React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import usePageMeta from '../hooks/usePageMeta';
import useJsonLd from '../hooks/useJsonLd';
import { useSite } from '../settings';
import { formatDate, isLive, downloadIcs, safeUrl } from '../utils';
import { plainText } from '../lib/markdown';
import RichText from '../components/RichText';
import { Btn, Section, EndCta, PhotoBox } from '../components/ui';
import { Spinner, ErrorState, NotFound } from '../components/StateViews';

export default function EventDetail() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const SITE = useSite();
  const { data, loading, error, reload } = useFetch(`read/events_church?id=${encodeURIComponent(id)}`);
  const found = data?.find(e => String(e.id) === String(id));
  const ev = found && isLive(found)
    ? { ...found, occurrence_date: params.get('date') || String(found.date).slice(0, 10) }
    : null;
  const description = ev?.description || ev?.desc_text;
  const reg = safeUrl(ev?.registration_url);

  usePageMeta(ev ? `${ev.title} | Events` : 'Event', plainText(description).slice(0, 155) || `An event at ${SITE.shortName} in Columbiana, Ohio.`);
  useJsonLd(ev ? {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: ev.title,
    startDate: ev.occurrence_date,
    description: plainText(description) || undefined,
    image: safeUrl(ev.image_url) || undefined,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: ev.location || SITE.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: SITE.address.street,
        addressLocality: SITE.address.city,
        addressRegion: SITE.address.region,
        postalCode: SITE.address.postalCode,
        addressCountry: 'US',
      },
    },
    organizer: { '@type': 'Organization', name: SITE.name, url: SITE.url },
  } : null);

  if (loading) return <Section><Spinner /></Section>;
  if (error) return <Section><ErrorState message={error} onRetry={reload} /></Section>;
  if (!ev) return <NotFound what="event" />;

  return (
    <>
      <article>
        <header className="bg-white">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10 md:py-14">
            <Link to="/events" className="inline-flex items-center min-h-[44px] font-semibold text-[#8A6309] underline underline-offset-4">All events</Link>
            {ev.ministry && <p className="kicker text-[#8A6309] mt-2">{ev.ministry}</p>}
            <h1 className="text-3xl md:text-5xl">{ev.title}</h1>
            <dl className="mt-5 grid sm:grid-cols-2 gap-x-8 gap-y-2 text-black/80">
              <div><dt className="inline font-semibold">Date: </dt><dd className="inline">{formatDate(ev.occurrence_date)}</dd></div>
              <div><dt className="inline font-semibold">Time: </dt><dd className="inline">{ev.time || 'To be announced'}</dd></div>
              {ev.location && <div><dt className="inline font-semibold">Where: </dt><dd className="inline">{ev.location}</dd></div>}
            </dl>
          </div>
        </header>
        <Section tone="cream" narrow>
          {safeUrl(ev.image_url) && <PhotoBox src={ev.image_url} alt="" label={ev.title} ratio="aspect-[16/9]" className="mb-8" />}
          {description && <RichText value={description} className="text-lg mb-8" />}
          <div className="flex flex-wrap gap-3 items-center">
            {reg && <Btn href={reg} variant="primary">Sign up</Btn>}
            <button type="button" onClick={() => downloadIcs(ev)} className="btn btn-outline">Add to Calendar</button>
          </div>
        </Section>
      </article>
      <EndCta title="Come to Sunday" text="Our weekly gathering is the easiest place to start." to="/plan-your-visit" label="Plan Your Visit" />
    </>
  );
}
