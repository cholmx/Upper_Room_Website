import { describe, it, expect } from 'vitest';
import { parseVideoTitle, toMessage, fetchChannelVideos, fullSpeakerName, splitDescription } from './youtube';

describe('parseVideoTitle', () => {
  it('splits series, title and speaker', () => {
    expect(parseVideoTitle('Pursuit :: Handing Out The Spoils // Chris Holm')).toEqual({ title: 'Handing Out The Spoils', speaker: 'Chris Holm', series: 'Pursuit', date: '' });
  });
  it('always reads the first part as the series', () => {
    expect(parseVideoTitle('Acts 10-11 :: Who Is the Gospel For? // Josh Osborn')).toEqual({ title: 'Who Is the Gospel For?', speaker: 'Josh Osborn', series: 'Acts 10-11', date: '' });
  });
  it('keeps a plain title whole', () => {
    expect(parseVideoTitle('Easter Sunday')).toEqual({ title: 'Easter Sunday', speaker: '', series: '', date: '' });
  });
  it('takes a date out of the speaker spot and uses it as the date', () => {
    expect(parseVideoTitle("It's God's, Not Mine // Bob Bertelsen // 7.25.2021")).toEqual({ title: "It's God's, Not Mine", speaker: 'Bob Bertelsen', series: '', date: '2021-07-25' });
    expect(parseVideoTitle('Hope // 9.5.21')).toMatchObject({ title: 'Hope', speaker: '', date: '2021-09-05' });
  });
});

describe('splitDescription', () => {
  it('pulls out the summary and the discussion questions', () => {
    const text = 'Sermon Summary\nGod sends Peter to Cornelius.\nIt changes everything.\n\nDiscussion Questions\n1. Who is the Gospel for?\n2. What stretches you?\n';
    expect(splitDescription(text)).toEqual({ summary: 'God sends Peter to Cornelius.\nIt changes everything.', questions: '1. Who is the Gospel for?\n2. What stretches you?' });
  });
  it('allows colons and either order', () => {
    expect(splitDescription('Discussion Questions:\n1. One\nSermon Summary:\nShort')).toEqual({ summary: 'Short', questions: '1. One' });
  });
  it('uses the whole description as the summary when there are no headings', () => {
    expect(splitDescription(' Just a note ')).toEqual({ summary: 'Just a note', questions: '' });
  });
});

describe('fullSpeakerName', () => {
  it('spells out first name and last initial', () => {
    expect(fullSpeakerName('Chris H.')).toBe('Chris Holm');
    expect(fullSpeakerName('Josh O.')).toBe('Josh Osborn');
    expect(fullSpeakerName('Weslie B.')).toBe('Weslie Broderick');
    expect(fullSpeakerName('Jared T.')).toBe('Jared Thompson');
    expect(fullSpeakerName('Scott M')).toBe('Scott McPeak');
  });
  it('leaves other names alone', () => {
    expect(fullSpeakerName('Beth S.')).toBe('Beth S.');
    expect(fullSpeakerName('Bob Bertelsen')).toBe('Bob Bertelsen');
  });
  it('is applied when reading a title', () => {
    expect(parseVideoTitle('Joy // Chris H. // 8.8.2021').speaker).toBe('Chris Holm');
  });
});

describe('toMessage', () => {
  it('builds a message from a video', () => {
    const m = toMessage({ id: 'abc123DEF45', title: 'Acts 1 :: Wait // Kate Holm', published: '2026-11-04T15:36:05+00:00', description: ' Hello ' });
    expect(m).toEqual({ title: 'Wait', speaker: 'Kate Holm', series: 'Acts 1', date: '2026-11-04', description: 'Hello', discussion_questions: '', video_url: 'https://www.youtube.com/watch?v=abc123DEF45' });
  });
  it('prefers the date in the title over the upload date', () => {
    expect(toMessage({ id: 'x'.repeat(11), title: 'Joy // Chris Holm // 8.8.2021', published: '2022-01-01T00:00:00Z' }).date).toBe('2021-08-08');
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
