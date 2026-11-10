import React, { useRef, useState } from 'react';
import { dataFetch } from '../../api';
import { useAuth } from '../../auth';
import { logActivity } from '../../lib/activity';
import { cleanTranscript, matchMessage } from '../../lib/transcript';
import { ytId } from '../../utils';

const btn = 'px-4 py-2 rounded-lg border border-[#1e2522]/20 bg-white font-bold text-sm disabled:opacity-40';

// Adds transcripts to messages from files (.txt, .srt, .vtt). Each file is matched by its name, and the match can be changed before saving.
export default function TranscriptImport({ items, onClose, onDone }) {
  const { user } = useAuth();
  const fileRef = useRef(null);
  const [rows, setRows] = useState([]);
  const [replace, setReplace] = useState(false);
  const [progress, setProgress] = useState(null);

  const byId = Object.fromEntries(items.map(m => [String(m.id), m]));
  const sorted = [...items].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

  const load = async (fileList) => {
    const next = [];
    for (const f of Array.from(fileList)) {
      const text = cleanTranscript(await f.text());
      const hit = matchMessage(f.name, items, m => ytId(m.video_url || m.yt));
      next.push({ key: `${f.name}-${f.size}`, name: f.name, text, id: hit ? String(hit.id) : '' });
    }
    setRows(prev => [...prev.filter(p => !next.some(n => n.key === p.key)), ...next]);
  };

  const ready = rows.filter(r => r.id && r.text && (replace || !String(byId[r.id]?.notes || '').trim()));
  const alreadyHave = rows.filter(r => r.id && String(byId[r.id]?.notes || '').trim()).length;

  const save = async () => {
    setProgress({ done: 0, failed: 0, total: ready.length });
    let done = 0; let failed = 0;
    for (const r of ready) {
      const res = await dataFetch(`update/sermons/${r.id}`, { method: 'PUT', body: JSON.stringify({ notes: r.text }) });
      if (res.status === 'success') done += 1; else failed += 1;
      setProgress({ done, failed, total: ready.length });
    }
    if (done) logActivity(user, 'imported transcripts', 'Messages', `${done} messages`);
    await onDone();
    setProgress({ done, failed, total: ready.length, finished: true });
  };

  return (
    <div className="bg-white rounded-2xl border border-[#1e2522]/10 shadow-sm p-5 mb-6" role="region" aria-label="Import transcripts">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <strong>Import transcripts</strong>
        <button type="button" className={btn} onClick={onClose}>Close</button>
      </div>
      <p className="text-sm text-black mt-2 max-w-3xl">Choose transcript files (.txt, .srt or .vtt). A file is matched to a message when its name contains the message title or the YouTube video id. Check each match below, change any that are wrong, then save. Times and cue numbers are removed and the text is split into paragraphs.</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input ref={fileRef} type="file" accept=".txt,.srt,.vtt,.md,text/plain" multiple className="sr-only" aria-label="Choose transcript files" tabIndex={-1} onChange={(e) => { load(e.target.files); e.target.value = ''; }} />
        <button type="button" className={btn} onClick={() => fileRef.current?.click()}>Choose files</button>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={replace} onChange={(e) => setReplace(e.target.checked)} className="w-5 h-5 accent-[#c74f2f]" />
          Replace notes already on a message
        </label>
      </div>

      {rows.length > 0 && (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead><tr className="border-b border-[#1e2522]/10"><th className="py-2 pr-4">File</th><th className="py-2 pr-4">Message</th><th className="py-2">Words</th></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.key} className="border-b border-[#1e2522]/10 align-top">
                  <td className="py-2 pr-4 break-all">{r.name}</td>
                  <td className="py-2 pr-4">
                    <select value={r.id} onChange={(e) => setRows(prev => prev.map(p => p.key === r.key ? { ...p, id: e.target.value } : p))} className="px-3 py-2 rounded-lg border border-[#1e2522]/20 bg-white max-w-[22rem]" aria-label={`Message for ${r.name}`}>
                      <option value="">No match, skip this file</option>
                      {sorted.map(m => <option key={m.id} value={m.id}>{[m.date && String(m.date).slice(0, 10), m.title].filter(Boolean).join('  ')}</option>)}
                    </select>
                    {r.id && String(byId[r.id]?.notes || '').trim() && !replace && <span className="block text-xs mt-1">Already has notes, will be skipped.</span>}
                  </td>
                  <td className="py-2">{r.text ? r.text.split(/\s+/).length : 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" className={btn} disabled={!ready.length || (progress && !progress.finished)} onClick={save}>Save {ready.length} {ready.length === 1 ? 'transcript' : 'transcripts'}</button>
            <span className="text-sm">{rows.filter(r => !r.id).length} without a match{alreadyHave && !replace ? `, ${alreadyHave} skipped because notes exist` : ''}.</span>
          </div>
        </div>
      )}
      {progress && <p role="status" className="mt-3 text-sm font-semibold">{progress.finished ? `Saved ${progress.done}${progress.failed ? `, ${progress.failed} failed` : ''}.` : `Saving ${progress.done + progress.failed} of ${progress.total}`}</p>}
    </div>
  );
}
