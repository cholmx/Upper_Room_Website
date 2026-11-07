import { describe, it, expect } from 'vitest';
import { parseVideoTitle, toMessage, fetchChannelVideos } from './youtube';

describe('parseVideoTitle', () => {
  it('splits passage, title and speaker', () => {
    expect(parseVideoTitle('Acts 10-11 :: Who Is the Gospel For? // Josh Osborn')).toEqual({ title: 'Who Is the Gospel For?', speaker: 'Josh Osborn', scripture: 'Acts 10-11' });
  });
  it('keeps a plain title whole', () => {
    expect(parseVideoTitle('Easter Sunday')).toEqual({ title: 'Easter Sunday', speaker: '', scripture: '' });
  });
  it('handles a speaker with no passage', () => {
    expect(parseVideoTitle('Hope Again // Chris Holm')).toEqual({ title: 'Hope Again', speaker: 'Chris Holm', scripture: '' });
  });
});

describe('toMessage', () => {
  it('builds a message from a video', () => {
    const m = toMessage({ id: 'abc123DEF45', title: 'Acts 1 :: Wait // Kate Holm', published: '2026-11-04T15:36:05+00:00', description: ' Hello ' });
    expect(m).toEqual({ title: 'Wait', speaker: 'Kate Holm', scripture: 'Acts 1', date: '2026-11-04', description: 'Hello', video_url: 'https://www.youtube.com/watch?v=abc123DEF45' });
  });
});

describe('fetchChannelVideos', () => {
  const item = (id, title) => ({ contentDetails: { videoId: id, videoPublishedAt: '2026-01-02T00:00:00Z' }, snippet: { title, description: 'd' } });
  it('follows pages and skips private videos', async () => {
    const pages = [
      { items: [item('a'.repeat(11), 'One'), item('b'.repeat(11), 'Private video')], nextPageToken: 'p2' },
      { items: [item('c'.repeat(11), 'Three')] },
    ];
    let n = 0;
    const urls = [];
    const fake = async (u) => { urls.push(u); return { ok: true, status: 200, json: async () => pages[n++] }; };
    const out = await fetchChannelVideos('KEY', fake);
    expect(out.map(v => v.title)).toEqual(['One', 'Three']);
    expect(urls[0]).toContain('playlistId=UUQtl2NJ6-SnnsgMXpsV1K6w');
    expect(urls[1]).toContain('pageToken=p2');
  });
  it('explains a refused key', async () => {
    const fake = async () => ({ ok: false, status: 403, json: async () => ({ error: { errors: [{ reason: 'accessNotConfigured' }] } }) });
    await expect(fetchChannelVideos('KEY', fake)).rejects.toThrow(/YouTube Data API v3 is enabled/);
  });
});
