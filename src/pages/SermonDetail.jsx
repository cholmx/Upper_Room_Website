import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import useFetch from '../hooks/useFetch';
import usePageMeta from '../hooks/usePageMeta';
import useJsonLd from '../hooks/useJsonLd';
import { useSite } from '../settings';
import { formatDate, isLive, ytId, ytEmbed, ytThumb, safeUrl } from '../utils';
import { plainText } from '../lib/markdown';
import RichText from '../components/RichText';
import { Spinner, ErrorState, NotFound } from '../components/StateViews';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowLeft, FiHeadphones } = FiIcons;

export default function SermonDetail() {
  const { id } = useParams();
  const SITE = useSite();
  const { data, loading, error, reload } = useFetch(`read/sermons?id=${encodeURIComponent(id)}`);
  const sermon = data?.find(s => String(s.id) === String(id));
  const live = sermon && isLive(sermon) ? sermon : null;
  const video = live?.video_url || live?.yt;
  const embed = ytEmbed(video);

  usePageMeta(live?.title || 'Message', plainText(live?.description).slice(0, 155) || `A message from ${SITE.name}.`);
  useJsonLd(live && embed ? {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: live.title,
    description: plainText(live.description) || live.title,
    uploadDate: live.date || live.created_at,
    thumbnailUrl: ytThumb(ytId(video)),
    embedUrl: embed,
  } : null);

  if (loading) return <div className="pt-32"><Spinner /></div>;
  if (error) return <div className="pt-32 px-6 max-w-3xl mx-auto"><ErrorState message={error} onRetry={reload} /></div>;
  if (!live) return <NotFound what="message" />;

  return (
    <div className="bg-cream min-h-screen pt-32 pb-24 px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-[900px] mx-auto">
        <Link to="/sermons" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gold-600 hover:text-black mb-8">
          <SafeIcon icon={FiArrowLeft} /> All Messages
        </Link>
        <div className="flex flex-wrap items-center gap-3 opacity-70 text-sm mb-6 uppercase tracking-wider font-bold">
          {live.date && <span>{formatDate(live.date)}</span>}
          {live.speaker && <><span>•</span><span>{live.speaker}</span></>}
          {live.series && (
            <><span>•</span>
              <Link className="text-gold-600 hover:underline" to={`/sermons?series=${encodeURIComponent(live.series)}`}>Series: {live.series}</Link>
            </>
          )}
        </div>
        <h1 className="text-4xl md:text-6xl mb-10">{live.title}</h1>

        {embed && (
          <div className="aspect-video bg-black mb-10 rounded-2xl overflow-hidden shadow-2xl">
            <iframe src={embed} className="w-full h-full" title={live.title} loading="lazy" allowFullScreen></iframe>
          </div>
        )}
        {safeUrl(live.audio_url) && (
          <audio controls preload="none" src={safeUrl(live.audio_url)} className="w-full mb-10" aria-label={`Audio for ${live.title}`} />
        )}
        {safeUrl(live.audio_url) && !embed && (
          <a href={safeUrl(live.audio_url)} className="inline-flex items-center gap-2 font-bold text-gold-600 mb-10"><SafeIcon icon={FiHeadphones} /> Download audio</a>
        )}

        {live.description && <RichText value={live.description} className="text-lg opacity-80 mb-12" />}

        {live.notes && (
          <section className="bg-white border border-black/5 rounded-3xl p-8 md:p-12 shadow-sm">
            <h2 className="text-2xl mb-6">Sermon Notes</h2>
            <RichText value={live.notes} />
          </section>
        )}
      </motion.div>
    </div>
  );
}
