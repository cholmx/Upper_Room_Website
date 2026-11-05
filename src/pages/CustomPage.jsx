import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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


  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcf9ed] pt-32 flex flex-col items-center justify-center opacity-60">
        <div className="w-12 h-12 border-4 border-[#eaa235] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold tracking-wide text-sm">Loading Page...</p>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-[#fcf9ed] pt-40 px-6 text-center">
        <div className="max-w-xl mx-auto p-12 rounded-3xl neu">
          <div className="text-6xl mb-6">📄</div>
          <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
          <p className="opacity-60 text-lg">The page you are looking for does not exist or has been moved.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fcf9ed] min-h-screen text-[#1e2522] pt-20 pb-32">
      {/* Hero Banner */}
      <div className="bg-[#1e2522] text-[#fcf9ed] py-24 px-6 text-center relative overflow-hidden">
         {/* Subtle abstract background */}
         <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/9562304/pexels-photo-9562304.jpeg?auto=compress&cs=tinysrgb&h=1200')] bg-cover bg-center opacity-[0.08] mix-blend-overlay"></div>
         
         <div className="max-w-[800px] mx-auto relative z-10">
           <span className="kicker text-[#eaa235] mb-4 inline-block">Information</span>
           <h1 className="text-4xl md:text-6xl mb-8 leading-tight">{page.title_text}</h1>
           <div className="w-16 h-1 bg-[#eaa235] mx-auto rounded-full opacity-50"></div>
         </div>
      </div>

      {/* Content Body */}
      <div className="py-24 px-6">
        <div className="max-w-[800px] mx-auto p-8 md:p-16 rounded-3xl neu">
          <div className="space-y-8 text-lg md:text-xl text-[#1e2522]/80 leading-snug font-serif italic text-[#1e2522]">
            {stripHtml(page.body_content_text).split('\n').filter(Boolean).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}