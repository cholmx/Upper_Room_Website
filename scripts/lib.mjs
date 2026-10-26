import { loadEnv } from 'vite';

export const env = loadEnv('production', process.cwd(), 'VITE_');
export const SITE_URL = (env.VITE_SITE_URL || 'https://www.urfellowship.com').replace(/\/$/, '');

export const STATIC_ROUTES = ['/', '/about', '/sermons', '/podcasts', '/blog', '/events', '/visit', '/ministries', '/contact'];

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

// Every public URL, with a last-modified date when the row has one.
export async function collectRoutes() {
  const [sermons, posts, events, pages] = await Promise.all([
    readTable('sermons'), readTable('posts'), readTable('events_church'), readTable('custom_pages_church'),
  ]);
  const lm = (r) => String(r.updated_at || r.created_at || r.date || '').slice(0, 10) || undefined;
  return [
    ...STATIC_ROUTES.map(path => ({ path })),
    ...sermons.filter(live).map(r => ({ path: `/sermons/${r.id}`, lastmod: lm(r) })),
    ...posts.filter(live).map(r => ({ path: `/blog/${r.id}`, lastmod: lm(r) })),
    ...events.filter(live).map(r => ({ path: `/events/${r.id}`, lastmod: lm(r) })),
    ...pages.filter(r => r.slug_key).map(r => ({ path: `/p/${encodeURIComponent(r.slug_key)}`, lastmod: lm(r) })),
  ];
}
