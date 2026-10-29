import { useEffect } from 'react';
import { SITE } from '../config';
import { SEO } from '../content/seo';

function setMeta(selector, attr, value) {
  const el = document.head.querySelector(selector);
  if (el && value) el.setAttribute(attr, value);
}

// usePageMeta('plan')                    uses the title and description in content/seo.js
// usePageMeta('Some title', 'A summary')  adds the site name to the title
export default function usePageMeta(keyOrTitle, description) {
  useEffect(() => {
    if (!keyOrTitle) return;
    const known = SEO[keyOrTitle];
    const title = known ? known[0] : `${keyOrTitle} | ${SITE.shortName}`;
    const desc = known ? known[1] : description;
    const image = `${SITE.url}${SITE.defaultOgImage}`;
    document.title = title;
    setMeta('meta[name="description"]', 'content', desc);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', desc);
    setMeta('meta[property="og:url"]', 'content', `${SITE.url}${window.location.pathname}`);
    setMeta('meta[property="og:image"]', 'content', image);
    setMeta('meta[property="twitter:title"]', 'content', title);
    setMeta('meta[property="twitter:description"]', 'content', desc);
    setMeta('meta[property="twitter:image"]', 'content', image);
    setMeta('link[rel="canonical"]', 'href', `${SITE.url}${window.location.pathname}`);
  }, [keyOrTitle, description]);
}
