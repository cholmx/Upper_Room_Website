import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Fills __SITE_URL__ in index.html (canonical, Open Graph, JSON-LD) from VITE_SITE_URL.
function siteUrlPlugin(siteUrl) {
  return {
    name: 'site-url-html',
    transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', siteUrl),
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const siteUrl = (env.VITE_SITE_URL || 'https://www.urfellowship.com').replace(/\/$/, '');

  return {
    plugins: [react(), siteUrlPlugin(siteUrl)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  };
});
