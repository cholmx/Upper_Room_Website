// Makes a static copy of every public page, so search engines, AI assistants and link previews that do not run
// JavaScript still see the real words. The site then loads normally on top of the copy.
//   - The pages that are always the same (Home, New Here?, About Us and so on) are drawn with the site's own code.
//   - Messages, message series and each message are written from the database at build time.
// Runs after `vite build` and never stops a build: if anything goes wrong the normal site is left as it was.
import { build } from 'vite';
import { pathToFileURL } from 'node:url';
import { readFile, writeFile, mkdir, rm, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { readLiveContent, readPhotos, SITE_URL } from './lib.mjs';
import { redirectRules } from '../src/content/redirects.js';

const DIST = path.resolve('dist');
const TMP = path.join(os.tmpdir(), `urf-ssr-${process.pid}`);

try {
  const template = await readFile(path.join(DIST, 'index.html'), 'utf8');
  if (!template.includes('<div id="root"></div>')) { console.log('[static] dist/index.html already has page content, skipping.'); process.exit(0); }

  await build({
    configFile: 'vite.config.js', logLevel: 'error',
    build: { ssr: 'src/entry-server.jsx', outDir: TMP, emptyOutDir: true, rollupOptions: { output: { format: 'esm' } } },
    ssr: { noExternal: true },
  });
  const mod = await import(pathToFileURL(path.join(TMP, 'entry-server.js')).href);
  const { SEO, SEO_ROUTES, schemaFor, NAV, SITE, utils, parseCategories, plainText } = mod;
  const { messagePath, seriesPath, formatDate, ytId, ytThumb, ytEmbed, groupSeries } = utils;

  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const ld = (list) => list.map(d => `<script type="application/ld+json" data-page-schema="true">${JSON.stringify(d).replace(/</g, '\\u003c')}</script>`).join('\n');

  // Puts a page's own title, description, address, picture and structured data into the shared page.
  const page = ({ title, description, route, image, type = 'website', schema = [], body }) => {
    const url = `${SITE_URL}${route}`;
    const img = image || `${SITE_URL}${SITE.defaultOgImage}`;
    let html = template;
    const sub = (re, value) => { html = html.replace(re, (_m, a, b) => `${a}${esc(value)}${b}`); };
    html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
    sub(/(<meta name="description" content=")[^"]*(")/, description);
    sub(/(<meta property="og:title" content=")[^"]*(")/, title);
    sub(/(<meta property="og:description" content=")[^"]*(")/, description);
    sub(/(<meta property="og:url" content=")[^"]*(")/, url);
    sub(/(<meta property="og:image" content=")[^"]*(")/, img);
    sub(/(<meta property="og:type" content=")[^"]*(")/, type);
    sub(/(<meta property="twitter:title" content=")[^"]*(")/, title);
    sub(/(<meta property="twitter:description" content=")[^"]*(")/, description);
    sub(/(<meta property="twitter:url" content=")[^"]*(")/, url);
    sub(/(<meta property="twitter:image" content=")[^"]*(")/, img);
    sub(/(<link rel="canonical" href=")[^"]*(")/, url);
    html = html.replace('</head>', `${ld(schema)}\n</head>`);
    return html.replace('<div id="root"></div>', () => `<div id="root">${body}</div>`);
  };

  const write = async (route, html) => {
    const dir = route === '/' ? DIST : path.join(DIST, route);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), html);
  };

  // A plain page frame (menu, address) for the pages written from the database.
  const nav = NAV.flatMap(i => (i.children ? i.children : [i])).filter(i => !i.external).map(i => `<li><a href="${esc(i.to)}">${esc(i.label)}</a></li>`).join('');
  const chrome = (main) => `<header><a href="/">${esc(SITE.name)}</a><nav aria-label="Main"><ul>${nav}</ul></nav></header><main>${main}</main>`
    + `<footer><p>${esc(SITE.name)}, ${esc(SITE.address.street)}, ${esc(SITE.address.city)}, ${esc(SITE.address.region)} ${esc(SITE.address.postalCode)}. Sundays at 10:30am. ${esc(SITE.phone)}. ${esc(SITE.email)}.</p></footer>`;
  const paragraphs = (text) => String(text || '').split(/\n{1,}/).map(l => l.trim()).filter(Boolean).map(l => `<p>${esc(l)}</p>`).join('');
  const meta = (m) => [m.speaker, m.date && formatDate(m.date)].filter(Boolean).join(' | ');

  // The original shell stays for pages that are filled in only in the browser, such as unknown addresses.
  await copyFile(path.join(DIST, 'index.html'), path.join(DIST, 'app.html'));

  const photos = await readPhotos();
  const shareImage = (key) => photos[`banner-${key}`] || photos[`og-image`] || undefined;
  const { messages } = await readLiveContent();

  let saved = 0;
  for (const route of Object.values(SEO_ROUTES)) {
    if (route === '/messages') continue;
    const key = Object.keys(SEO_ROUTES).find(k => SEO_ROUTES[k] === route);
    let body = await mod.render(route);
    if (route === '/' && messages[0]) {
      const m = messages[0];
      body = body.replace('Loading the latest message.', () => `<a href="${esc(messagePath(m))}">${esc(m.title)}</a>${meta(m) ? ` ${esc(meta(m))}` : ''}`);
    }
    if (body.length < 500) { console.warn(`[static] skipped ${route} (nothing drawn)`); continue; }
    await write(route, page({ title: SEO[key][0], description: SEO[key][1], route, image: shareImage(key), schema: schemaFor(route), body }));
    saved += 1;
  }

  const series = groupSeries(messages);
  const list = (items) => `<ul>${items.map(m => `<li><a href="${esc(messagePath(m))}">${esc(m.title)}</a>${meta(m) ? ` <span>${esc(meta(m))}</span>` : ''}${m.series ? ` <span>Series: ${esc(m.series)}</span>` : ''}</li>`).join('')}</ul>`;
  const crumbs = (list2) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: list2.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE_URL}${p}` })) });

  // Messages page
  await write('/messages', page({
    title: SEO.messages[0], description: SEO.messages[1], route: '/messages', image: shareImage('messages'), schema: schemaFor('/messages'),
    body: chrome(`<h1>Messages</h1><p>${esc(SEO.messages[1])}</p>${series.length ? `<h2>Message series</h2><ul>${series.map(s => `<li><a href="${esc(seriesPath(s.name))}">${esc(s.name)}</a> (${s.count} ${s.count === 1 ? 'message' : 'messages'})</li>`).join('')}</ul>` : ''}<h2>Sermon library</h2>${list(messages)}`),
  }));
  saved += 1;

  for (const s of series) {
    const route = seriesPath(s.name);
    const items = messages.filter(m => (m.series || '').trim() === s.name);
    await write(route, page({
      title: `${s.name} message series | ${SITE.shortName}`, description: `Messages from the ${s.name} series at ${SITE.name} in Columbiana, Ohio.`, route,
      schema: [crumbs([[SITE.name, '/'], ['Messages', '/messages'], [s.name, route]])],
      body: chrome(`<h1>${esc(s.name)}</h1><p>${s.count} ${s.count === 1 ? 'message' : 'messages'}.</p>${list(items)}`),
    }));
    saved += 1;
  }

  for (const m of messages) {
    const route = messagePath(m);
    const vid = ytId(m.video_url || m.yt);
    const summary = plainText(m.description);
    const cats = parseCategories(m.topic);
    const description = `${m.title}, a message${m.speaker ? ` by ${m.speaker}` : ''}${m.series ? ` in the ${m.series} series` : ''} at ${SITE.name}.${summary ? ` ${summary}` : ''}`.slice(0, 300);
    const schema = [crumbs([[SITE.name, '/'], ['Messages', '/messages'], [m.title, route]])];
    if (vid) schema.push({ '@context': 'https://schema.org', '@type': 'VideoObject', name: m.title, description: summary || m.title, uploadDate: String(m.date || m.created_at || '').slice(0, 10) || undefined, thumbnailUrl: ytThumb(vid), embedUrl: ytEmbed(m.video_url || m.yt), publisher: { '@type': 'Organization', name: SITE.name } });
    await write(route, page({
      title: `${m.title} | ${SITE.shortName}`, description, route, image: vid ? ytThumb(vid) : undefined, type: 'video.other', schema,
      body: chrome(`<article><p><a href="/messages">All messages</a></p><h1>${esc(m.title)}</h1><p>${esc(meta(m))}</p>${m.scripture ? `<p>Scripture: ${esc(m.scripture)}</p>` : ''}${m.series ? `<p>Series: <a href="${esc(seriesPath(m.series))}">${esc(m.series)}</a></p>` : ''}${cats.length ? `<p>Categories: ${esc(cats.join(', '))}</p>` : ''}${vid ? `<p><a href="https://www.youtube.com/watch?v=${esc(vid)}">Watch this message on YouTube</a></p>` : ''}${summary ? `<h2>Sermon summary</h2>${paragraphs(m.description)}` : ''}${m.discussion_questions ? `<h2>Discussion questions</h2>${paragraphs(m.discussion_questions)}` : ''}${m.notes ? `<h2>Notes and transcript</h2>${paragraphs(m.notes)}` : ''}</article>`),
    }));
    saved += 1;
  }

  // Unknown addresses use the plain shell, not the Home page copy.
  await writeFile(path.join(DIST, '_redirects'), redirectRules('/app.html'));
  console.log(`[static] wrote ${saved} static pages`);
} catch (err) {
  console.warn(`[static] skipped, the normal site is unchanged: ${err?.message || err}`);
} finally {
  await rm(TMP, { recursive: true, force: true }).catch(() => {});
}
