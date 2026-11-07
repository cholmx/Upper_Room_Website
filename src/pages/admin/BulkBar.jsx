import React, { useMemo, useState } from 'react';
import { dataFetch } from '../../api';
import { backend } from '../../lib/backend';
import { useAuth } from '../../auth';
import { addCategory, removeCategory, parseCategories } from '../../lib/categories';
import { logActivity } from '../../lib/activity';
import ConfirmDialog from '../../components/ConfirmDialog';

const btn = 'px-4 py-2 rounded-lg border border-[#1e2522]/20 bg-white font-bold text-sm disabled:opacity-40';
const input = 'px-3 py-2 rounded-lg border border-[#1e2522]/20 bg-white text-sm min-w-[12rem]';

// Edits many messages at once: choose messages, then change their series, speaker, category or visibility.
export default function BulkBar({ table, title, items, filtered, selected, setSelected, onDone, categories = [] }) {
  const { user } = useAuth();
  const [values, setValues] = useState({ series: '', speaker: '', topic: '' });
  const [progress, setProgress] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [replaceAll, setReplaceAll] = useState(false);

  const distinct = (key) => [...new Set(items.map(i => String(i[key] || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const seriesList = useMemo(() => distinct('series'), [items]);
  const speakers = useMemo(() => distinct('speaker'), [items]);
  const topics = useMemo(() => [...new Set([...categories, ...items.flatMap(i => parseCategories(i.topic))])].sort((a, b) => a.localeCompare(b)), [items, categories]);

  const chosen = items.filter(i => selected.has(i.id));
  const busy = progress && !progress.finished;
  const set = (k, v) => setValues(prev => ({ ...prev, [k]: v }));

  const run = async (label, changeFor) => {
    const rows = chosen.map(r => ({ r, change: changeFor(r) })).filter(x => x.change);
    setProgress({ label, done: 0, failed: 0, total: rows.length });
    let done = 0; let failed = 0;
    for (const { r, change } of rows) {
      const res = await dataFetch(`update/${table}/${r.id}`, { method: 'PUT', body: JSON.stringify(change) });
      if (res.status === 'success') done += 1; else failed += 1;
      setProgress({ label, done, failed, total: rows.length });
    }
    if (done) logActivity(user, 'bulk edited', title, `${label} on ${done} items`);
    await onDone();
    setProgress({ label, done, failed, total: rows.length, finished: true });
  };

  const setField = (field, label) => run(label, () => ({ [field]: values[field].trim() }));
  const clearField = (field, label) => run(label, () => ({ [field]: '' }));

  const WHY = {
    '!no_key': 'The Anthropic key is not saved in the database yet.',
    '!request_failed': 'The request to the AI service failed.',
    '!unreadable': 'The AI answer could not be read.',
    '!no_match': 'No approved category fit.',
    '!already_set': 'Already has a category.',
    '!not_found': 'That message no longer exists.',
  };
  const reviewWithAi = async () => {
    setProgress({ label: 'AI review', done: 0, failed: 0, total: chosen.length });
    let done = 0; let failed = 0; let reason = '';
    for (const r of chosen) {
      const res = await backend.rpc('ai_review_message', { sermon_id: r.id, replace: replaceAll });
      const out = res.status === 'success' ? String(res.data ?? '') : '';
      if (res.status === 'success' && out && out[0] !== '!') done += 1;
      else { failed += 1; reason = reason || (res.status !== 'success' ? res.error : (WHY[out] || (out.startsWith('!status_') ? `The AI service answered ${out.slice(8)}.` : 'No change.'))); }
      setProgress({ label: 'AI review', done, failed, total: chosen.length, reason });
      if (reason === WHY['!no_key']) break;
    }
    if (done) logActivity(user, 'AI reviewed', title, `${done} messages`);
    await onDone();
    setProgress({ label: 'AI review', done, failed, total: chosen.length, finished: true, reason });
  };

  const deleteAll = async () => {
    setConfirmDelete(false);
    setProgress({ label: 'Delete', done: 0, failed: 0, total: chosen.length });
    let done = 0; let failed = 0;
    for (const r of chosen) {
      const res = await dataFetch(`delete/${table}/${r.id}`, { method: 'DELETE' });
      if (res.status === 'success') done += 1; else failed += 1;
      setProgress({ label: 'Delete', done, failed, total: chosen.length });
    }
    if (done) logActivity(user, 'bulk deleted', title, `${done} items`);
    setSelected(new Set());
    await onDone();
    setProgress({ label: 'Delete', done, failed, total: chosen.length, finished: true });
  };

  const field = (key, label, list, setLabel, ph) => (
    <div className="flex flex-wrap items-end gap-2">
      <label className="text-sm font-semibold">
        <span className="block mb-1">{label}</span>
        <input list={`bulk-${key}`} value={values[key]} onChange={(e) => set(key, e.target.value)} placeholder={ph} className={input} />
        <datalist id={`bulk-${key}`}>{list.map(v => <option key={v} value={v} />)}</datalist>
      </label>
      <button type="button" disabled={busy || !values[key].trim()} onClick={() => setField(key, setLabel)} className={btn}>Set</button>
      <button type="button" disabled={busy} onClick={() => clearField(key, `Clear ${label.toLowerCase()}`)} className={btn}>Clear</button>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-[#1e2522]/10 shadow-sm p-5 mb-6" role="region" aria-label="Edit many at once">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <strong>Edit many at once</strong>
        <button type="button" className={btn} onClick={() => setSelected(new Set(filtered.map(i => i.id)))}>Select all {filtered.length} shown</button>
        <button type="button" className={btn} onClick={() => setSelected(new Set())} disabled={selected.size === 0}>Deselect all</button>
        <label className="flex items-center gap-2">
          <span className="font-semibold">Select a whole series</span>
          <select value="" onChange={(e) => { const name = e.target.value; if (name) setSelected(new Set(items.filter(i => String(i.series || '').trim() === name).map(i => i.id))); }} className={input}>
            <option value="">Choose a series</option>
            {seriesList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <button type="button" className={btn} onClick={() => setSelected(new Set(items.filter(i => !String(i.topic || '').trim()).map(i => i.id)))}>Select messages with no category</button>
        <span className="text-[#1e2522]/70">{selected.size} selected</span>
      </div>

      {selected.size > 0 && (
        <div className="mt-5 pt-5 border-t border-[#1e2522]/10 space-y-5">
          <p className="text-sm text-[#1e2522]/70">Changes apply to the {selected.size} selected {selected.size === 1 ? 'message' : 'messages'}. To rename a series, select the whole series and set a new series name. To merge two series, select both and set one name.</p>
          <div className="grid lg:grid-cols-2 gap-5">
            {field('series', 'Series', seriesList, 'Set series', 'Series name')}
            {field('speaker', 'Speaker', speakers, 'Set speaker', 'Speaker name')}
            <div className="flex flex-wrap items-end gap-2">
              <label className="text-sm font-semibold">
                <span className="block mb-1">Categories</span>
                <input list="bulk-topic" value={values.topic} onChange={(e) => set('topic', e.target.value)} placeholder="Category" className={input} />
                <datalist id="bulk-topic">{topics.map(v => <option key={v} value={v} />)}</datalist>
              </label>
              <button type="button" disabled={busy || !values.topic.trim()} onClick={() => run(`Add category ${values.topic.trim()}`, r => { const next = addCategory(r.topic, values.topic); return next === (r.topic || '') ? null : { topic: next }; })} className={btn}>Add</button>
              <button type="button" disabled={busy || !values.topic.trim()} onClick={() => run(`Remove category ${values.topic.trim()}`, r => { const next = removeCategory(r.topic, values.topic); return next === (r.topic || '') ? null : { topic: next }; })} className={btn}>Remove</button>
              <button type="button" disabled={busy || !values.topic.trim()} onClick={() => run(`Set category ${values.topic.trim()}`, () => ({ topic: values.topic.trim() }))} className={btn}>Set only this</button>
              <button type="button" disabled={busy} onClick={() => clearField('topic', 'Clear categories')} className={btn}>Clear</button>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <span className="text-sm font-semibold block w-full">Review with AI</span>
              <button type="button" disabled={busy} onClick={reviewWithAi} className={btn}>Review {selected.size} with AI</button>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={replaceAll} onChange={(e) => setReplaceAll(e.target.checked)} className="w-5 h-5 accent-[#c74f2f]" />
                Replace categories already set
              </label>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <span className="text-sm font-semibold block w-full">On the website</span>
              <button type="button" disabled={busy} onClick={() => run('Show on website', () => ({ published: 1 }))} className={btn}>Show</button>
              <button type="button" disabled={busy} onClick={() => run('Make drafts', () => ({ published: 0 }))} className={btn}>Make drafts</button>
              <button type="button" disabled={busy} onClick={() => setConfirmDelete(true)} className={`${btn} !text-[#c74f2f]`}>Delete selected</button>
            </div>
          </div>
        </div>
      )}

      {progress && (
        <p role="status" className="mt-4 text-sm font-semibold">
          {progress.finished
            ? `${progress.label}: ${progress.done} updated${progress.failed ? `, ${progress.failed} not changed` : ''}.${progress.reason ? ` ${progress.reason}` : ''}`
            : `${progress.label}: ${progress.done + progress.failed} of ${progress.total}`}
        </p>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title={`Delete ${selected.size} ${selected.size === 1 ? 'message' : 'messages'}?`}
          message="They will be permanently removed."
          confirmLabel="Delete"
          onCancel={() => setConfirmDelete(false)}
          onConfirm={deleteAll}
        />
      )}
    </div>
  );
}
