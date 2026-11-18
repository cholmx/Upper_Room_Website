// Writes dist/sitemap.xml, dist/robots.txt and dist/llms.txt. Runs automatically after `npm run build`.
import { writeFile } from 'node:fs/promises';
import { collectRoutes, readLiveContent, SITE_URL } from './lib.mjs';
import { SEO, SEO_ROUTES } from '../src/content/seo.js';
import { messagePath } from '../src/utils.js';
import { BELIEFS } from '../src/content/beliefs.js';
import { CORE_VALUES, CORE_VALUES_INTRO, INSIDE_OUT } from '../src/content/values.js';
import { DISCIPLESHIP_FAQ, SOZO_FAQ } from '../src/content/faqs.js';
import { DEFAULT_LEADERS, LEADERSHIP_INTRO } from '../src/content/leaders.js';

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
  '> Upper Room Fellowship is a Spirit-led church in Columbiana, Ohio, founded in 1971. We draw on the ancient ways of the church while keeping full belief in the Spirit’s present work. Our mission: Transforming lives that transform communities. Know God. Share Life. Serve Others.',
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
  '## The full text',
  `- [Everything on this site in one page of plain text](${SITE_URL}/llms-full.txt): what we believe, our core values, how Sunday works, our leaders and answers to common questions.`,
  '',
  '## Pages',
  ...['plan', 'about', 'values', 'discipleship', 'sozo', 'messages', 'shine', 'events', 'growth', 'leadership', 'contact', 'connect', 'give'].map(pageLine),
  '',
  '## Recent messages',
  ...(messages.length
    ? messages.slice(0, 25).map(m => `- [${m.title}](${SITE_URL}${messagePath(m)})${[m.speaker, String(m.date || '').slice(0, 10)].filter(Boolean).length ? `: ${[m.speaker, String(m.date || '').slice(0, 10)].filter(Boolean).join(', ')}` : ''}`)
    : [`- See ${SITE_URL}/messages`]),
  '',
].join('\n');
await writeFile('dist/llms.txt', llms);

// llms-full.txt: the same facts with the full wording of the beliefs, core values, leaders and common questions,
// so an assistant can answer from one page without having to read the whole site.
const fq = (pairs) => pairs.map(([q, a]) => `Q: ${q}\nA: ${a}`).join('\n\n');
const full = [
  '# Upper Room Fellowship: the details',
  '',
  'Upper Room Fellowship is a church in Columbiana, Ohio, founded in 1971 in an upper room above a veterinarian’s office. We are evangelical Christians who believe the Holy Spirit is at work today, and we draw on the ancient ways of the church, like Scripture, prayer, Sabbath and fasting. Our mission is Transforming lives that transform communities, and our three words are Know God, Share Life, Serve Others.',
  '',
  '## Visiting on a Sunday',
  '- Address: 500 Sponseller Road, Columbiana, Ohio 44408',
  '- Adult and kids classes: 9:30am. Worship: 10:30am, with live music, Bible teaching and time for coffee and conversation.',
  '- Kids programs for birth through 5th grade. Wednesday evenings 6:30 to 8:00pm: adult classes, junior high and high school youth groups, and childcare.',
  '- First Steps is a short get-together after the service on the first Sunday of every month, for people who want to hear more about the church and how to get connected.',
  '- Phone 330.482.9058, email info@urfellowship.com. Plan a visit: ' + SITE_URL + '/plan-your-visit',
  '',
  '## What we believe',
  ...BELIEFS.flatMap(b => [`### ${b.title}`, b.full, '']),
  '## Our core values',
  CORE_VALUES_INTRO, INSIDE_OUT, '',
  ...CORE_VALUES.flatMap(v => [`### ${v.title}`, v.thrive, ...v.body, 'In practice, this means:', ...v.practices.map(x => `- ${x}`), '']),
  '## Adult Discipleship Training: common questions',
  fq(DISCIPLESHIP_FAQ), '',
  '## Sozo inner healing prayer ministry: common questions',
  fq(SOZO_FAQ), '',
  '## Our pastors and leaders',
  LEADERSHIP_INTRO,
  ...DEFAULT_LEADERS.map(l => `- ${l.name}, ${l.role}`),
  '',
  `More: ${SITE_URL}/llms.txt`,
  '',
].join('\n');
await writeFile('dist/llms-full.txt', full);
console.log(`[seo] wrote sitemap.xml (${routes.length} urls), robots.txt, llms.txt and llms-full.txt`);
