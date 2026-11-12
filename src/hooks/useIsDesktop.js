import { useState, useEffect } from 'react';

// True on screens 1024px wide and up. Pages use it to show a list on phones and tablets and a wider layout on desktops.
export default function useIsDesktop() {
  const q = '(min-width: 1024px)';
  const [yes, setYes] = useState(() => typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(q).matches : false);
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const m = window.matchMedia(q);
    const on = () => setYes(m.matches);
    on();
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return yes;
}
