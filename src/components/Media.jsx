import React, { useEffect, useRef } from 'react';
import { imgUrl, isVideoUrl } from '../utils';

// A photo or a video for one place on the site. Videos play silently on a loop and stay still for visitors who ask for less motion.
export default function Media({ src, alt = '', width, className = '', priority = false, onError }) {
  const ref = useRef(null);
  const video = isVideoUrl(src);
  useEffect(() => {
    const el = ref.current;
    if (!video || !el || typeof window.matchMedia !== 'function') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.removeAttribute('autoplay'); el.pause(); }
  }, [video, src]);

  if (video) {
    return <video ref={ref} src={src} className={className} muted loop playsInline autoPlay preload={priority ? 'auto' : 'metadata'} aria-hidden={alt ? undefined : 'true'} aria-label={alt || undefined} onError={onError} />;
  }
  return <img src={width ? imgUrl(src, width) : src} alt={alt} loading={priority ? 'eager' : 'lazy'} {...(priority ? { fetchpriority: 'high' } : {})} decoding="async" className={className} onError={onError} />;
}
