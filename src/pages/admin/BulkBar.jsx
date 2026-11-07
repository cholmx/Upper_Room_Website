import React, { useMemo, useState } from 'react';
import { dataFetch } from '../../api';
import { useAuth } from '../../auth';
import { logActivity } from '../../lib/activity';
import { addTag, removeTag, parseTags } from '../../lib/tags';
import ConfirmDialog from '../../components/ConfirmDialog';

const btn = 'px-4 py-2 rounded-lg border border-[#1e2522]/20 bg-white font-bold text-sm disabled:opacity-40';
const input = 'px-3 py-2 rounded-lg border border-[#1e2522]/20 bg-white text-sm min-w-[12rem]';

// Edits many messages at once: choose messages, then change their series, speaker, category, tags or visibility.
export default function BulkBar({ table, title, items, filtered, selected, setSelected, onDone }) {
  const { user } = useAuth();
  const [values, setValues] = useState({ series: '', speaker: '', topic: '', addTag: '', removeTag: '' });
  const [progress, setProgress] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const distinct = (key) => [...new Set(items.map(i => String(i[key] || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const seriesList = useMemo(() => distinct('series'), [items]);
  const speakers = useMemo(() => distinct('speaker'), [items]);
  const topics = useMemo(() => distinct('topic'), [items]);
  const tagList = useMemo(() => [...new Set(items.flatMap(i => parseTags(i.tags)))].sort((a, b) => a.localeCompare(b)), [items]);

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
        <span className="text-[#1e2522]/70">{selected.size} selected</span>
      </div>

      {selected.size > 0 && (
        <div className="mt-5 pt-5 border-t border-[#1e2522]/10 space-y-5">
          <p className="text-sm text-[#1e2522]/70">Changes apply to the {selected.size} selected {selected.size === 1 ? 'message' : 'messages'}. To rename a series, select the whole series and set a new series name. To merge two series, select both and set one name.</p>
          <div className="grid lg:grid-cols-2 gap-5">
            {field('series', 'Series', seriesList, 'Set series', 'Series name')}
            {field('speaker', 'Speaker', speakers, 'Set speaker', 'Speaker name')}
            {field('topic', 'Category', topics, 'Set category', 'Category')}
            <div className="flex flex-wrap items-end gap-2">
              <label className="text-sm font-semibold">
                <span className="block mb-1">Add a tag</span>
                <input list="bulk-tags-add" value={values.addTag} onChange={(e) => set('addTag', e.target.value)} placeholder="Tag" className={input} />
                <datalist id="bulk-tags-add">{tagList.map(v => <option key={v} value={v} />)}</datalist>
              </label>
              <button type="button" disabled={busy || !parseTags(values.addTag).length} onClick={() => run(`Add tag ${values.addTag.trim()}`, r => {
                const next = parseTags(values.addTag).reduce((t, tag) => addTag(t, tag), r.tags || '');
                return next === (r.tags || '') ? null : { tags: next };
              })} className={btn}>Add</button>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <label className="text-sm font-semibold">
                <span className="block mb-1">Remove a tag</span>
                <input list="bulk-tags-remove" value={values.removeTag} onChange={(e) => set('removeTag', e.target.value)} placeholder="Tag" className={input} />
                <datalist id="bulk-tags-remove">{tagList.map(v => <option key={v} value={v} />)}</datalist>
              </label>
              <button type="button" disabled={busy || !parseTags(values.removeTag).length} onClick={() => run(`Remove tag ${values.removeTag.trim()}`, r => {
                const next = parseTags(values.removeTag).reduce((t, tag) => removeTag(t, tag), r.tags || '');
                return next === (r.tags || '') ? null : { tags: next };
              })} className={btn}>Remove</button>
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
            ? `${progress.label}: ${progress.done} updated${progress.failed ? `, ${progress.failed} could not be saved` : ''}.`
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
