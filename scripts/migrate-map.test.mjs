import { describe, it, expect } from 'vitest';
import { mapRow, orderRows, TABLES } from './migrate-map.mjs';

describe('mapRow', () => {
  it('keeps only known columns and drops ids', () => {
    expect(mapRow('posts', { id: 4, title: 'A', body: 'B', user_id: 'admin', junk: 1 })).toEqual({ title: 'A', body: 'B' });
  });
  it('maps legacy sermon and event field names', () => {
    expect(mapRow('sermons', { title: 'T', yt: 'https://youtu.be/abcdefghijk' }).video_url).toBe('https://youtu.be/abcdefghijk');
    expect(mapRow('sermons', { title: 'T', yt: 'old', video_url: 'new' }).video_url).toBe('new');
    expect(mapRow('events_church', { title: 'E', description: 'D' }).desc_text).toBe('D');
  });
  it('turns blank dates into null and drops blank numbers', () => {
    const r = mapRow('events_church', { title: 'E', date: '', publish_date: '', recurrence: 'none' });
    expect(r.date).toBeNull();
    expect(r.publish_date).toBeNull();
    expect(mapRow('gallery_church', { image_url: 'x', sort_order_num: '' })).toEqual({ image_url: 'x' });
    expect(mapRow('gallery_church', { image_url: 'x', sort_order_num: '3' }).sort_order_num).toBe(3);
  });
  it('keeps the original creation time', () => {
    expect(mapRow('posts', { title: 'A', created_at: '2024-05-01T10:00:00Z' }).created_at).toBe('2024-05-01T10:00:00Z');
  });
  it('rejects unknown tables', () => {
    expect(() => mapRow('nope', {})).toThrow();
    expect(Object.keys(TABLES)).toContain('sermons');
  });
});

describe('orderRows', () => {
  it('sorts oldest first and breaks ties by id', () => {
    const rows = [{ id: 3, created_at: 'b' }, { id: 2, created_at: 'a' }, { id: 1, created_at: 'b' }];
    expect(orderRows(rows).map(r => r.id)).toEqual([2, 1, 3]);
  });
});
