// Lists the videos on the church's YouTube channel for the admin "Import from YouTube" screen.
//
// Only signed-in staff can call it, and it only ever reads this one channel, so it cannot be used as an open proxy.
// Without a key it reads the channel's public feed, which holds the 15 newest videos.
// To import older videos too, add a YouTube Data API key as the secret YOUTUBE_API_KEY.

const CHANNEL_ID = 'UCQtl2NJ6-SnnsgMXpsV1K6w';
const MAX_VIDEOS = 300;
const VERSION = '2026-11-07';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const decode = (s: string) =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

const tag = (xml: string, name: string) => {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? decode(m[1].trim()) : '';
};

async function fromFeed() {
  const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`);
  if (!res.ok) throw new Error(`The YouTube feed answered ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => {
    const e = m[1];
    const id = tag(e, 'yt:videoId');
    return {
      id,
      title: tag(e, 'title'),
      description: tag(e, 'media:description'),
      published: tag(e, 'published'),
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  });
}

async function fromApi(key: string) {
  const playlist = 'UU' + CHANNEL_ID.slice(2);
  const videos: unknown[] = [];
  let page = '';
  while (videos.length < MAX_VIDEOS) {
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    url.searchParams.set('part', 'snippet,contentDetails');
    url.searchParams.set('playlistId', playlist);
    url.searchParams.set('maxResults', '50');
    url.searchParams.set('key', key);
    if (page) url.searchParams.set('pageToken', page);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`The YouTube API answered ${res.status}`);
    const body = await res.json();
    for (const it of body.items ?? []) {
      const id = it.contentDetails?.videoId;
      if (!id || it.snippet?.title === 'Private video' || it.snippet?.title === 'Deleted video') continue;
      videos.push({
        id,
        title: it.snippet?.title ?? '',
        description: it.snippet?.description ?? '',
        published: it.contentDetails?.videoPublishedAt ?? it.snippet?.publishedAt ?? '',
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      });
    }
    page = body.nextPageToken ?? '';
    if (!page) break;
  }
  return videos;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });

  // A quick check that the function is deployed. It shares nothing about the channel.
  if (new URL(req.url).searchParams.has('ping')) return json({ ok: true, version: VERSION });

  // Only a signed-in user may call this.
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const base = Deno.env.get('SUPABASE_URL');
  const anon = Deno.env.get('SUPABASE_ANON_KEY');
  if (!token || !base || !anon) return json({ error: 'Please sign in.' }, 401);
  const who = await fetch(`${base}/auth/v1/user`, { headers: { apikey: anon, Authorization: `Bearer ${token}` } });
  if (!who.ok) return json({ error: 'Please sign in.' }, 401);

  try {
    const key = Deno.env.get('YOUTUBE_API_KEY');
    const videos = key ? await fromApi(key) : await fromFeed();
    return json({ source: key ? 'api' : 'feed', videos });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Could not read the channel.' }, 502);
  }
});
