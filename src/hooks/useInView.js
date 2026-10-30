import { useEffect, useRef } from 'react';

// Marks an element with data-in the first time it scrolls into view, so CSS can play its entrance.
export default function useInView(margin = '-8% 0px') {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === 'undefined') { el.dataset.in = 'true'; return undefined; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.dataset.in = 'true'; io.disconnect(); }
    }, { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return ref;
}
