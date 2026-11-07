// Tags are kept as one text value separated by commas, for example "Prayer, Family".

export function parseTags(text) {
  const seen = new Set();
  const out = [];
  for (const raw of String(text || '').split(',')) {
    const tag = raw.trim().replace(/\s+/g, ' ');
    const key = tag.toLowerCase();
    if (tag && !seen.has(key)) { seen.add(key); out.push(tag); }
  }
  return out;
}

export const joinTags = (list) => list.join(', ');

export function addTag(text, tag) {
  return joinTags(parseTags(`${text || ''},${tag}`));
}

export function removeTag(text, tag) {
  const key = String(tag || '').trim().toLowerCase();
  return joinTags(parseTags(text).filter(t => t.toLowerCase() !== key));
}
