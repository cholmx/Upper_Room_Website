import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

const rows = [
  { id: 1, published: 1, sort_order_num: 1, layout: 'centered', tone: 'white', title: 'Easter service', body: 'Join us.', button_label: 'Plan your visit', button_url: '/plan-your-visit' },
  { id: 2, published: 0, sort_order_num: 2, layout: 'banner', tone: 'ink', title: 'Hidden layout' },
  { id: 3, published: 1, sort_order_num: 3, layout: 'banner', tone: 'white', title: 'Second layout', button_label: 'Go', button_url: 'https://example.com' },
];
vi.mock('../hooks/useFetch', () => ({ default: () => ({ data: rows }) }));

import Spotlights from './Spotlights';

describe('Spotlights', () => {
  it('shows only layouts that are on, in order', () => {
    const html = renderToStaticMarkup(<MemoryRouter><Spotlights /></MemoryRouter>);
    expect(html).toContain('Easter service');
    expect(html).toContain('Second layout');
    expect(html).not.toContain('Hidden layout');
    expect(html.indexOf('Easter service')).toBeLessThan(html.indexOf('Second layout'));
    expect(html).toContain('href="/plan-your-visit"');
  });
});
