import React, { useState } from 'react';
import YtThumb from './YtThumb';
import SafeIcon from '../common/SafeIcon';
import { FiPlay } from 'react-icons/fi';


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
      className="group relative w-full h-full block bg-[#1e2522]"
    >
      <YtThumb id={id} className="w-full h-full object-cover group-hover:opacity-60" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="w-20 h-20 bg-[#eaa235] rounded-full flex items-center justify-center text-[#1e2522] pl-1 elev-2 transition-transform">
          <SafeIcon icon={FiPlay} className="text-3xl" />
        </span>
      </span>
    </button>
  );
}
