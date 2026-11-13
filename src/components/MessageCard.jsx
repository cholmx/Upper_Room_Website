import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, messagePath, seriesPath, ytId } from '../utils';
import YtThumb from './YtThumb';
import NewBadge from './NewBadge';
import { parseCategories } from '../lib/categories';
import SafeIcon from '../common/SafeIcon';
import { FiPlay, FiHeadphones } from 'react-icons/fi';
import useSermonPodcast from '../hooks/useSermonPodcast';


export default function MessageCard({ message, as: Heading = 'h3' }) {
  const id = ytId(message.video_url || message.yt);
  const podcast = useSermonPodcast(message);
  return (
    <article className="rounded-2xl overflow-hidden flex flex-col neu">
      <Link to={messagePath(message)} className="thumb-link block relative aspect-video overflow-hidden bg-[#1e2522]" aria-hidden="true" tabIndex={-1}>
        {id ? (
          <YtThumb id={id} className="absolute inset-0 w-full h-full object-cover" />
        ) : null}
        <span className="thumb-play absolute inset-0 flex items-center justify-center text-white/90">
          <SafeIcon icon={id ? FiPlay : FiHeadphones} className="text-4xl" />
        </span>
      </Link>
      <div className="p-5 flex flex-col flex-grow">
        <p className="text-sm text-black">{[message.date && formatDate(message.date), message.speaker].filter(Boolean).join('  |  ')} <NewBadge date={message.date} className="ml-2" /></p>
        <Heading className="text-xl mt-1 mb-2"><Link to={messagePath(message)} className="hover:text-[#1e2522]">{message.title}</Link></Heading>
        {message.scripture && <p className="text-sm font-semibold text-[#1e2522]">{message.scripture}</p>}
        {parseCategories(message.topic).length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Categories">
            {parseCategories(message.topic).slice(0, 3).map(c => <li key={c} className="text-xs font-display font-bold px-3 py-1 rounded-full bg-[#EDE9DC] text-[#1e2522]">{c}</li>)}
          </ul>
        )}
        {podcast.listenUrl && (
          <p className="mt-3 text-sm">
            <a href={podcast.listenUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 min-h-[44px] font-display font-bold underline underline-offset-4">
              <SafeIcon icon={FiHeadphones} aria-hidden="true" />Listen<span className="sr-only"> to {message.title} on the podcast (opens in a new tab)</span>
            </a>
          </p>
        )}
        {message.series && (
          <p className="mt-auto pt-3 text-sm"><Link to={seriesPath(message.series)} className="underline underline-offset-4">Series: {message.series}</Link></p>
        )}
      </div>
    </article>
  );
}
