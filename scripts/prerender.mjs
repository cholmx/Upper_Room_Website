// Optional: renders each public route in headless Chromium after a build and saves the HTML
// so crawlers that skip JavaScript see real content.
//   npx playwright install chromium   (once)
//   npm run build && npm run prerender
// Pages that are still loading or showing an error are skipped and fall back to the normal SPA.
import http from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { collectRoutes } from './lib.mjs';

const DIST = path.resolve('dist');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp' };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let file = path.join(DIST, decodeURIComponent(url.pathname));
  if (!file.startsWith(DIST) || !existsSync(file) || path.extname(file) === '') file = path.join(DIST, 'index.html');
  res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
  res.end(await readFile(file));
});
await new Promise(r => server.listen(0, r));
const origin = `http://localhost:${server.address().port}`;

const routes = await collectRoutes();
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let saved = 0;

for (const { path: route } of routes) {
  const page = await browser.newPage();
  await page.goto(origin + route, { waitUntil: 'networkidle' }).catch(() => {});
  await page.waitForTimeout(500);
  const bad = await page.locator('[role="alert"], [role="status"]').count();
  const empty = (await page.locator('main').innerText().catch(() => '')).trim().length < 40;
  if (bad || empty) {
    console.warn(`[prerender] skipped ${route} (not fully loaded)`);
  } else {
    const html = '<!doctype html>\n' + await page.evaluate(() => document.documentElement.outerHTML);
    const dir = route === '/' ? DIST : path.join(DIST, route);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), html);
    saved += 1;
  }
  await page.close();
}

await browser.close();
server.close();
console.log(`[prerender] saved ${saved}/${routes.length} pages`);
