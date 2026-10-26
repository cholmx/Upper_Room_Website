// Optional integrations, enabled only when their env vars are set. Both load from a
// CDN at runtime, so neither adds an npm dependency or a build-time import.

// Sentry: set VITE_SENTRY_DSN. Uses Sentry's loader script (enable "Loader Script"
// under the project's Client Keys); it reports uncaught errors automatically.
function loadSentry(dsn) {
  const key = dsn.match(/^https?:\/\/([^@/]+)@/)?.[1];
  if (!key) return;
  const s = document.createElement('script');
  s.src = `https://js.sentry-cdn.com/${key}.min.js`;
  s.crossOrigin = 'anonymous';
  s.async = true;
  document.head.appendChild(s);
}

export async function initMonitoring() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (dsn) loadSentry(dsn);

  const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
  if (domain) {
    const s = document.createElement('script');
    s.defer = true;
    s.dataset.domain = domain;
    s.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(s);
  }
}

export function captureError(error, info) {
  if (window.Sentry?.captureException) window.Sentry.captureException(error, { extra: info });
  else console.error(error, info);
}
