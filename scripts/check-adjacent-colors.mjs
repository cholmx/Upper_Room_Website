// Checks that no two neighboring sections on a page share a background color, including the
// banner above the first section and the footer below the last one.
// Usage: npm run build && npx vite preview --port 4173 &  then  node scripts/check-adjacent-colors.mjs [baseUrl]
import { chromium } from 'playwright';
import { STATIC_ROUTES } from './lib.mjs';

const base = process.argv[2] || 'http://localhost:4173';
const INK = 'rgb(30, 37, 34)';
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
let bad = 0;
for (const route of STATIC_ROUTES) {
  await page.goto(base + route, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  const colors = await page.evaluate((ink) => {
    const CREAM = 'rgb(252, 249, 237)';
    const bg = (el) => {
      if (!el) return CREAM;
      if (el.dataset.imageBand) return 'photo';
      if (el.classList.contains('photo-section')) return ink;
      const c = getComputedStyle(el).backgroundColor;
      return c === 'rgba(0, 0, 0, 0)' ? CREAM : c;
    };
    // Every section is an inset panel inside a wrapper. A band is two panels, so it counts as two colors.
    const colorsOf = (el) => {
      const inner = el.firstElementChild;
      if (el.dataset.band) return [...inner.children].map(bg);
      return [bg(inner)];
    };
    const list = [...document.querySelector('main').children].filter((e) => e.offsetHeight > 0).map(colorsOf);
    list.push(colorsOf([...document.querySelectorAll('footer')].pop()));
    return list;
  }, INK);
  for (let i = 1; i < colors.length; i++) {
    const shared = colors[i].filter((c) => colors[i - 1].includes(c));
    if (shared.length) { bad++; console.log(`${route}: sections ${i} and ${i + 1} share ${shared[0]}`); }
  }
}
await browser.close();
console.log(bad ? `${bad} matching neighbors` : 'No neighboring sections share a color.');
process.exit(bad ? 1 : 0);
