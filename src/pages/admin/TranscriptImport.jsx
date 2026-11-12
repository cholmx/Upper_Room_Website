import React, { useEffect, useRef, useState } from 'react';
import { backend } from '../../lib/backend';
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
  const [aiAfter, setAiAfter] = useState(true);
  const [have, setHave] = useState(new Set());
  const [aiState, setAiState] = useState(null);

  // Which messages already have a private transcript.
  const loadStatus = async () => {
    const res = await backend.rpc('sermon_transcript_status', {});
    if (res.status === 'success') setHave(new Set((res.data || []).map(r => String(r.sermon_id))));
  };
  useEffect(() => { loadStatus(); }, []);

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

  const ready = rows.filter(r => r.id && r.text && (replace || !have.has(r.id)));
  const alreadyHave = rows.filter(r => r.id && have.has(r.id)).length;

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const transient = (res, out) => res.status !== 'success' || out === '!request_failed' || /^!status_(429|500|502|503|529)$/.test(out);
  const callAi = async (fn, id) => {
    let res; let out = '';
    for (let attempt = 0; attempt < 3; attempt += 1) {
      res = await backend.rpc(fn, fn === 'ai_summarize_message' ? { sermon_id: Number(id), force: false } : { sermon_id: Number(id), replace: false });
      out = res.status === 'success' ? String(res.data ?? '') : '';
      if (!transient(res, out)) break;
      await sleep(3000 * (attempt + 1));
    }
    return out;
  };

  const save = async () => {
    setProgress({ done: 0, failed: 0, total: ready.length });
    setAiState(null);
    let done = 0; let failed = 0;
    const saved = [];
    for (const r of ready) {
      const res = await backend.rpc('save_sermon_transcript', { p_sermon_id: Number(r.id), p_body: r.text });
      if (res.status === 'success' && res.data) { done += 1; saved.push(r.id); } else failed += 1;
      setProgress({ done, failed, total: ready.length });
    }
    if (done) logActivity(user, 'imported transcripts', 'Messages', `${done} messages`);
    await loadStatus();
    setProgress({ done, failed, total: ready.length, finished: true });

    // Then the AI reads each new transcript and fills in the description and categories that are still blank.
    if (aiAfter && saved.length) {
      let wrote = 0; let tagged = 0; let problems = 0;
      for (let i = 0; i < saved.length; i += 1) {
        setAiState({ working: true, at: i + 1, total: saved.length });
        const a = await callAi('ai_summarize_message', saved[i]);
        if (a === 'ok') wrote += 1; else if (a && a !== '!already_set' && a[0] === '!') problems += 1;
        if (a === '!no_key') break;
        await sleep(1100);
        const c = await callAi('ai_review_message', saved[i]);
        if (c && c[0] !== '!') tagged += 1; else if (c && c !== '!already_set' && c[0] === '!') problems += 1;
        if (c === '!no_key' || c === '!no_categories') break;
        await sleep(1100);
      }
      setAiState({ working: false, wrote, tagged, problems, total: saved.length });
    }
    await onDone();
  };

  return (
    <div className="bg-white rounded-2xl border border-[#1e2522]/10 shadow-sm p-5 mb-6" role="region" aria-label="Import transcripts">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <strong>Import transcripts</strong>
        <button type="button" className={btn} onClick={onClose}>Close</button>
      </div>
      <p className="text-sm text-black mt-2 max-w-3xl">Transcripts are private. They are never shown on the website, and only the AI and the people who sign in here can read them. Choose transcript files (.txt, .srt or .vtt). A file is matched to a message when its name contains the message title or the YouTube video id. Check each match below, change any that are wrong, then save. Times and cue numbers are removed and the text is split into paragraphs.</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input ref={fileRef} type="file" accept=".txt,.srt,.vtt,.md,text/plain" multiple className="sr-only" aria-label="Choose transcript files" tabIndex={-1} onChange={(e) => { load(e.target.files); e.target.value = ''; }} />
        <button type="button" className={btn} onClick={() => fileRef.current?.click()}>Choose files</button>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={replace} onChange={(e) => setReplace(e.target.checked)} className="w-5 h-5 accent-[#c74f2f]" />
          Replace a transcript a message already has
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={aiAfter} onChange={(e) => setAiAfter(e.target.checked)} className="w-5 h-5 accent-[#c74f2f]" />
          Then have the AI write the description and choose categories for any that are blank
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
                    {r.id && have.has(r.id) && !replace && <span className="block text-xs mt-1">Already has a transcript, will be skipped.</span>}
                  </td>
                  <td className="py-2">{r.text ? r.text.split(/\s+/).length : 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" className={btn} disabled={!ready.length || (progress && !progress.finished)} onClick={save}>Save {ready.length} {ready.length === 1 ? 'transcript' : 'transcripts'}</button>
            <span className="text-sm">{rows.filter(r => !r.id).length} without a match{alreadyHave && !replace ? `, ${alreadyHave} skipped because they already have a transcript` : ''}.</span>
          </div>
        </div>
      )}
      {aiState && (
        <p role="status" className="mt-3 text-sm font-semibold">
          {aiState.working ? `AI: message ${aiState.at} of ${aiState.total}. This takes a few seconds for each one.` : `AI finished. It wrote ${aiState.wrote} ${aiState.wrote === 1 ? 'description' : 'descriptions'} and chose categories for ${aiState.tagged}${aiState.problems ? `. ${aiState.problems} could not be done, so use the AI helper on those later` : ''}. Messages that already had a description or categories were left alone.`}
        </p>
      )}
      {progress && <p role="status" className="mt-3 text-sm font-semibold">{progress.finished ? `Saved ${progress.done}${progress.failed ? `, ${progress.failed} failed` : ''}.` : `Saving ${progress.done + progress.failed} of ${progress.total}`}</p>}
    </div>
  );
}
