// Turns a transcript file (plain text, SRT, VTT or YouTube's copied text) into readable paragraphs.
export function cleanTranscript(raw) {
  const lines = String(raw || '').replace(/\r/g, '').split('\n');
  const out = [];
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    if (/^WEBVTT/i.test(line) || /^(NOTE|STYLE|Kind:|Language:)/.test(line)) continue;
    if (/^\d+$/.test(line)) continue; // SRT cue number
    if (/^\d{1,2}:\d{2}(:\d{2})?([.,]\d+)?\s*(-->|$)/.test(line)) continue; // cue timing or a bare timestamp line
    line = line.replace(/<[^>]+>/g, '').replace(/^\[?\d{1,2}:\d{2}(:\d{2})?\]?\s+/, '').replace(/\s+/g, ' ').trim();
    if (line) out.push(line);
  }
  const words = out.join(' ').split(' ').filter(Boolean);
  // Paragraph about every 110 words, ending at the next sentence end when there is one nearby.
  const paras = [];
  let cur = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length >= 110 && /[.?!]["')]?$/.test(w)) { paras.push(cur.join(' ')); cur = []; } else if (cur.length >= 170) { paras.push(cur.join(' ')); cur = []; }
  }
  if (cur.length) paras.push(cur.join(' '));
  return paras.join('\n\n');
}

const norm = (s) => String(s || '').toLowerCase().replace(/\.[a-z0-9]{2,4}$/, '').replace(/[^a-z0-9]+/g, ' ').trim();

// Finds the message a file belongs to: by the 11-character YouTube id in the name, then by the title.
export function matchMessage(fileName, messages, idOf) {
  const name = String(fileName || '');
  const byId = messages.find(m => { const id = idOf(m); return id && name.includes(id); });
  if (byId) return byId;
  const n = norm(name);
  if (!n) return null;
  const exact = messages.filter(m => norm(m.title) === n);
  if (exact.length === 1) return exact[0];
  const within = messages.filter(m => { const t = norm(m.title); return t.length >= 6 && (n.includes(t) || t.includes(n)); });
  if (within.length === 1) return within[0];
  return null;
}
