import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import useFetch from '../hooks/useFetch';
import usePageMeta from '../hooks/usePageMeta';
import useJsonLd from '../hooks/useJsonLd';
import { useSite } from '../settings';
import { formatDate, isLive } from '../utils';
import { plainText } from '../lib/markdown';
import RichText from '../components/RichText';
import { Spinner, ErrorState, NotFound } from '../components/StateViews';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowLeft } = FiIcons;

export default function BlogPost() {
  const { id } = useParams();
  const SITE = useSite();
  const { data, loading, error, reload } = useFetch(`read/posts?id=${encodeURIComponent(id)}`);
  const post = data?.find(p => String(p.id) === String(id));
  const live = post && isLive(post) ? post : null;

  usePageMeta(live?.title || 'Article', plainText(live?.body).slice(0, 155) || `An article from ${SITE.name}.`);
  useJsonLd(live ? {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: live.title,
    datePublished: live.date || live.created_at,
    author: live.author ? { '@type': 'Person', name: live.author } : undefined,
    image: live.image_url || undefined,
    publisher: { '@type': 'Organization', name: SITE.name },
  } : null);

  if (loading) return <div className="pt-32"><Spinner /></div>;
  if (error) return <div className="pt-32 px-6 max-w-3xl mx-auto"><ErrorState message={error} onRetry={reload} /></div>;
  if (!live) return <NotFound what="article" />;

  return (
    <article className="bg-[#F9F9F7] min-h-screen pt-32 pb-24 px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-[800px] mx-auto">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#A6790F] hover:text-black mb-8">
          <SafeIcon icon={FiArrowLeft} /> All Articles
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wider text-gray-500 mb-6">
          {live.category && <span className="bg-[#A6790F]/10 text-[#A6790F] px-4 py-1.5 rounded-full">{live.category}</span>}
          <span>{formatDate(live.date || live.created_at?.slice(0, 10))}</span>
          {live.author && <><span>•</span><span>{live.author}</span></>}
        </div>
        <h1 className="text-4xl md:text-6xl mb-10">{live.title}</h1>
        {live.image_url && (
          <img src={live.image_url} alt="" className="w-full rounded-2xl mb-12 shadow-lg" />
        )}
        <RichText value={live.body} className="text-lg md:text-xl" />
      </motion.div>
    </article>
  );
}
