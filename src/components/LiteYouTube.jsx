import React, { useState } from 'react';
import { ytThumb } from '../utils';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlay } = FiIcons;

// Shows a thumbnail and only loads the YouTube player after a click, so nothing plays
// by itself and the page does not download the player until someone wants it.
export default function LiteYouTube({ id, title }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        className="w-full h-full"
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
        title={title}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      ></iframe>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play ${title}`}
      className="group relative w-full h-full block bg-[#0B1613]"
    >
      <img
        src={ytThumb(id)}
        alt=""
        loading="lazy"
        className="w-full h-full object-cover text-black/80 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="w-20 h-20 bg-[#FFC44F] rounded-full flex items-center justify-center text-black pl-1 shadow-2xl group-hover:scale-110 transition-transform">
          <SafeIcon icon={FiPlay} className="text-3xl" />
        </span>
      </span>
    </button>
  );
}
