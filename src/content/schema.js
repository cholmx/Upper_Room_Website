// Structured data (JSON-LD) that tells search engines and AI assistants what each page is about.
// Used by the page hooks in the browser and by the build step that writes the static copies of the pages.
import { SITE } from '../config';
import { SEO, SEO_ROUTES } from './seo';
import { DISCIPLESHIP_FAQ, VISIT_FAQ, SOZO_FAQ } from './faqs';
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

// The date of the next Sunday service in Columbiana (Eastern time), as YYYY-MM-DD. After the service has ended, it is the following Sunday.
export function nextSunday(now = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23', weekday: 'short' }).formatToParts(now).map(x => [x.type, x.value]));
  const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday);
  const add = dow === 0 ? (Number(p.hour) >= 12 ? 7 : 0) : 7 - dow;
  const d = new Date(Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day) + add));
  return d.toISOString().slice(0, 10);
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
    startDate: `${nextSunday()}T10:30:00`,
    endDate: `${nextSunday()}T11:45:00`,
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
    performer: { '@type': 'Organization', name: SITE.name },
    image: [abs('/og-default.png')],
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock', url: abs('/plan-your-visit') },
    isAccessibleForFree: true,
  };
}

export function podcast() {
  return {
    '@context': 'https://schema.org',
    '@type': 'PodcastSeries',
    name: `${SITE.name} Messages`,
    description: SEO.messages[1],
    url: abs('/messages'),
    publisher: { '@type': 'Church', name: SITE.name, url: abs('/') },
    sameAs: [SITE.podcasts.apple, SITE.podcasts.spotify],
  };
}

export function shinePodcast() {
  return {
    '@context': 'https://schema.org',
    '@type': 'PodcastSeries',
    name: 'The Shine Podcast',
    description: SEO.shine[1],
    url: abs('/shine'),
    publisher: { '@type': 'Church', name: SITE.name, url: abs('/') },
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
  if (key === 'faq') out.push(faqPage(VISIT_FAQ));
  if (key === 'discipleship') out.push(faqPage(DISCIPLESHIP_FAQ));
  if (key === 'sozo') out.push(faqPage(SOZO_FAQ));
  if (key === 'leadership') out.push(...leaders());
  if (key === 'messages') out.push(podcast());
  if (key === 'shine') out.push(shinePodcast());
  return out;
}
