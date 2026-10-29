import React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import useFetch from '../hooks/useFetch';
import usePageMeta from '../hooks/usePageMeta';
import useJsonLd from '../hooks/useJsonLd';
import { useSite } from '../settings';
import { formatDate, isLive, downloadIcs, safeUrl } from '../utils';
import { plainText } from '../lib/markdown';
import RichText from '../components/RichText';
import { Spinner, ErrorState, NotFound } from '../components/StateViews';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowLeft, FiClock, FiMapPin, FiCalendar, FiArrowRight } = FiIcons;

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

  usePageMeta(ev?.title || 'Event', plainText(description).slice(0, 155) || `An event at ${SITE.name}.`);
  useJsonLd(ev ? {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: ev.title,
    startDate: ev.occurrence_date,
    description: plainText(description) || undefined,
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

  if (loading) return <div className="pt-32"><Spinner /></div>;
  if (error) return <div className="pt-32 px-6 max-w-3xl mx-auto"><ErrorState message={error} onRetry={reload} /></div>;
  if (!ev) return <NotFound what="event" />;

  return (
    <div className="bg-[#F9F9F7] min-h-screen pt-32 pb-24 px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-[800px] mx-auto">
        <Link to="/events" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#8A6309] hover:text-black mb-8">
          <SafeIcon icon={FiArrowLeft} /> All Events
        </Link>
        <h1 className="text-4xl md:text-6xl mb-8">{ev.title}</h1>
        <div className="flex flex-wrap gap-3 mb-10">
          <span className="flex items-center gap-2 text-sm font-bold bg-white border border-black/5 px-4 py-2 rounded-full"><SafeIcon icon={FiCalendar} className="text-[#8A6309]" /> {formatDate(ev.occurrence_date)}</span>
          <span className="flex items-center gap-2 text-sm font-bold bg-white border border-black/5 px-4 py-2 rounded-full"><SafeIcon icon={FiClock} className="text-[#8A6309]" /> {ev.time || 'Time TBD'}</span>
          {ev.location && <span className="flex items-center gap-2 text-sm font-bold bg-white border border-black/5 px-4 py-2 rounded-full"><SafeIcon icon={FiMapPin} className="text-[#8A6309]" /> {ev.location}</span>}
        </div>
        {description && <RichText value={description} className="text-lg md:text-xl mb-12" />}
        <div className="flex flex-wrap gap-3">
          {safeUrl(ev.registration_url) && (
            <a href={safeUrl(ev.registration_url)} target="_blank" rel="noopener noreferrer" className="btn btn-solid group">
              Register Now <SafeIcon icon={FiArrowRight} className="group-hover:translate-x-1 transition-transform" />
            </a>
          )}
          <button type="button" onClick={() => downloadIcs(ev)} className="btn btn-outline border-black/30 text-black">
            <SafeIcon icon={FiCalendar} className="mr-2" /> Add to Calendar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
