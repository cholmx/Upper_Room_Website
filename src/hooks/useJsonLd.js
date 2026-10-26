import { useEffect } from 'react';

// Injects a JSON-LD block for the current page and removes it on unmount.
export default function useJsonLd(data) {
  const json = data ? JSON.stringify(data) : null;
  useEffect(() => {
    if (!json) return undefined;
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.dataset.page = 'true';
    el.textContent = json;
    document.head.appendChild(el);
    return () => el.remove();
  }, [json]);
}
