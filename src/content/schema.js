// Structured data (JSON-LD) that tells search engines and AI assistants what each page is about.
// Used by the page hooks in the browser and by the build step that writes the static copies of the pages.
import { SITE } from '../config';
import { SEO, SEO_ROUTES } from './seo';
import { DISCIPLESHIP_FAQ, SOZO_FAQ } from './faqs';
import { DEFAULT_LEADERS } from './leaders';

const abs = (path) => `${SITE.url}${path}`;

const PLACE = {
  '@type': 'Place',
  name: SITE.name,
  address: {
    '@type': 'PostalAddress',
    streetAddress: SITE.address.street,
    addressLocality: SITE.address.city,
    addressRegion: SITE.address.region,
    postalCode: SITE.address.postalCode,
    addressCountry: 'US',
  },
};

export function breadcrumbs(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) })),
  };
}

export function faqPage(pairs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pairs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
}

// The weekly worship service, so assistants can answer "what time is church on Sunday in Columbiana".
export function sundayService() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `Sunday worship at ${SITE.name}`,
    description: 'Worship with live music, clear Bible teaching, and time for coffee and conversation. Kids programs for birth through 5th grade.',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    eventSchedule: {
      '@type': 'Schedule',
      repeatFrequency: 'P1W',
      byDay: 'https://schema.org/Sunday',
      startTime: '10:30:00',
      endTime: '11:45:00',
      scheduleTimezone: 'America/New_York',
    },
    location: PLACE,
    organizer: { '@type': 'Church', name: SITE.name, url: abs('/') },
    isAccessibleForFree: true,
  };
}

export function leaders() {
  return DEFAULT_LEADERS.map(p => ({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: p.name,
    jobTitle: p.role,
    worksFor: { '@type': 'Church', name: SITE.name, url: abs('/') },
  }));
}

const KEY_BY_ROUTE = Object.fromEntries(Object.entries(SEO_ROUTES).map(([k, v]) => [v, k]));

// Everything that belongs in the head of a page, by its address.
export function schemaFor(path) {
  const key = KEY_BY_ROUTE[path];
  if (!key) return [];
  const title = (SEO[key]?.[0] || '').split('|')[0].trim();
  const out = [];
  out.push(path === '/' ? breadcrumbs([[SITE.name, '/']]) : breadcrumbs([[SITE.name, '/'], [title, path]]));
  if (key === 'home' || key === 'plan') out.push(sundayService());
  if (key === 'discipleship') out.push(faqPage(DISCIPLESHIP_FAQ));
  if (key === 'sozo') out.push(faqPage(SOZO_FAQ));
  if (key === 'leadership') out.push(...leaders());
  return out;
}
