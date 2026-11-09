// Audits the built site in dist/ for common search problems: titles, descriptions, canonicals, headings,
// image text, internal links and sitemap coverage. Run after a build:  npm run check:seo
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const dist = 'dist';
const problems = [];
const warn = (page, msg) => problems.push(`${page}: ${msg}`);

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(full));
    else if (e.name === 'index.html') out.push(full);
  }
  return out;
}

const pick = (html, re) => (html.match(re) || [])[1];
const files = await walk(dist);
const routeOf = (f) => '/' + path.relative(dist, path.dirname(f)).replace(/\\/g, '/').replace(/^\.$/, '');
const routes = new Set(files.map(f => routeOf(f).replace(/\/$/, '') || '/'));
const sitemap = existsSync(`${dist}/sitemap.xml`) ? await readFile(`${dist}/sitemap.xml`, 'utf8') : '';
const titles = new Map();

for (const f of files) {
  const route = routeOf(f) || '/';
  if (/^\/(admin|login)/.test(route)) continue;
  const html = await readFile(f, 'utf8');
  const title = pick(html, /<title>([^<]*)<\/title>/);
  const desc = pick(html, /<meta name="description" content="([^"]*)"/);
  if (!title) warn(route, 'missing <title>');
  else {
    if (title.length > 65) warn(route, `title is ${title.length} characters (aim for 60 or fewer)`);
    if (titles.has(title)) warn(route, `same title as ${titles.get(title)}`);
    titles.set(title, route);
  }
  if (!desc) warn(route, 'missing meta description');
  else if (desc.length < 70 || desc.length > 160) warn(route, `description is ${desc.length} characters (aim for 70 to 160)`);
  if (!/<link rel="canonical"/.test(html)) warn(route, 'missing canonical link');
  if (!/property="og:image"/.test(html)) warn(route, 'missing og:image');
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) warn(route, `${h1} h1 headings (should be 1)`);
  const imgs = html.match(/<img\b[^>]*>/g) || [];
  imgs.filter(i => !/\balt=/.test(i)).forEach(() => warn(route, 'image without alt attribute'));
  if (!sitemap.includes(`${route === '/' ? '' : route}</loc>`) && !sitemap.includes(`${route}/</loc>`)) warn(route, 'not in sitemap.xml');
  for (const [, href] of html.matchAll(/<a [^>]*href="(\/[^"#?]*)"/g)) {
    const clean = href.replace(/\/$/, '') || '/';
    if (!/^\/(admin|login)/.test(clean) && !routes.has(clean) && !existsSync(path.join('public', clean)) && !existsSync(path.join(dist, clean))) warn(route, `link to ${href} has no static page (fine for app-only pages such as /connect, check it opens)`);
  }
}

if (problems.length) {
  console.log(`Found ${problems.length} item(s) to look at:\n` + [...new Set(problems)].map(p => `  - ${p}`).join('\n'));
  process.exitCode = 0;
} else console.log(`Checked ${files.length} pages. No problems found.`);
