import { useEffect } from 'react';
import { SITE } from '../config';

function setMeta(selector, attr, value) {
  const el = document.head.querySelector(selector);
  if (el && value) el.setAttribute(attr, value);
}

export default function usePageMeta(title, description) {
  useEffect(() => {
    if (!title) return;
    const full = `${title} | ${SITE.name}`;
    document.title = full;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', full);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', window.location.href);
    setMeta('link[rel="canonical"]', 'href', `${SITE.url}${window.location.pathname}`);
  }, [title, description]);
}
