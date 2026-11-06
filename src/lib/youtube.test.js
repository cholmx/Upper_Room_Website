import { describe, it, expect } from 'vitest';
import { parseVideoTitle, toMessage } from './youtube';

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
