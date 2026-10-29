import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import usePageMeta from '../hooks/usePageMeta';
import useFetch from '../hooks/useFetch';
import { ErrorState } from '../components/StateViews';
import RichText from '../components/RichText';
import { plainText } from '../lib/markdown';
import { formatDate, ytId, ytEmbed, ytThumb, isLive, safeUrl } from '../utils';
import PageHero from '../components/PageHero';
import SafeIcon from '../common/SafeIcon';
import { slideInLeft, slideInRight, fadeUpShort as fadeUp } from '../lib/motion';
import * as FiIcons from 'react-icons/fi';

const { FiSearch, FiPlay, FiHeadphones, FiArrowRight, FiFilter, FiChevronDown } = FiIcons;

export default function Sermons() {
  usePageMeta('Messages', 'Watch and listen to recent messages and series from Upper Room Fellowship.');
  const { data, loading, error, reload } = useFetch('read/sermons?sort=created_at:desc');
  const sermons = useMemo(() => (data ?? []).filter(isLive), [data]);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedSeries = searchParams.get('series') || 'All';
  const setSelectedSeries = (series) => setSearchParams(series === 'All' ? {} : { series });
  const [searchQuery, setSearchQuery] = useState('');

  const allSeries = ['All', ...new Set(sermons.map(s => s?.series).filter(Boolean))];

  const filteredSermons = sermons.filter(s => {
    const matchesSeries = selectedSeries === 'All' || s?.series === selectedSeries;
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      (s?.title?.toLowerCase().includes(query)) ||
      (s?.speaker?.toLowerCase().includes(query)) ||
      (plainText(s?.description).toLowerCase().includes(query));

    return matchesSeries && matchesSearch;
  });

  const videoOf = (s) => s?.video_url || s?.yt;
  const featuredSermon = filteredSermons.length > 0 ? filteredSermons[0] : null;
  const pastSermons = filteredSermons.length > 1 ? filteredSermons.slice(1) : [];

  return (
    <div className="bg-[#F9F9F7] min-h-screen text-black pb-24 pt-20">
      <PageHero kicker={'Watch & Listen'} title={'Messages'} subtitle={'Catch up on recent teachings and series.'} image="https://images.pexels.com/photos/34328505/pexels-photo-34328505.jpeg?auto=compress&cs=tinysrgb&h=1200" />

      <div className="max-w-[1145px] mx-auto px-6 mt-16">
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-10 h-10 border-4 border-[#A6790F] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : sermons.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-3xl border border-black/5">
            <div className="text-4xl mb-4">🎬</div>
            <h2 className="text-2xl font-bold opacity-50">No messages found.</h2>
          </div>
        ) : (
          <>
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-12 bg-white p-3 rounded-[2rem] shadow-sm border border-black/5 flex flex-col md:flex-row gap-3">
              <div className="relative flex-grow group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none group-focus-within:text-[#8A6309] transition-colors">
                  <SafeIcon icon={FiSearch} className="text-gray-400 text-xl" />
                </div>
                <input
                  type="text"
                  placeholder="Search by title, speaker, or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-14 pr-6 py-5 border-none bg-[#F9F9F7] rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#A6790F]/30 text-lg transition-all placeholder:text-gray-400"
                />
              </div>

              {allSeries.length > 1 && (
                <div className="relative w-full md:w-72 flex-shrink-0 group">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#8A6309] transition-colors">
                    <SafeIcon icon={FiFilter} className="text-lg" />
                  </div>
                  <select
                    value={selectedSeries}
                    onChange={(e) => setSelectedSeries(e.target.value)}
                    className="block w-full pl-14 pr-12 py-5 appearance-none border-none bg-[#F9F9F7] rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#A6790F]/30 text-lg transition-all cursor-pointer font-medium text-gray-700"
                  >
                    {allSeries.map(series => (
                      <option key={series} value={series}>
                        {series === 'All' ? 'All Series' : series}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none text-gray-400">
                    <SafeIcon icon={FiChevronDown} className="text-xl" />
                  </div>
                </div>
              )}
            </motion.div>

            {filteredSermons.length === 0 ? (
              <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center py-24 bg-white rounded-3xl border border-black/5">
                <div className="text-5xl mb-6">🔍</div>
                <h3 className="text-3xl font-bold mb-3">No messages found</h3>
                <p className="opacity-60 text-lg">We couldn't find any sermons matching your criteria.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setSelectedSeries('All'); }}
                  className="px-8 py-3 rounded-full bg-[#0B1613] text-white font-serif italic uppercase tracking-widest hover:bg-[#FFC44F] hover:text-black transition-colors mt-8"
                >
                  Clear Filters
                </button>
              </motion.div>
            ) : (
              <>
                {featuredSermon && (
                  <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{
                    visible: { transition: { staggerChildren: 0.1 } }
                  }} className="mb-20 bg-white p-8 md:p-12 border border-black/5 shadow-xl rounded-3xl overflow-hidden">
                    <motion.span variants={slideInLeft} className="kicker text-[#8A6309] mb-4 inline-block">
                      {searchQuery ? 'Top Result' : (selectedSeries === 'All' ? 'Latest Message' : `Latest in ${selectedSeries}`)}
                    </motion.span>
                    <motion.h2 variants={slideInRight} className="text-4xl md:text-5xl mb-4"><Link to={`/sermons/${featuredSermon.id}`} className="hover:text-[#8A6309] transition-colors">{featuredSermon?.title}</Link></motion.h2>
                    <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3 opacity-60 text-sm mb-8 uppercase tracking-wider font-bold">
                      <span className="bg-gray-100 px-3 py-1 rounded-full text-black">{featuredSermon?.date ? formatDate(featuredSermon.date) : ''}</span>
                      <span>•</span>
                      <span className="text-black">{featuredSermon?.speaker || 'Speaker'}</span>
                      {featuredSermon?.series && (
                        <>
                          <span>•</span>
                          <span className="text-[#8A6309]">Series: {featuredSermon.series}</span>
                        </>
                      )}
                    </motion.div>
                    
                    {ytEmbed(videoOf(featuredSermon)) ? (
                      <motion.div variants={fadeUp} className="aspect-video bg-black mb-8 rounded-2xl overflow-hidden shadow-2xl relative group">
                        <iframe 
                          src={ytEmbed(videoOf(featuredSermon))} 
                          className="w-full h-full relative z-10" 
                          title={featuredSermon.title}
                          allowFullScreen
                        ></iframe>
                      </motion.div>
                    ) : (
                      <motion.div variants={fadeUp} className="aspect-video bg-gray-100 mb-8 flex items-center justify-center text-gray-400 rounded-2xl border border-black/5">
                        <SafeIcon icon={FiHeadphones} className="text-6xl opacity-20" />
                      </motion.div>
                    )}
                    
                    <motion.div variants={fadeUp} className="opacity-80 max-w-[800px] text-lg leading-relaxed"><RichText value={featuredSermon?.description} /></motion.div>
                    {safeUrl(featuredSermon?.audio_url) && (
                      <motion.a variants={fadeUp} href={safeUrl(featuredSermon.audio_url)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-6 py-3 rounded-full border-2 border-black/20 hover:border-black transition-colors font-bold uppercase tracking-wider text-sm mt-8">
                        <SafeIcon icon={FiHeadphones} className="mr-2" /> Listen to Audio
                      </motion.a>
                    )}
                  </motion.div>
                )}

                {pastSermons.length > 0 && (
                  <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                  }}>
                    <motion.h3 variants={slideInLeft} className="text-3xl font-bold mb-10 border-b border-black/10 pb-4">
                      {searchQuery ? 'More Results' : 'Past Messages'}
                    </motion.h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {pastSermons.map(s => (
                        <motion.div key={s.id} variants={fadeUp} className="relative bg-white border border-black/5 p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 flex flex-col group translate-y-0 hover:-translate-y-2">
                          <div className="aspect-video bg-[#0B1613] mb-6 overflow-hidden relative rounded-xl shadow-inner">
                             {ytId(videoOf(s)) ? (
                                <>
                                  <img 
                                    src={ytThumb(ytId(videoOf(s)))}
                                    loading="lazy" 
                                    alt={s.title}
                                    className="w-full h-full object-cover group-hover:scale-105 group-hover:opacity-60 transition-all duration-500"
                                    onError={(e) => { if (e.currentTarget.dataset.fallback) return; e.currentTarget.dataset.fallback = '1'; e.currentTarget.src = 'https://images.pexels.com/photos/34328505/pexels-photo-34328505.jpeg?auto=compress&cs=tinysrgb&h=800'; }}
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-16 h-16 bg-[#FFC44F] rounded-full flex items-center justify-center text-black pl-1 shadow-lg">
                                      <SafeIcon icon={FiPlay} className="text-2xl" />
                                    </div>
                                  </div>
                                </>
                             ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                  <SafeIcon icon={FiHeadphones} className="text-4xl opacity-50" />
                                </div>
                             )}
                             {s?.series && (
                               <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur text-black text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm">
                                 {s.series}
                               </div>
                             )}
                          </div>
                          <div className="flex flex-wrap gap-2 text-[10px] font-bold opacity-60 uppercase tracking-wider mb-2">
                            <span>{s?.date ? formatDate(s.date) : ''}</span>
                            <span>•</span>
                            <span>{s?.speaker}</span>
                          </div>
                          <h4 className="text-2xl font-bold mb-3 group-hover:text-[#8A6309] transition-colors leading-tight"><Link to={`/sermons/${s.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">{s?.title}</Link></h4>
                          <p className="opacity-70 line-clamp-3 mb-6 flex-grow text-sm leading-relaxed">{plainText(s?.description)}</p>
                          
                          {safeUrl(s?.audio_url) ? (
                            <a href={safeUrl(s.audio_url)} target="_blank" rel="noopener noreferrer" className="relative z-10 mt-auto inline-flex items-center text-sm font-bold text-[#8A6309] hover:text-black uppercase tracking-wider group/link">
                              <SafeIcon icon={FiHeadphones} className="mr-2" /> Listen Audio <SafeIcon icon={FiArrowRight} className="ml-2 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" />
                            </a>
                          ) : (
                            <div className="mt-auto pt-4 border-t border-black/5 opacity-0">Spacer</div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}