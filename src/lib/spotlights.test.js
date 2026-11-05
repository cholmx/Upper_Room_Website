import { describe, it, expect } from 'vitest';
import { activeSpotlights } from './spotlights';

const row = (o) => ({ title: 'T', published: 1, sort_order_num: 0, ...o });

describe('activeSpotlights', () => {
  const today = '2026-11-05';
  it('keeps only layouts that are turned on', () => {
    const out = activeSpotlights([row({ id: 1 }), row({ id: 2, published: 0 })], today);
    expect(out.map(r => r.id)).toEqual([1]);
  });
  it('respects start and end days', () => {
    const out = activeSpotlights([
      row({ id: 1, publish_date: '2026-11-06' }),
      row({ id: 2, end_date: '2026-11-04' }),
      row({ id: 3, publish_date: '2026-11-05', end_date: '2026-11-05' }),
    ], today);
    expect(out.map(r => r.id)).toEqual([3]);
  });
  it('orders by sort_order_num and skips empty layouts', () => {
    const out = activeSpotlights([row({ id: 1, sort_order_num: 2 }), row({ id: 2, sort_order_num: 1 }), { id: 3, published: 1 }], today);
    expect(out.map(r => r.id)).toEqual([2, 1]);
  });
  it('handles no data', () => {
    expect(activeSpotlights(null, today)).toEqual([]);
  });
});
