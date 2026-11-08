import React from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { Writable } from 'node:stream';
import { AppBody } from './App.jsx';
import { SEO, SEO_ROUTES } from './content/seo';
import { schemaFor } from './content/schema';
import { NAV } from './content/nav';
import { SITE } from './config';
import * as utils from './utils';
import { parseCategories } from './lib/categories';
import { plainText } from './lib/markdown';

export { SEO, SEO_ROUTES, schemaFor, NAV, SITE, utils, parseCategories, plainText };

// Draws one page to a string of HTML. Used only at build time to make the static copies for crawlers.
export function render(url) {
  return new Promise((resolve, reject) => {
    let html = '';
    const sink = new Writable({ write(chunk, _enc, cb) { html += chunk.toString(); cb(); } });
    sink.on('finish', () => resolve(html));
    const { pipe } = renderToPipeableStream(
      <StaticRouter location={url}><AppBody /></StaticRouter>,
      { onAllReady() { pipe(sink); }, onShellError: reject, onError: (e) => { if (process.env.SSR_DEBUG) console.error('[ssr]', url, e?.message); } },
    );
  });
}
