import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { publicDataFetch } from '../api';
import usePageMeta from '../hooks/usePageMeta';
import { stripHtml } from '../utils';

export default function CustomPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  usePageMeta(page?.title_text || 'Page', stripHtml(page?.body_content_text).slice(0, 155));

  useEffect(() => {
    async function fetchPage() {
      setLoading(true);
      const res = await publicDataFetch(`read/custom_pages_church?slug_key=${encodeURIComponent(slug)}`);
      if (res.status === 'success' && res.data?.length > 0) {
        setPage(res.data[0]);
      }
      setLoading(false);
    }
    fetchPage();
  }, [slug]);

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5EE] pt-32 flex flex-col items-center justify-center opacity-60">
        <div className="w-12 h-12 border-4 border-[#A6790F] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold uppercase tracking-widest text-sm">Loading Page...</p>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-[#F7F5EE] pt-40 px-6 text-center">
        <div className="max-w-xl mx-auto bg-white p-12 rounded-3xl border border-black/5 shadow-sm">
          <div className="text-6xl mb-6">📄</div>
          <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
          <p className="opacity-60 text-lg">The page you are looking for does not exist or has been moved.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F5EE] min-h-screen text-black pt-20 pb-32">
      {/* Hero Banner */}
      <div className="bg-[#1E2522] text-[#F7F5EE] py-24 px-6 text-center shadow-lg relative overflow-hidden">
         {/* Subtle abstract background */}
         <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/9562304/pexels-photo-9562304.jpeg?auto=compress&cs=tinysrgb&h=1200')] bg-cover bg-center opacity-[0.08] mix-blend-overlay"></div>
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D49E46] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
         
         <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-[800px] mx-auto relative z-10">
           <span className="kicker text-[#D49E46] mb-4 inline-block">Information</span>
           <h1 className="text-4xl md:text-6xl mb-8 leading-tight">{page.title_text}</h1>
           <div className="w-16 h-1 bg-[#D49E46] mx-auto rounded-full opacity-50"></div>
         </motion.div>
      </div>

      {/* Content Body */}
      <div className="py-24 px-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-[800px] mx-auto bg-white p-8 md:p-16 rounded-3xl border border-black/5 shadow-sm">
          <div className="space-y-8 text-lg md:text-xl text-black/80 leading-relaxed font-serif text-gray-800">
            {stripHtml(page.body_content_text).split('\n').filter(Boolean).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}