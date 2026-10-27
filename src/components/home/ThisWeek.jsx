import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LiteYouTube from '../LiteYouTube';
import SafeIcon from '../../common/SafeIcon';
import { formatDate, ytId, downloadIcs } from '../../utils';
import { plainText } from '../../lib/markdown';
import * as FiIcons from 'react-icons/fi';

const { FiArrowRight, FiClock, FiMapPin, FiCalendar, FiHeadphones } = FiIcons;

export default function ThisWeek({ site, sermon, event }) {
  const video = sermon?.video_url || sermon?.yt;
  const id = ytId(video);
  const eventDetail = event ? `/events/${event.id}?date=${event.occurrence_date}` : '/events';
  const eventDate = event ? new Date(event.occurrence_date + 'T00:00:00') : null;

  return (
    <div key="features" className="py-24 px-6 bg-[#F9F9F7] text-black">
      <div className="max-w-[1145px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="kicker text-[#8A6309]">This Week</span>
          <h2 className="text-4xl md:text-5xl">What's Happening</h2>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Past sermon */}
          <motion.section
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="lg:col-span-7 bg-white border border-black/5 rounded-[2rem] overflow-hidden shadow-sm flex flex-col"
            aria-label="Watch this past sermon"
          >
            <div className="aspect-video bg-[#0B1613]">
              {id ? (
                <LiteYouTube id={id} title={sermon.title} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30">
                  <SafeIcon icon={FiHeadphones} className="text-7xl" />
                </div>
              )}
            </div>
            <div className="p-8 md:p-10 flex flex-col flex-grow">
              <span className="kicker text-[#8A6309]">Watch This Past Sermon</span>
              {sermon ? (
                <>
                  <h3 className="text-3xl md:text-4xl mb-3">
                    <Link to={`/sermons/${sermon.id}`} className="hover:text-[#8A6309] transition-colors">{sermon.title}</Link>
                  </h3>
                  <p className="text-sm font-bold uppercase tracking-wider opacity-60 mb-4">
                    {[sermon.speaker, sermon.date && formatDate(sermon.date), sermon.series && `Series: ${sermon.series}`].filter(Boolean).join('  •  ')}
                  </p>
                  {sermon.description && <p className="opacity-75 leading-relaxed line-clamp-3 mb-6">{plainText(sermon.description)}</p>}
                  <div className="mt-auto flex flex-wrap gap-4 items-center">
                    <Link to={`/sermons/${sermon.id}`} className="btn btn-solid group">
                      {sermon.notes ? 'Notes & Details' : 'Details'} <SafeIcon icon={FiArrowRight} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link to="/sermons" className="font-bold uppercase tracking-wider text-sm text-[#8A6309] hover:text-black">All messages</Link>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-3xl mb-3">Messages are coming soon</h3>
                  <p className="opacity-70 mb-6">Check back after Sunday for the latest message.</p>
                  <Link to="/sermons" className="btn btn-solid mt-auto self-start">Visit Messages</Link>
                </>
              )}
            </div>
          </motion.section>

          <div className="lg:col-span-5 flex flex-col gap-8">
            {/* This Sunday */}
            <motion.section
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="bg-[#0B1613] text-white rounded-[2rem] p-8 md:p-10"
              aria-label="This Sunday"
            >
              <span className="kicker text-[#FFC44F]">Join Us</span>
              <h3 className="text-3xl mb-5">This Sunday</h3>
              <ul className="space-y-3 mb-8 text-lg">
                <li className="flex items-center gap-3"><SafeIcon icon={FiClock} className="text-[#FFC44F] flex-shrink-0" /> {site.serviceTime}</li>
                <li className="flex items-center gap-3"><SafeIcon icon={FiMapPin} className="text-[#FFC44F] flex-shrink-0" /> {site.addressLine}</li>
              </ul>
              <div className="flex flex-wrap gap-3">
                <Link to="/visit" className="btn btn-solid group">
                  Plan Your Visit <SafeIcon icon={FiArrowRight} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href={site.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">Directions</a>
              </div>
            </motion.section>

            {/* Next event */}
            <motion.section
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="bg-white border border-black/5 rounded-[2rem] p-8 md:p-10 shadow-sm flex-grow"
              aria-label="Next event"
            >
              <span className="kicker text-[#8A6309]">Next Event</span>
              {event ? (
                <div className="flex gap-6 items-start">
                  <div className="text-center flex-shrink-0 bg-[#F9F9F7] rounded-2xl px-5 py-4 border border-black/5">
                    <div className="text-[#8A6309] font-bold uppercase tracking-widest text-sm">{eventDate.toLocaleDateString('en-US', { month: 'short' })}</div>
                    <div className="text-4xl font-black leading-none">{eventDate.getDate()}</div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-2xl mb-2 leading-tight">
                      <Link to={eventDetail} className="hover:text-[#8A6309] transition-colors">{event.title}</Link>
                    </h3>
                    <p className="text-sm opacity-70 mb-4">{[event.time, event.location].filter(Boolean).join('  •  ') || 'Details to come'}</p>
                    <div className="flex flex-wrap gap-4 items-center">
                      <Link to={eventDetail} className="font-bold uppercase tracking-wider text-sm text-[#8A6309] hover:text-black">Details</Link>
                      <button type="button" onClick={() => downloadIcs(event)} className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-sm text-[#8A6309] hover:text-black">
                        <SafeIcon icon={FiCalendar} /> Add to calendar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl mb-2">Nothing scheduled yet</h3>
                  <Link to="/events" className="font-bold uppercase tracking-wider text-sm text-[#8A6309] hover:text-black">See the calendar</Link>
                </>
              )}
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
}
