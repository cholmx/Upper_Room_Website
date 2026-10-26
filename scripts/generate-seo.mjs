// Writes dist/sitemap.xml and dist/robots.txt. Runs automatically after `npm run build`.
import { writeFile } from 'node:fs/promises';
import { collectRoutes, SITE_URL } from './lib.mjs';

const routes = await collectRoutes();
const urls = routes.map(r => `  <url><loc>${SITE_URL}${r.path === '/' ? '/' : r.path}</loc>${r.lastmod ? `<lastmod>${r.lastmod}</lastmod>` : ''}</url>`);

await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
await writeFile('dist/robots.txt', `User-agent: *\nDisallow: /admin\nDisallow: /login\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
console.log(`[seo] wrote sitemap.xml (${routes.length} urls) and robots.txt`);
