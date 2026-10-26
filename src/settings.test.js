import { describe, it, expect } from 'vitest';
import { mergeSettings } from './settings';
import { SITE } from './config';

describe('mergeSettings', () => {
  it('returns defaults without a saved row', () => {
    expect(mergeSettings(null)).toBe(SITE);
  });
  it('overrides defaults and rebuilds derived links', () => {
    const s = mergeSettings({ street: '1 Main St', city: 'Salem', region: 'OH', postal_code: '44460', phone: '(330) 555-1212', service_time: 'Sundays at 9 AM' });
    expect(s.addressLine).toBe('1 Main St, Salem, OH 44460');
    expect(s.googleMapsUrl).toContain('1%20Main%20St');
    expect(s.phoneHref).toBe('tel:3305551212');
    expect(s.mapEmbedUrl).toBe('https://www.google.com/maps?q=1%20Main%20St%20Salem%20OH%2044460&output=embed');
    expect(s.serviceTime).toBe('Sundays at 9 AM');
  });
  it('keeps defaults for blank fields', () => {
    expect(mergeSettings({ street: '', phone: '' }).addressLine).toBe(SITE.addressLine);
  });
});
