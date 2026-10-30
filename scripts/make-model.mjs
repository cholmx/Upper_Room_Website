// Writes public/models/sanctuary-expansion.glb: a simple concept massing model of the building
// and the proposed expansion. It has no dependencies. Replace the file (or set the
// "Campaign 3D model" link in the admin, Site Photos) with the architect's real model when
// there is one. Run with: node scripts/make-model.mjs
import { writeFileSync, mkdirSync } from 'node:fs';

const materials = [
  { name: 'ground', pbrMetallicRoughness: { baseColorFactor: [0.07, 0.11, 0.09, 1], metallicFactor: 0, roughnessFactor: 1 } },
  { name: 'existing', pbrMetallicRoughness: { baseColorFactor: [0.93, 0.9, 0.84, 1], metallicFactor: 0, roughnessFactor: 0.9 } },
  { name: 'existing-roof', pbrMetallicRoughness: { baseColorFactor: [0.42, 0.38, 0.33, 1], metallicFactor: 0, roughnessFactor: 0.8 } },
  { name: 'expansion', pbrMetallicRoughness: { baseColorFactor: [1, 0.77, 0.31, 1], metallicFactor: 0, roughnessFactor: 0.7 } },
  { name: 'expansion-roof', pbrMetallicRoughness: { baseColorFactor: [0.8, 0.6, 0.18, 1], metallicFactor: 0, roughnessFactor: 0.7 } },
  { name: 'cross', pbrMetallicRoughness: { baseColorFactor: [0.97, 0.97, 0.95, 1], metallicFactor: 0.1, roughnessFactor: 0.5 } },
];
const M = Object.fromEntries(materials.map((m, i) => [m.name, i]));

