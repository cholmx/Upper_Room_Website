// A short line about when the next Sunday service is, worked out in the church's own time zone.
// Worship starts Sundays at 10:30am and lasts about an hour and a quarter.

const START = 10 * 60 + 30;
const END = START + 75;
const DAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export function worshipLine(now = new Date(), timeZone = 'America/New_York') {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(now);
  const get = (t) => parts.find(p => p.type === t)?.value;
  const day = DAYS[get('weekday')];
  const minutes = Number(get('hour')) * 60 + Number(get('minute'));
  if (day === 0 && minutes >= START && minutes < END) return 'Worship is happening right now';
  if (day === 0 && minutes < START) return 'Worship starts today at 10:30am';
  const until = day === 0 ? 7 : 7 - day;
  if (until === 1) return 'Worship is tomorrow at 10:30am';
  return `Worship is in ${until} days, Sunday at 10:30am`;
}
