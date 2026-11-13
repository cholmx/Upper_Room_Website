// Finds the podcast episode that goes with a message. The episode titles on the sermon podcast look like
// "Acts 10-11 :: Who Is the Gospel For? // Josh Osborn", and the message title on the site is "Who Is the Gospel For?".

export const normalize = (s) => String(s || '')
  .normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[‘’“”'"`]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

// The part of an episode title between "::" and "//", when it is written that way.
export function coreTitle(title) {
  const t = String(title || '');
  const m = /::\s*(.+?)\s*(?:\/\/|$)/.exec(t);
  return m ? m[1] : t.replace(/\s*\/\/.*$/, '');
}

const DAY = 86400000;
const time = (d) => { const n = d ? new Date(d).getTime() : NaN; return Number.isNaN(n) ? null : n; };

// The best matching episode for a message, or null. A whole-title match wins. A partial match (one title inside the other)
// has to be at least 8 characters and within three weeks of the message date, so it cannot pick a different message.
export function findEpisode(message, episodes) {
  const want = normalize(message && message.title);
  if (!want || !Array.isArray(episodes)) return null;
  const when = time(message.date);
  let best = null;
  for (const ep of episodes) {
    const names = [normalize(coreTitle(ep.title)), normalize(ep.title)].filter(Boolean);
    let score = 0;
    if (names.includes(want)) score = 2;
    else if (want.length >= 8 && names.some(n => n.length >= 8 && (n.includes(want) || want.includes(n)))) score = 1;
    if (!score) continue;
    const t = time(ep.published_at);
    const gap = when !== null && t !== null ? Math.abs(t - when) : null;
    if (score === 1 && (gap === null || gap > 21 * DAY)) continue;
    const rank = [score, gap === null ? -Infinity : -gap];
    if (!best || rank[0] > best.rank[0] || (rank[0] === best.rank[0] && rank[1] > best.rank[1])) best = { ep, rank };
  }
  return best ? best.ep : null;
}
