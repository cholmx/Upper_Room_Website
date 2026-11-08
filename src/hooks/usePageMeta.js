import { useEffect } from 'react';
import { SITE } from '../config';
import { SEO } from '../content/seo';
import { schemaFor } from '../content/schema';

function setMeta(selector, attr, value) {
  const el = document.head.querySelector(selector);
  if (el && value) el.setAttribute(attr, value);
}

// usePageMeta('plan')                    uses the title and description in content/seo.js
// usePageMeta('Some title', 'A summary')  adds the site name to the title
// A third argument can set { image, type } for pages that have their own picture, such as a message.
export default function usePageMeta(keyOrTitle, description, extra = {}) {
  const { image: pageImage, type } = extra;
  useEffect(() => {
    if (!keyOrTitle) return undefined;
    const known = SEO[keyOrTitle];
    const title = known ? known[0] : `${keyOrTitle} | ${SITE.shortName}`;
    const desc = known ? known[1] : description;
    const image = pageImage || `${SITE.url}${SITE.defaultOgImage}`;
    const path = window.location.pathname;
    document.title = title;
    setMeta('meta[name="description"]', 'content', desc);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', desc);
    setMeta('meta[property="og:url"]', 'content', `${SITE.url}${path}`);
    setMeta('meta[property="og:image"]', 'content', image);
    setMeta('meta[property="og:type"]', 'content', type || 'website');
    setMeta('meta[property="twitter:title"]', 'content', title);
    setMeta('meta[property="twitter:description"]', 'content', desc);
    setMeta('meta[property="twitter:image"]', 'content', image);
    setMeta('link[rel="canonical"]', 'href', `${SITE.url}${path}`);

    // Structured data for the page, replaced whenever the page changes.
    const added = schemaFor(path).map(data => {
      const el = document.createElement('script');
      el.type = 'application/ld+json';
      el.dataset.pageSchema = 'true';
      el.textContent = JSON.stringify(data);
      document.head.appendChild(el);
      return el;
    });
    return () => added.forEach(el => el.remove());
  }, [keyOrTitle, description, pageImage, type]);
}
