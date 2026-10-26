import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useFetch from '../hooks/useFetch';
import usePageMeta from '../hooks/usePageMeta';
import { expandEvents, isLive, downloadIcs, safeUrl } from '../utils';
import { plainText } from '../lib/markdown';
import PageHero from '../components/PageHero';
import { Spinner, ErrorState } from '../components/StateViews';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMapPin, FiClock, FiArrowRight, FiCalendar, FiRepeat } = FiIcons;

const RECURRENCE_LABEL = { weekly: 'Every week', biweekly: 'Every 2 weeks', monthly: 'Every month' };

export default function Events() {
  usePageMeta('Events', 'Upcoming events and gatherings at Upper Room Fellowship in Columbiana, Ohio.');
  const { data, loading, error, reload } = useFetch('read/events_church?sort=date:asc');
  const events = useMemo(() => expandEvents((data ?? []).filter(isLive)), [data]);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="bg-[#F9F9F7] min-h-screen text-black pb-24 pt-20">
      <PageHero kicker="Get Involved" title="Upcoming Events" subtitle="Find where you belong and connect with community." image="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=2000" />

      <div className="max-w-[900px] mx-auto px-6 mt-20">
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading ? (
          <Spinner />
        ) : events.length === 0 ? (
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center py-32 bg-white rounded-3xl border border-black/5">
            <div className="text-5xl mb-6" aria-hidden="true">🗓️</div>
            <h2 className="text-3xl font-bold mb-3">No upcoming events</h2>
            <p className="opacity-60 text-lg">Check back soon for new gatherings and opportunities.</p>
          </motion.div>
        ) : (
          <motion.ul
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
          >
            {events.map((e) => {
              const d = new Date(e.occurrence_date + 'T00:00:00');
              const detail = `/events/${e.id}?date=${e.occurrence_date}`;
              return (
                <motion.li key={`${e.id}-${e.occurrence_date}`} variants={fadeUp} className="relative bg-white border border-black/5 p-8 md:p-10 rounded-3xl flex flex-col md:flex-row gap-10 items-start hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1">
                  <div className="md:w-1/4 flex-shrink-0 text-center md:text-left bg-[#F9F9F7] md:bg-transparent w-full md:w-auto py-6 md:py-0 rounded-2xl md:rounded-none">
                    <div className="text-[#8A6309] font-bold text-2xl uppercase tracking-widest leading-tight">
                      {d.toLocaleDateString('en-US', { month: 'short' })}
                      <br className="hidden md:block" />
                      <span className="text-4xl md:text-6xl text-black">{d.getDate()}</span>
                    </div>
                  </div>

                  <div className="md:w-3/4 flex flex-col items-center md:items-start text-center md:text-left">
                    <h3 className="text-3xl font-bold mb-4 group-hover:text-[#8A6309] transition-colors">
                      <Link to={detail} className="after:absolute after:inset-0 after:rounded-3xl">{e.title}</Link>
                    </h3>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                      <div className="flex items-center gap-2 text-sm font-bold opacity-70 bg-gray-100 px-4 py-2 rounded-full">
                        <SafeIcon icon={FiClock} className="text-[#8A6309]" /> {e.time || 'Time TBD'}
                      </div>
                      {e.location && (
                        <div className="flex items-center gap-2 text-sm font-bold opacity-70 bg-gray-100 px-4 py-2 rounded-full">
                          <SafeIcon icon={FiMapPin} className="text-[#8A6309]" /> {e.location}
                        </div>
                      )}
                      {RECURRENCE_LABEL[e.recurrence] && (
                        <div className="flex items-center gap-2 text-sm font-bold opacity-70 bg-gray-100 px-4 py-2 rounded-full">
                          <SafeIcon icon={FiRepeat} className="text-[#8A6309]" /> {RECURRENCE_LABEL[e.recurrence]}
                        </div>
                      )}
                    </div>

                    <p className="opacity-80 text-lg leading-relaxed mb-8 line-clamp-3">{plainText(e.description || e.desc_text)}</p>

                    <div className="relative z-10 flex flex-wrap gap-3 justify-center md:justify-start">
                      {safeUrl(e.registration_url) && (
                        <a href={safeUrl(e.registration_url)} target="_blank" rel="noopener noreferrer" className="btn btn-solid group/btn">
                          Register Now <SafeIcon icon={FiArrowRight} className="group-hover/btn:translate-x-1 transition-transform" />
                        </a>
                      )}
                      <button type="button" onClick={() => downloadIcs(e)} className="btn btn-outline border-black/30 text-black">
                        <SafeIcon icon={FiCalendar} className="mr-2" /> Add to Calendar
                      </button>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </div>
    </div>
  );
}
