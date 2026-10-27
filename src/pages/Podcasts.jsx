import React, { useState, useEffect, useRef } from 'react';
import useFetch from '../hooks/useFetch';
import { ErrorState } from '../components/StateViews';
import { motion } from 'framer-motion';
import usePageMeta from '../hooks/usePageMeta';
import * as FiIcons from 'react-icons/fi';
import PageHero from '../components/PageHero';
import SafeIcon from '../common/SafeIcon';
import { fadeUpShort as fadeUp } from '../lib/motion';

const { FiHeadphones, FiPlayCircle, FiPauseCircle, FiCalendar, FiX } = FiIcons;

export default function Podcasts() {
  usePageMeta('Podcasts', 'Listen to messages and discussions from Upper Room Fellowship anywhere.');
  const { data, loading, error, reload } = useFetch('read/episodes?sort=date&order=desc');
  const episodes = data ?? [];

  const [activeEpisode, setActiveEpisode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback error:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, activeEpisode]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  const togglePlay = (ep) => {
    if (!ep.audio) return;
    
    if (activeEpisode?.id === ep.id) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveEpisode(ep);
      setIsPlaying(true);
      setProgress(0);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const skip = (amount) => {
    if (audioRef.current) {
      audioRef.current.currentTime += amount;
    }
  };

  const handleScrub = (e) => {
    if (audioRef.current) {
      const scrubTime = parseFloat(e.target.value);
      audioRef.current.currentTime = scrubTime;
      setProgress(scrubTime);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIndex = (speeds.indexOf(speed) + 1) % speeds.length;
    setSpeed(speeds[nextIndex]);
  };

  return (
    <div className="bg-[#F9F9F7] min-h-screen text-black pb-32 pt-20">
      {/* Hero */}
      <PageHero kicker={'Listen Anywhere'} title={'Podcasts'} subtitle={'Catch up on the latest messages, discussions, and spiritual insights.'} image="https://images.pexels.com/photos/7383469/pexels-photo-7383469.jpeg?auto=compress&cs=tinysrgb&h=1200" />

      {/* Content */}
      <div className="py-24 px-6 max-w-[900px] mx-auto">
        {loading ? (
          <div role="status" className="text-center py-32 opacity-60 flex flex-col items-center justify-center space-y-6">
            <SafeIcon icon={FiHeadphones} className="text-5xl animate-pulse text-[#8A6309]" />
            <p className="text-lg">Loading episodes...</p>
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : episodes.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-3xl border border-black/5 shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <SafeIcon icon={FiHeadphones} className="text-4xl opacity-40 text-gray-800" />
            </div>
            <h3 className="text-3xl font-bold mb-3">No Episodes Found</h3>
            <p className="opacity-60 text-lg">Check back soon for new podcast episodes!</p>
          </div>
        ) : (
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            className="grid gap-6"
          >
            {episodes.map((ep) => (
              <motion.div 
                variants={fadeUp}
                key={ep.id} 
                className={`bg-white p-6 md:p-8 border rounded-3xl flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center transition-all duration-300 group translate-y-0 hover:-translate-y-1 ${activeEpisode?.id === ep.id ? 'border-[#FFC44F] ring-2 ring-[#FFC44F]/50 shadow-xl' : 'border-black/5 hover:shadow-xl'}`}
              >
                <div 
                  onClick={() => ep.audio && togglePlay(ep)}
                  className={`w-20 h-20 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                    !ep.audio ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' :
                    activeEpisode?.id === ep.id 
                      ? 'bg-[#FFC44F] text-[#0B1613] cursor-pointer scale-105' 
                      : 'bg-[#0B1613] text-white hover:bg-[#FFC44F] hover:text-[#0B1613] cursor-pointer group-hover:scale-105'
                  }`}
                >
                   <SafeIcon icon={(activeEpisode?.id === ep.id && isPlaying) ? FiPauseCircle : FiPlayCircle} className="text-4xl" />
                </div>
                
                <div className="flex-grow w-full">
                  <div className="flex flex-wrap items-center gap-3 text-xs opacity-70 mb-3 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full text-black">
                      <SafeIcon icon={FiCalendar} />
                      {ep.date ? new Date(ep.date).toLocaleDateString() : 'Unknown Date'}
                    </span>
                    {ep.feed && (
                      <span className="text-[#8A6309]">
                        {ep.feed}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-[#8A6309] transition-colors leading-tight">{ep.title || 'Untitled Episode'}</h3>
                  
                  {ep.audio ? (
                    <button 
                      onClick={() => togglePlay(ep)}
                      className="mt-2 text-sm font-bold text-[#8A6309] hover:text-black uppercase tracking-wider flex items-center gap-2 transition-colors"
                    >
                      <SafeIcon icon={(activeEpisode?.id === ep.id && isPlaying) ? FiPauseCircle : FiPlayCircle} className="text-lg" />
                      {(activeEpisode?.id === ep.id && isPlaying) ? 'Pause Episode' : 'Listen Now'}
                    </button>
                  ) : (
                    <p className="text-sm italic opacity-50 mt-2 bg-gray-50 inline-block px-3 py-1 rounded-md">Audio track not available</p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Sticky Bottom Audio Player */}
      {activeEpisode && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0B1613] text-white border-t border-white/10 p-4 md:p-6 z-50 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="max-w-[1145px] mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-12">
            
            {/* Info */}
            <div className="flex-1 min-w-0 flex items-center gap-4 w-full border-b border-white/10 md:border-none pb-4 md:pb-0">
              <button onClick={() => setActiveEpisode(null)} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors" aria-label="Close Player">
                <SafeIcon icon={FiX} />
              </button>
              <div className="truncate">
                <div className="font-bold text-lg truncate mb-1">{activeEpisode.title || 'Untitled Episode'}</div>
                <div className="text-xs uppercase tracking-wider text-[#FFC44F] truncate font-bold">{activeEpisode.feed || 'Podcast'}</div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center flex-1 w-full max-w-[500px]">
              <div className="flex items-center gap-8 mb-4">
                <button onClick={() => skip(-15)} className="text-sm font-bold opacity-70 hover:opacity-100 hover:text-[#FFC44F] transition-colors">-15s</button>
                
                <button onClick={() => togglePlay(activeEpisode)} className="text-[#FFC44F] hover:text-white transition-all transform hover:scale-110">
                  <SafeIcon icon={isPlaying ? FiPauseCircle : FiPlayCircle} className="text-5xl drop-shadow-md" />
                </button>
                
                <button onClick={() => skip(15)} className="text-sm font-bold opacity-70 hover:opacity-100 hover:text-[#FFC44F] transition-colors">+15s</button>
              </div>
              
              {/* Progress Bar */}
              <div className="flex items-center gap-4 w-full text-xs font-mono opacity-80">
                <span className="w-10 text-right">{formatTime(progress)}</span>
                <input 
                  type="range" 
                  min="0" 
                  max={duration || 100} 
                  value={progress}
                  onChange={handleScrub}
                  className="flex-1 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#FFC44F] hover:h-2 transition-all"
                />
                <span className="w-10">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Utilities */}
            <div className="flex-1 flex justify-end w-full md:w-auto items-center gap-4 hidden md:flex">
              <button onClick={cycleSpeed} className="text-sm font-bold border border-white/30 rounded-full px-4 py-1.5 opacity-70 hover:opacity-100 hover:border-[#FFC44F] hover:text-[#FFC44F] transition-colors w-16 text-center">
                {speed}x
              </button>
            </div>

            {/* Hidden Audio Element */}
            <audio 
              ref={audioRef}
              src={activeEpisode.audio}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
}