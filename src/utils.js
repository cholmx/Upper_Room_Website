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
  const dt = new Date(d + 'T00:00:00');
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

export function slugify(s) {
  return (s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'page';
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
  if (!url || !url.includes('images.unsplash.com')) return url;
  const u = new URL(url);
  u.searchParams.set('w', String(width));
  u.searchParams.set('fm', 'webp');
  u.searchParams.set('q', '75');
  return u.toString();
}

export function imgSrcSet(url, widths = [480, 800, 1200]) {
  if (!url || !url.includes('images.unsplash.com')) return undefined;
  return widths.map(w => `${imgUrl(url, w)} ${w}w`).join(', ');
}

export { DAY };
