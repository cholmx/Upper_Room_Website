export function ytId(url) {
  if (!url) return null;
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export function ytThumb(id) {
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
}

export function formatDate(d) {
  if (!d) return '';
  const day = String(d).slice(0, 10);
  const dt = new Date(day + 'T00:00:00');
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

export function slugify(s) {
  return (s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'page';
}

// Only http(s) addresses may reach an href or a src. Anything else (javascript:,
// data:, vbscript:) is dropped, so stored content can never run as code.
export function safeUrl(url) {
  const v = String(url || '').trim();
  if (!v) return '';
  try {
    const u = new URL(v, 'https://example.invalid');
    return u.protocol === 'http:' || u.protocol === 'https:' ? v : '';
  } catch {
    return '';
  }
}

export function stripHtml(s) {
  return (s || '').replace(/<[^>]*>?/gm, '');
}

// Returns a YouTube embed URL for watch/short/embed links, or null.
export function ytEmbed(url) {
  const id = ytId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

// Draft / schedule support. Rows created before the `published` column existed
// have no value and are treated as live.
export function isLive(item, today = new Date().toISOString().slice(0, 10)) {
  if (!item) return false;
  if (item.published === false || item.published === 0 || item.published === '0' || item.published === 'false') return false;
  const when = item.publish_date;
  return !when || String(when).slice(0, 10) <= today;
}

const DAY = 86400000;

function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function addMonths(iso, n) {
  const d = new Date(iso + 'T00:00:00');
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0, 10);
}

// Expands recurring events into dated occurrences from `from` through `horizonDays`
// and drops one-off events that already happened. Result is sorted by date.
export function expandEvents(events, from = new Date().toISOString().slice(0, 10), horizonDays = 120) {
  const end = addDays(from, horizonDays);
  const out = [];
  for (const ev of events) {
    const start = String(ev.date || '').slice(0, 10);
    if (!start) continue;
    const rule = ev.recurrence || 'none';
    if (rule === 'none' || !rule) {
      if (start >= from) out.push({ ...ev, occurrence_date: start });
      continue;
    }
    let cur = start;
    let i = 0;
    let guard = 0;
    while (cur <= end && guard++ < 1000) {
      if (cur >= from) out.push({ ...ev, occurrence_date: cur });
      i += 1;
      if (rule === 'weekly') cur = addDays(start, 7 * i);
      else if (rule === 'biweekly') cur = addDays(start, 14 * i);
      else if (rule === 'monthly') cur = addMonths(start, i);
      else break;
    }
  }
  return out.sort((a, b) => a.occurrence_date.localeCompare(b.occurrence_date));
}

function icsEscape(s) {
  return String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

function icsDate(iso) {
  return iso.replace(/-/g, '');
}

export function buildIcs(ev, siteName = 'Upper Room Fellowship') {
  const date = String(ev.occurrence_date || ev.date || '').slice(0, 10);
  if (!date) return '';
  const rule = { weekly: 'FREQ=WEEKLY', biweekly: 'FREQ=WEEKLY;INTERVAL=2', monthly: 'FREQ=MONTHLY' }[ev.recurrence];
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${siteName}//Events//EN`,
    'BEGIN:VEVENT',
    `UID:event-${ev.id ?? date}-${date}@urfellowship`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')}`,
    `DTSTART;VALUE=DATE:${icsDate(date)}`,
    `DTEND;VALUE=DATE:${icsDate(addDays(date, 1))}`,
    `SUMMARY:${icsEscape(ev.title)}`,
    `DESCRIPTION:${icsEscape([ev.time && `Time: ${ev.time}`, ev.description || ev.desc_text].filter(Boolean).join('\n'))}`,
    `LOCATION:${icsEscape(ev.location)}`,
    ...(rule ? [`RRULE:${rule}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

export function downloadIcs(ev) {
  const blob = new Blob([buildIcs(ev)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slugify(ev.title)}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Resizes / converts Unsplash URLs; other hosts pass through unchanged.
export function imgUrl(url, width = 1600) {
  const safe = safeUrl(url);
  if (!safe) return '';
  if (!safe.includes('images.unsplash.com')) return safe;
  const u = new URL(safe);
  u.searchParams.set('w', String(width));
  u.searchParams.set('fm', 'webp');
  u.searchParams.set('q', '75');
  return u.toString();
}

export function imgSrcSet(url, widths = [480, 800, 1200]) {
  if (!safeUrl(url) || !url.includes('images.unsplash.com')) return undefined;
  return widths.map(w => `${imgUrl(url, w)} ${w}w`).join(', ');
}

export { DAY };


export const HOME_SECTION_DEFAULTS = ['campaign', 'story', 'statement', 'wherewhen', 'features', 'nextsteps', 'latestposts', 'gallery', 'photosections'];

// Keeps the order staff saved, but slots in sections added later (so a new section shows up)
// at their default position, just before the next default section that is already placed.
export function mergeSectionOrder(saved, defaults = HOME_SECTION_DEFAULTS) {
  const known = [...new Set((saved || []).filter(k => defaults.includes(k)))];
  if (known.length === 0) return [...defaults];
  const out = [...known];
  defaults.forEach((key, i) => {
    if (out.includes(key)) return;
    const next = defaults.slice(i + 1).find(k => out.includes(k));
    if (next) out.splice(out.indexOf(next), 0, key);
    else out.push(key);
  });
  return out;
}

// Message (sermon) URLs: /messages/12-the-upper-room. The id keeps lookups exact and the
// words make the address readable.
export function messagePath(sermon) {
  return `/messages/${sermon.id}-${slugify(sermon.title)}`;
}

export function parseMessageId(param) {
  const m = String(param || '').match(/^(\d+)/);
  return m ? m[1] : null;
}

export function seriesPath(name) {
  return `/messages/series/${slugify(name)}`;
}

// "1 John 2:1-6" -> "1 John", "Psalm 23" -> "Psalm"
export function scriptureBook(ref) {
  const m = String(ref || '').trim().match(/^((?:[1-3]\s)?[A-Za-z]+(?:\s[A-Za-z]+)*?)\s+\d/);
  return m ? m[1] : '';
}

// Groups messages into series with a count, a date range, and the first cover image found.
export function groupSeries(messages) {
  const map = new Map();
  for (const m of messages) {
    const name = (m.series || '').trim();
    if (!name) continue;
    const entry = map.get(name) || { name, slug: slugify(name), count: 0, first: null, last: null, image: '' };
    entry.count += 1;
    const d = String(m.date || m.created_at || '').slice(0, 10);
    if (d) {
      if (!entry.first || d < entry.first) entry.first = d;
      if (!entry.last || d > entry.last) entry.last = d;
    }
    if (!entry.image && safeUrl(m.series_image_url)) entry.image = safeUrl(m.series_image_url);
    map.set(name, entry);
  }
  return [...map.values()].sort((a, b) => String(b.last || '').localeCompare(String(a.last || '')));
}

export function dateRangeLabel(first, last) {
  if (!first) return '';
  const fmt = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  return first.slice(0, 7) === (last || first).slice(0, 7) ? fmt(first) : `${fmt(first)} to ${fmt(last)}`;
}
