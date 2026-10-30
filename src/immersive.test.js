import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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

describe('the bundled 3D model', () => {
  const buf = readFileSync(resolve(process.cwd(), 'public/models/sanctuary-expansion.glb'));
  it('is a valid glTF binary', () => {
    expect(buf.readUInt32LE(0)).toBe(0x46546c67);
    expect(buf.readUInt32LE(4)).toBe(2);
    expect(buf.readUInt32LE(8)).toBe(buf.length);
    const jsonLen = buf.readUInt32LE(12);
    const json = JSON.parse(buf.subarray(20, 20 + jsonLen).toString('utf8'));
    expect(json.asset.version).toBe('2.0');
    expect(json.meshes.length).toBeGreaterThan(0);
    for (const m of json.materials) expect(m.pbrMetallicRoughness.baseColorFactor).toHaveLength(4);
    const binStart = 20 + jsonLen + 8;
    expect(json.buffers[0].byteLength).toBe(buf.length - binStart);
  });
  it('stays small enough for a phone', () => expect(buf.length).toBeLessThan(200 * 1024));
});
