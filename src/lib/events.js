// Works out when each event happens next. Events come from urf.life, which stores one date plus how often it repeats.

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const WEEKS = { first: 1, second: 2, third: 3, fourth: 4, last: -1 };

// A date with no time of day, from "2026-11-15".
export function parseDay(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s || ''));
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}

export const startOfToday = (now = new Date()) => new Date(now.getFullYear(), now.getMonth(), now.getDate());

// The date of the nth weekday of a month (n of -1 means the last one), or null.
function nthWeekday(year, month, weekday, n) {
  if (n === -1) {
    const last = new Date(year, month + 1, 0);
    last.setDate(last.getDate() - ((last.getDay() - weekday + 7) % 7));
    return last;
  }
  const first = new Date(year, month, 1);
  const d = new Date(year, month, 1 + ((weekday - first.getDay() + 7) % 7) + (n - 1) * 7);
  return d.getMonth() === month ? d : null;
}

// The next date this event happens on or after today, or null when it is over.
export function nextOccurrence(ev, today = startOfToday()) {
  const start = parseDay(ev.event_date);
  const end = parseDay(ev.recurrence_end);
  const from = start && start > today ? start : today;
  const type = ev.is_recurring ? ev.recurrence_type : 'one_time';
  let found = null;

  if (type === 'weekly') {
    const wd = DAYS.indexOf(String(ev.recurrence_day || '').toLowerCase());
    if (wd >= 0) { found = new Date(from); found.setDate(found.getDate() + ((wd - found.getDay() + 7) % 7)); }
  } else if (type === 'monthly') {
    const wd = DAYS.indexOf(String(ev.recurrence_day || '').toLowerCase());
    const n = WEEKS[String(ev.recurrence_week || '').toLowerCase()];
    if (wd >= 0 && n) {
      for (let i = 0; i < 14 && !found; i += 1) {
        const d = nthWeekday(from.getFullYear(), from.getMonth() + i, wd, n);
        if (d && d >= from) found = d;
      }
    }
  } else if (type === 'date_range') {
    // Running now counts as today.
    if (!end || end >= today) found = start && start > today ? start : today;
  } else if (start && start >= today) {
    found = start;
  }
  if (found && end && found > end) return null;
  return found;
}

// "5:00 PM" from "17:00". Times between midnight and 6 AM are almost always a mistake in the source, so they are left out.
export function formatTime(t) {
  const m = /^(\d{1,2}):(\d{2})/.exec(String(t || ''));
  if (!m) return '';
  const h = Number(m[1]);
  if (h < 6) return '';
  return `${h % 12 || 12}:${m[2]} ${h >= 12 ? 'PM' : 'AM'}`;
}

export function timeRange(ev) {
  const a = formatTime(ev.event_time);
  if (!a) return '';
  const endsLater = ev.end_time && ev.end_time > ev.event_time && ev.recurrence_type !== 'date_range';
  const b = endsLater ? formatTime(ev.end_time) : '';
  return b ? `${a} to ${b}` : a;
}

// The label for how often it happens, with the source's dash written out as "to".
export const frequencyLabel = (ev) => String(ev.recurrence_label || '').replace(/\s*[\u2013\u2014]\s*/g, ' to ');

// Which group an event belongs to, for the filter buttons.
export const groupOf = (ev) => ev.ministry || (ev.scope === 'whole_church' ? 'Whole church' : 'Ministry events');

// Text from urf.life with dashes written as commas, to match the rest of this site.
export const plain = (s) => String(s || '').replace(/\s*[\u2013\u2014]\s*/g, ', ');

// Upcoming events with their next date, soonest first.
export function upcoming(events, today = startOfToday()) {
  return (events || [])
    .map(ev => ({ ev, date: nextOccurrence(ev, today) }))
    .filter(x => x.date)
    .sort((a, b) => a.date - b.date || String(a.ev.title).localeCompare(String(b.ev.title)));
}
