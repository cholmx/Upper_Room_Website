import { describe, it, expect } from 'vitest';
import { cleanTranscript, matchMessage } from './transcript';

describe('cleanTranscript', () => {
  it('removes SRT numbers and timings', () => {
    const out = cleanTranscript('1\n00:00:01,000 --> 00:00:03,000\nHello there.\n\n2\n00:00:03,000 --> 00:00:05,000\nWelcome to church.');
    expect(out).toBe('Hello there. Welcome to church.');
  });
  it('removes VTT headers and leading timestamps', () => {
    expect(cleanTranscript('WEBVTT\n\n0:05 Good morning\n0:09 everyone')).toBe('Good morning everyone');
  });
});

describe('matchMessage', () => {
  const msgs = [{ id: 1, title: 'Who Is the Gospel For?', v: 'abcdefghijk' }, { id: 2, title: 'Do It Again', v: 'XYZ12345678' }];
  const idOf = m => m.v;
  it('matches by video id in the name', () => expect(matchMessage('sermon-XYZ12345678.txt', msgs, idOf)?.id).toBe(2));
  it('matches by title', () => expect(matchMessage('Who is the Gospel for.srt', msgs, idOf)?.id).toBe(1));
  it('returns null when nothing fits', () => expect(matchMessage('random.txt', msgs, idOf)).toBeNull());
});
