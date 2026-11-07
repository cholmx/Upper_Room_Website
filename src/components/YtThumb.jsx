import React, { useState } from 'react';

// A video's cover picture at the best size YouTube has. The largest one (1280 by 720) does not exist for every
// video, and YouTube then sends a tiny gray stand-in, so the next size down is tried.
const SIZES = ['maxresdefault', 'sddefault', 'hqdefault'];

export default function YtThumb({ id, className = '', alt = '' }) {
  const [i, setI] = useState(0);
  const next = () => setI(n => Math.min(n + 1, SIZES.length));
  if (!id || i >= SIZES.length) return null;
  return (
    <img
      src={`https://i.ytimg.com/vi/${id}/${SIZES[i]}.jpg`}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      onLoad={(e) => { if (e.currentTarget.naturalWidth <= 200 && i < SIZES.length - 1) next(); }}
      onError={next}
    />
  );
}
