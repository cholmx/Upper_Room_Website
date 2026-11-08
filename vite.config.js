import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { spawnSync } from 'node:child_process';

// Fills __SITE_URL__ in index.html (canonical, Open Graph, JSON-LD) from VITE_SITE_URL.
function siteUrlPlugin(siteUrl) {
  return {
    name: 'site-url-html',
    transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', siteUrl),
  };
}

// After the site is built, writes the sitemap, robots.txt, llms.txt and the static copy of every page (see the
// README, "Search and AI visibility"). It lives here so a plain `vite build`, which is what a host usually runs, does it
// too. It never fails the build: if a step has a problem, the normal site is left as it is.
function searchOutputsPlugin() {
  let skip = false;
  return {
    name: 'search-outputs',
    apply: 'build',
    configResolved(config) { skip = Boolean(config.build.ssr) || process.env.URF_STATIC === '1'; },
    closeBundle() {
      if (skip) return;
      for (const script of ['scripts/generate-seo.mjs', 'scripts/prerender-static.mjs']) {
        const run = spawnSync(process.execPath, [script], { stdio: 'inherit', env: { ...process.env, URF_STATIC: '1' } });
        if (run.status !== 0) console.warn(`[search-outputs] ${script} did not finish, continuing.`);
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const siteUrl = (env.VITE_SITE_URL || 'https://www.urfellowship.com').replace(/\/$/, '');

  return {
    plugins: [react(), siteUrlPlugin(siteUrl), searchOutputsPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.{js,jsx}'],
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  };
});
