// Optional integrations, enabled only when their env vars are set.
let sentry = null;

export async function initMonitoring() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (dsn) {
    sentry = await import('@sentry/react');
    sentry.init({ dsn, tracesSampleRate: 0 });
  }

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
  if (sentry) sentry.captureException(error, { extra: info });
  else console.error(error, info);
}
