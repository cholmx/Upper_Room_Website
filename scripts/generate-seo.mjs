// Writes dist/sitemap.xml, dist/robots.txt and dist/llms.txt. Runs automatically after `npm run build`.
import { writeFile } from 'node:fs/promises';
import { collectRoutes, readLiveContent, SITE_URL } from './lib.mjs';
import { SEO, SEO_ROUTES } from '../src/content/seo.js';
import { messagePath } from '../src/utils.js';

const routes = await collectRoutes();
const urls = routes.map(r => `  <url><loc>${SITE_URL}${r.path}</loc>${r.lastmod ? `<lastmod>${r.lastmod}</lastmod>` : ''}</url>`);
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);

// Search engines and AI assistants are welcome. Only the sign-in page and the admin are kept out.
const AI_BOTS = ['GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'Bytespider', 'Amazonbot', 'DuckAssistBot', 'meta-externalagent'];
const robots = [
  'User-agent: *',
  'Allow: /',
  'Disallow: /admin',
  'Disallow: /login',
  '',
  ...AI_BOTS.flatMap(bot => [`User-agent: ${bot}`, 'Allow: /', 'Disallow: /admin', 'Disallow: /login', '']),
  `Sitemap: ${SITE_URL}/sitemap.xml`,
  '',
].join('\n');
await writeFile('dist/robots.txt', robots);

// llms.txt: a plain summary written for AI assistants (see llmstxt.org).
const { messages } = await readLiveContent();
const pageLine = (key) => `- [${SEO[key][0].split('|')[0].trim()}](${SITE_URL}${SEO_ROUTES[key]}): ${SEO[key][1]}`;
const llms = [
  '# Upper Room Fellowship',
  '',
  '> Upper Room Fellowship is a Spirit-led church in Columbiana, Ohio, founded in 1971. Our mission: Transforming lives that transform communities. Know God. Share Life. Serve Others.',
  '',
  '## Visit us',
  '- Address: 500 Sponseller Road, Columbiana, Ohio 44408',
  '- Sunday worship: 10:30am. Adult and kids classes begin at 9:30am. Kids programs for birth through 5th grade.',
  '- Wednesday evenings, 6:30 to 8:00pm: adult enrichment classes, junior high and high school youth groups, and childcare.',
  '- Phone: 330.482.9058',
  '- Email: info@urfellowship.com',
  `- Website: ${SITE_URL}/`,
  '- YouTube: https://www.youtube.com/@TheUpperRoomFellowship',
  '- Facebook: https://www.facebook.com/urfellowship/',
  '',
  '## Pages',
  ...['plan', 'about', 'values', 'discipleship', 'sozo', 'messages', 'leadership', 'contact', 'connect', 'give'].map(pageLine),
  '',
  '## Recent messages',
  ...(messages.length
    ? messages.slice(0, 25).map(m => `- [${m.title}](${SITE_URL}${messagePath(m)})${[m.speaker, String(m.date || '').slice(0, 10)].filter(Boolean).length ? `: ${[m.speaker, String(m.date || '').slice(0, 10)].filter(Boolean).join(', ')}` : ''}`)
    : [`- See ${SITE_URL}/messages`]),
  '',
].join('\n');
await writeFile('dist/llms.txt', llms);
console.log(`[seo] wrote sitemap.xml (${routes.length} urls), robots.txt and llms.txt`);
