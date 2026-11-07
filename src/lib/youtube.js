// Turns a YouTube video into the fields of a message. Titles on the channel usually look like
// "Acts :: Who Is the Gospel For? // Josh Osborn" (series :: title // speaker, with an optional date such as 7.25.2021). Anything that does
// not fit that shape keeps its whole title, and staff can edit every field after importing.

const DATE_RE = /^(\d{1,2})[./-](\d{1,2})[./-](\d{2}|\d{4})$/;

// Titles sometimes use a first name and last initial. These are the speakers they stand for.
export const SPEAKER_NAMES = {
  'chris h': 'Chris Holm',
  'josh o': 'Josh Osborn',
  'weslie b': 'Weslie Broderick',
  'jared t': 'Jared Thompson',
  'scott m': 'Scott McPeak',
};
export const fullSpeakerName = (name) => SPEAKER_NAMES[String(name || '').toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, ' ').trim()] || String(name || '').trim();

function isoDate(text) {
  const m = DATE_RE.exec(text);
  if (!m) return '';
  const month = Number(m[1]); const day = Number(m[2]);
  const year = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return '';
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function parseVideoTitle(raw) {
  const parts = String(raw || '').trim().split(/\s+\/\/\s+/);
  let date = '';
  const rest = [];
  for (const part of parts) {
    const iso = isoDate(part.trim());
    if (iso) { date = date || iso; } else rest.push(part.trim());
  }
  let speaker = '';
  if (rest.length > 1) speaker = fullSpeakerName(rest.pop());
  let title = rest.join(' // ');
  let series = '';
  const byLabel = title.split(/\s+::\s+/);
  if (byLabel.length > 1) {
    series = byLabel.shift();
    title = byLabel.join(' :: ');
  }
  return { title, speaker, series, date };
}

export function toMessage(video) {
  const { title, speaker, series, date } = parseVideoTitle(video.title);
  return {
    title: title || video.title,
    speaker,
    series,
    date: date || String(video.published || '').slice(0, 10) || null,
    description: String(video.description || '').trim().slice(0, 4000),
    video_url: `https://www.youtube.com/watch?v=${video.id}`,
  };
}

// Reads the whole channel straight from the YouTube Data API. This works from the browser, so it needs no
// server function. The key is restricted in Google Cloud to this website and to the YouTube Data API only.
export const CHANNEL_ID = 'UCQtl2NJ6-SnnsgMXpsV1K6w';
const MAX_VIDEOS = 300;

export async function fetchChannelVideos(key, fetchImpl = (...a) => fetch(...a)) {
  const playlist = `UU${CHANNEL_ID.slice(2)}`;
  const videos = [];
  let page = '';
  while (videos.length < MAX_VIDEOS) {
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    url.searchParams.set('part', 'snippet,contentDetails');
    url.searchParams.set('playlistId', playlist);
    url.searchParams.set('maxResults', '50');
    url.searchParams.set('key', key);
    if (page) url.searchParams.set('pageToken', page);
    const res = await fetchImpl(url.toString());
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const reason = body?.error?.errors?.[0]?.reason || '';
      if (/keyInvalid/i.test(reason)) throw new Error('YouTube did not accept that key. Check that it was copied whole.');
      if (/accessNotConfigured|forbidden|ipRefererBlocked/i.test(reason) || res.status === 403) {
        throw new Error('YouTube refused the key. Make sure YouTube Data API v3 is enabled and that this website’s address is allowed on the key.');
      }
      throw new Error(`YouTube answered ${res.status}.`);
    }
    for (const it of body.items ?? []) {
      const id = it.contentDetails?.videoId;
      const t = it.snippet?.title;
      if (!id || t === 'Private video' || t === 'Deleted video') continue;
      videos.push({
        id,
        title: t || '',
        description: it.snippet?.description || '',
        published: it.contentDetails?.videoPublishedAt || it.snippet?.publishedAt || '',
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      });
    }
    page = body.nextPageToken || '';
    if (!page) break;
  }
  return videos;
}
