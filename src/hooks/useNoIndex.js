import { useEffect } from 'react';

// Tells search engines not to list a page (the sign-in page and the admin).
export default function useNoIndex() {
  useEffect(() => {
    let el = document.head.querySelector('meta[name="robots"]');
    const before = el?.getAttribute('content');
    if (!el) { el = document.createElement('meta'); el.name = 'robots'; document.head.appendChild(el); }
    el.setAttribute('content', 'noindex, nofollow');
    return () => { if (before) el.setAttribute('content', before); else el.remove(); };
  }, []);
}
