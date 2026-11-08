import { loadEnv } from 'vite';
import { SEO_ROUTES } from '../src/content/seo.js';
import { messagePath, seriesPath } from '../src/utils.js';

export const env = loadEnv('production', process.cwd(), 'VITE_');
export const SITE_URL = (env.VITE_SITE_URL || 'https://www.urfellowship.com').replace(/\/$/, '');

export const STATIC_ROUTES = Object.values(SEO_ROUTES);

async function readTable(table) {
  const base = (env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  const key = env.VITE_SUPABASE_ANON_KEY;
  if (!base || !key) return [];
  try {
    const res = await fetch(`${base}/rest/v1/${table}?select=*`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    return Array.isArray(rows) ? rows : [];
  } catch (err) {
    console.warn(`[seo] could not read ${table}: ${err.message}`);
    return [];
  }
}

const live = (row) => {
  if (!row) return false;
  if ([false, 0, '0', 'false'].includes(row.published)) return false;
  return !row.publish_date || String(row.publish_date).slice(0, 10) <= new Date().toISOString().slice(0, 10);
};

// The live messages (newest first), posts and custom pages, read once for the sitemap, llms.txt and the static copies.
export async function readLiveContent() {
  const [sermons, pages, posts] = await Promise.all([readTable('sermons'), readTable('custom_pages_church'), readTable('posts')]);
  const day = (r) => String(r.date || '').slice(0, 10);
  const messages = sermons.filter(live).sort((a, b) =>
    day(b).localeCompare(day(a)) || String(b.created_at || '').localeCompare(String(a.created_at || '')) || (Number(b.id) || 0) - (Number(a.id) || 0));
  return { messages, posts: posts.filter(live), pages };
}

// Every public URL, with a last-modified date when the row has one.
export async function collectRoutes() {
  const [sermons, pages, posts] = await Promise.all([
    readTable('sermons'), readTable('custom_pages_church'), readTable('posts'),
  ]);
  const lm = (r) => String(r.updated_at || r.created_at || r.date || '').slice(0, 10) || undefined;
  const liveSermons = sermons.filter(live);
  const seriesNames = [...new Set(liveSermons.map(r => (r.series || '').trim()).filter(Boolean))];
  return [
    ...STATIC_ROUTES.map(path => ({ path })),
    ...liveSermons.map(r => ({ path: messagePath(r), lastmod: lm(r) })),
    ...seriesNames.map(name => ({ path: seriesPath(name) })),
    ...posts.filter(live).map(r => ({ path: `/blog/${r.id}`, lastmod: lm(r) })),
    ...pages.filter(r => r.slug_key).map(r => ({ path: `/p/${encodeURIComponent(r.slug_key)}`, lastmod: lm(r) })),
  ];
}
