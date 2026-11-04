import { describe, it, expect } from 'vitest';
import { canRunImmersive } from './lib/immersive';

describe('canRunImmersive', () => {
  it('runs by default', () => expect(canRunImmersive({})).toBe(true));
  it('respects reduced motion', () => expect(canRunImmersive({ reducedMotion: true })).toBe(false));
  it('respects data saver', () => expect(canRunImmersive({ saveData: true })).toBe(false));
  it('skips very small devices', () => {
    expect(canRunImmersive({ deviceMemory: 1 })).toBe(false);
    expect(canRunImmersive({ cores: 2 })).toBe(false);
    expect(canRunImmersive({ deviceMemory: 8, cores: 8 })).toBe(true);
  });
});
