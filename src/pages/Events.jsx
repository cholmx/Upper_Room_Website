import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { publicDataFetch } from '../api';
import { formatDate } from '../utils';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMapPin, FiClock, FiArrowRight } = FiIcons;

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      const res = await publicDataFetch('read/events_church?sort=date:asc');
      if (res.status === 'success') {
        setEvents(res.data ?? []);
      }
      setLoading(false);
    }
    loadEvents();
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="bg-[#F9F9F7] min-h-screen text-black pb-24 pt-20">
      <div className="photo-section text-[#F9F9F7] py-32 px-6 text-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=2000')" }}>
        <div className="scrim"></div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-[800px] mx-auto relative z-10">
          <span className="kicker text-[#FFC44F]">Get Involved</span>
          <h1 className="text-5xl md:text-7xl mb-4">Upcoming Events</h1>
          <p className="font-serif italic text-xl md:text-2xl opacity-90">Find where you belong and connect with community.</p>
        </motion.div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 mt-20">
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-10 h-10 border-4 border-[#A6790F] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-3xl border border-black/5">
            <div className="text-5xl mb-6">🗓️</div>
            <h2 className="text-3xl font-bold mb-3">No upcoming events</h2>
            <p className="opacity-60 text-lg">Check back soon for new gatherings and opportunities.</p>
          </div>
        ) : (
          <motion.div 
            className="space-y-8"
            initial="hidden" 
            animate="visible" 
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
            }}
          >
            {events.map((e, idx) => (
              <motion.div key={e.id || idx} variants={fadeUp} className="bg-white border border-black/5 p-8 md:p-10 rounded-3xl flex flex-col md:flex-row gap-10 items-start hover:shadow-2xl transition-all duration-400 group translate-y-0 hover:-translate-y-2">
                
                {/* Date Block */}
                <div className="md:w-1/4 flex-shrink-0 text-center md:text-left bg-[#F9F9F7] md:bg-transparent w-full md:w-auto py-6 md:py-0 rounded-2xl md:rounded-none">
                  <div className="text-[#A6790F] font-bold text-2xl uppercase tracking-widest leading-tight">
                    {e?.date ? new Date(e.date).toLocaleDateString('en-US', { month: 'short' }) : ''}
                    <br className="hidden md:block"/>
                    <span className="text-4xl md:text-6xl text-black">{e?.date ? new Date(e.date).getDate() : ''}</span>
                  </div>
                </div>

                {/* Content Block */}
                <div className="md:w-3/4 flex flex-col items-center md:items-start text-center md:text-left">
                  <h3 className="text-3xl font-bold mb-4 group-hover:text-[#A6790F] transition-colors">{e?.title}</h3>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
                    <div className="flex items-center gap-2 text-sm font-bold opacity-70 bg-gray-100 px-4 py-2 rounded-full">
                       <SafeIcon icon={FiClock} className="text-[#A6790F]" /> {e?.time || 'Time TBD'}
                    </div>
                    {e?.location && (
                      <div className="flex items-center gap-2 text-sm font-bold opacity-70 bg-gray-100 px-4 py-2 rounded-full">
                         <SafeIcon icon={FiMapPin} className="text-[#A6790F]" /> {e.location}
                      </div>
                    )}
                  </div>

                  <p className="opacity-80 text-lg leading-relaxed mb-8">{e?.description}</p>
                  
                  {e?.registration_url && (
                    <a href={e.registration_url} target="_blank" rel="noopener noreferrer" className="btn btn-solid w-full md:w-auto group/btn">
                      Register Now <SafeIcon icon={FiArrowRight} className="group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                  )}
                </div>

              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}