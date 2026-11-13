import { describe, it, expect } from 'vitest';
import { findEpisode, coreTitle, normalize } from './podcastMatch';

const eps = [
  { title: 'Acts 10-11 :: Who Is the Gospel For? // Josh Osborn', apple_url: 'https://apple/1', published_at: '2026-11-01T00:00:00Z' },
  { title: 'Acts 8-9 :: Can God Use Me? // Beth S.', apple_url: 'https://apple/2', published_at: '2026-10-26T00:41:00Z' },
  { title: 'Do It Again', apple_url: 'https://apple/3', published_at: '2026-08-30T00:00:00Z' },
  { title: 'Do It Again', apple_url: 'https://apple/4', published_at: '2024-08-30T00:00:00Z' },
  { title: 'Pursuit :: Splagchnon // Chris Holm', apple_url: 'https://apple/5', published_at: '2026-08-09T00:00:00Z' },
];

describe('matching messages to podcast episodes', () => {
  it('reads the title out of "Series :: Title // Speaker"', () => {
    expect(coreTitle(eps[0].title)).toBe('Who Is the Gospel For?');
    expect(coreTitle('Plain title')).toBe('Plain title');
  });

  it('ignores case, punctuation and curly quotes', () => {
    expect(normalize('How Does God’s Kingdom Grow?')).toBe('how does gods kingdom grow');
    expect(normalize("How does God's kingdom grow")).toBe('how does gods kingdom grow');
  });

  it('finds the episode when the titles are the same', () => {
    expect(findEpisode({ title: 'Who Is the Gospel For?', date: '2026-11-01' }, eps).apple_url).toBe('https://apple/1');
    expect(findEpisode({ title: 'can god use me', date: '2026-10-25' }, eps).apple_url).toBe('https://apple/2');
  });

  it('picks the closest date when a title repeats', () => {
    expect(findEpisode({ title: 'Do It Again', date: '2026-08-30' }, eps).apple_url).toBe('https://apple/3');
    expect(findEpisode({ title: 'Do It Again', date: '2024-09-01' }, eps).apple_url).toBe('https://apple/4');
  });

  it('matches when the episode title simply contains the message title', () => {
    expect(findEpisode({ title: 'Splagchnon', date: '2026-08-09' }, eps).apple_url).toBe('https://apple/5');
  });

  it('does not match a different message or a far-off date with a partial title', () => {
    expect(findEpisode({ title: 'Something Else Entirely', date: '2026-11-01' }, eps)).toBeNull();
    expect(findEpisode({ title: 'Pursuit Splagchnon', date: '2025-01-01' }, eps)).toBeNull();
    expect(findEpisode({ title: 'Pursuit Splagchnon', date: '2026-08-10' }, eps).apple_url).toBe('https://apple/5');
    expect(findEpisode({ title: '', date: '2026-11-01' }, eps)).toBeNull();
    expect(findEpisode({ title: 'Who Is the Gospel For?' }, null)).toBeNull();
  });
});

describe('episode titles', () => {
  it('splits series, title and speaker', async () => {
    const { parseEpisodeTitle } = await import('./podcastMatch');
    expect(parseEpisodeTitle('Acts 10-11 :: Who Is the Gospel For? // Josh Osborn')).toEqual({ series: 'Acts 10-11', title: 'Who Is the Gospel For?', speaker: 'Josh Osborn' });
    expect(parseEpisodeTitle('Title // Speaker')).toEqual({ series: '', title: 'Title', speaker: 'Speaker' });
    expect(parseEpisodeTitle('Do It Again')).toEqual({ series: '', title: 'Do It Again', speaker: '' });
  });
});
