import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, messagePath, seriesPath, ytId, ytThumb } from '../utils';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlay, FiHeadphones } = FiIcons;

export default function MessageCard({ message, as: Heading = 'h3' }) {
  const id = ytId(message.video_url || message.yt);
  return (
    <article className="rounded-2xl overflow-hidden flex flex-col neu">
      <Link to={messagePath(message)} className="block relative aspect-video overflow-hidden bg-[#1e2522]" aria-hidden="true" tabIndex={-1}>
        {id ? (
          <img src={ytThumb(id)} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover text-[#1e2522]/90" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        ) : null}
        <span className="absolute inset-0 flex items-center justify-center text-white/90">
          <SafeIcon icon={id ? FiPlay : FiHeadphones} className="text-4xl" />
        </span>
      </Link>
      <div className="p-5 flex flex-col flex-grow">
        <p className="text-sm text-[#1e2522]/80">{[message.date && formatDate(message.date), message.speaker].filter(Boolean).join('  |  ')}</p>
        <Heading className="text-xl mt-1 mb-2"><Link to={messagePath(message)} className="hover:text-[#1e2522]">{message.title}</Link></Heading>
        {message.scripture && <p className="text-sm font-semibold text-[#1e2522]">{message.scripture}</p>}
        {message.series && (
          <p className="mt-auto pt-3 text-sm"><Link to={seriesPath(message.series)} className="underline underline-offset-4">Series: {message.series}</Link></p>
        )}
      </div>
    </article>
  );
}