// Each piece collects flat-shaded triangles: [position triples], normals, indices.
function piece(material) { return { material, pos: [], nor: [], idx: [] }; }
function quad(p, a, b, c, d, n) {
  const base = p.pos.length / 3;
  for (const v of [a, b, c, d]) { p.pos.push(...v); p.nor.push(...n); }
  p.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
}
function tri(p, a, b, c, n) {
  const base = p.pos.length / 3;
  for (const v of [a, b, c]) { p.pos.push(...v); p.nor.push(...n); }
  p.idx.push(base, base + 1, base + 2);
}
// Box centered on x and z, resting at y.
function box(p, cx, y, cz, w, h, d) {
  const x0 = cx - w / 2, x1 = cx + w / 2, y0 = y, y1 = y + h, z0 = cz - d / 2, z1 = cz + d / 2;
  quad(p, [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1]);
  quad(p, [x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1]);
  quad(p, [x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0]);
  quad(p, [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0]);
  quad(p, [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [0, 1, 0]);
  quad(p, [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0]);
}
// Gable roof running along x, ridge at height rise.
function gable(p, cx, y, cz, w, rise, d, overhang = 0.4) {
  const x0 = cx - w / 2 - overhang, x1 = cx + w / 2 + overhang, z0 = cz - d / 2 - overhang, z1 = cz + d / 2 + overhang;
  const zm = cz, yt = y + rise;
  const len = Math.hypot(rise, d / 2 + overhang);
  const nz = rise / len, ny = (d / 2 + overhang) / len;
  quad(p, [x0, y, z1], [x1, y, z1], [x1, yt, zm], [x0, yt, zm], [0, ny, nz]);
  quad(p, [x1, y, z0], [x0, y, z0], [x0, yt, zm], [x1, yt, zm], [0, ny, -nz]);
  tri(p, [x0, y, z0], [x0, y, z1], [x0, yt, zm], [-1, 0, 0]);
  tri(p, [x1, y, z1], [x1, y, z0], [x1, yt, zm], [1, 0, 0]);
  quad(p, [x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1], [0, -1, 0]);
}

const ground = piece(M.ground), existing = piece(M.existing), existingRoof = piece(M['existing-roof']);
const expansion = piece(M.expansion), expansionRoof = piece(M['expansion-roof']), cross = piece(M.cross);

box(ground, 0, -0.3, 2, 64, 0.3, 46);
// Existing: sanctuary, a lower wing to the left, and a lobby.
box(existing, 0, 0, -4, 26, 8, 20);
gable(existingRoof, 0, 8, -4, 26, 4.5, 20);
box(existing, -19, 0, -2, 12, 5, 16);
gable(existingRoof, -19, 5, -2, 12, 2.5, 16, 0.3);
box(existing, 0, 0, 8.5, 10, 5, 5);
// Expansion: a gathering space across the front and a wing to the right.
box(expansion, 17.5, 0, 0, 14, 7, 20);
gable(expansionRoof, 17.5, 7, 0, 14, 4, 20);
box(expansion, 0, 0, 15, 26, 7, 8);
gable(expansionRoof, 0, 7, 15, 26, 3.5, 8, 0.3);
// A cross on the sanctuary gable.
box(cross, 0, 12.5, 6.2, 0.5, 4.2, 0.5);
box(cross, 0, 15, 6.2, 2.4, 0.5, 0.5);

const pieces = [ground, existing, existingRoof, expansion, expansionRoof, cross];
const names = ['Grounds', 'Existing building', 'Existing roof', 'Proposed expansion', 'Proposed expansion roof', 'Cross'];

const chunks = [];
let offset = 0;
const bufferViews = [], accessors = [], meshes = [], nodes = [];
const push = (buf, target) => {
  const pad = (4 - (buf.length % 4)) % 4;
  const padded = Buffer.concat([buf, Buffer.alloc(pad)]);
  bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: buf.length, ...(target ? { target } : {}) });
  chunks.push(padded);
  offset += padded.length;
  return bufferViews.length - 1;
};
pieces.forEach((p, i) => {
  const pos = new Float32Array(p.pos), nor = new Float32Array(p.nor), idx = new Uint16Array(p.idx);
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let k = 0; k < pos.length; k += 3) for (let a = 0; a < 3; a++) { min[a] = Math.min(min[a], pos[k + a]); max[a] = Math.max(max[a], pos[k + a]); }
  const bvPos = push(Buffer.from(pos.buffer), 34962);
  const bvNor = push(Buffer.from(nor.buffer), 34962);
  const bvIdx = push(Buffer.from(idx.buffer), 34963);
  const aPos = accessors.push({ bufferView: bvPos, componentType: 5126, count: pos.length / 3, type: 'VEC3', min, max }) - 1;
  const aNor = accessors.push({ bufferView: bvNor, componentType: 5126, count: nor.length / 3, type: 'VEC3' }) - 1;
  const aIdx = accessors.push({ bufferView: bvIdx, componentType: 5123, count: idx.length, type: 'SCALAR' }) - 1;
  meshes.push({ name: names[i], primitives: [{ attributes: { POSITION: aPos, NORMAL: aNor }, indices: aIdx, material: p.material }] });
  nodes.push({ name: names[i], mesh: i });
});

const json = {
  asset: { version: '2.0', generator: 'scripts/make-model.mjs' },
  scene: 0,
  scenes: [{ name: 'Concept massing', nodes: nodes.map((_, i) => i) }],
  nodes, meshes, materials, accessors, bufferViews,
  buffers: [{ byteLength: offset }],
};
let jsonBuf = Buffer.from(JSON.stringify(json));
jsonBuf = Buffer.concat([jsonBuf, Buffer.alloc((4 - (jsonBuf.length % 4)) % 4, 0x20)]);
const bin = Buffer.concat(chunks);
const total = 12 + 8 + jsonBuf.length + 8 + bin.length;
const header = Buffer.alloc(12);
header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4); header.writeUInt32LE(total, 8);
const jh = Buffer.alloc(8); jh.writeUInt32LE(jsonBuf.length, 0); jh.writeUInt32LE(0x4e4f534a, 4);
const bh = Buffer.alloc(8); bh.writeUInt32LE(bin.length, 0); bh.writeUInt32LE(0x004e4942, 4);
mkdirSync(new URL('../public/models/', import.meta.url), { recursive: true });
writeFileSync(new URL('../public/models/sanctuary-expansion.glb', import.meta.url), Buffer.concat([header, jh, jsonBuf, bh, bin]));
console.log(`[model] wrote sanctuary-expansion.glb (${total} bytes)`);
