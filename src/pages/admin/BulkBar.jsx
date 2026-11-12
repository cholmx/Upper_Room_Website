import React, { useEffect, useMemo, useState } from 'react';
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
  const [testResult, setTestResult] = useState(null);

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
    '!no_match': 'The AI did not name an approved category.',
    '!no_categories': 'There are no approved categories yet. Add some under Message Categories.',
    '!already_set': 'Already set.',
    '!too_little': 'The message has no title to work from.',
    '!not_found': 'That message no longer exists.',
  };
  const explain = (res, out) => {
    if (res.status !== 'success') return res.error;
    if (WHY[out]) return WHY[out];
    if (out.startsWith('!no_match')) return `${WHY['!no_match']} It said: ${out.slice(11) || 'nothing'}`;
    if (out.startsWith('!status_')) {
      const code = out.slice(8);
      return code === '429' ? 'The AI service asked us to slow down (rate limit).' : code === '401' ? 'The AI service did not accept the key.' : `The AI service answered ${code}.`;
    }
    return 'No change.';
  };
  const transient = (res, out) => res.status !== 'success' || out === '!request_failed' || /^!status_(429|500|502|503|529)$/.test(out);
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const testOne = async () => {
    setTestResult({ loading: true });
    const res = await backend.rpc('ai_review_test', { sermon_id: chosen[0].id });
    setTestResult(res.status === 'success' ? { data: res.data } : { error: res.error });
  };

  const reviewWithAi = async () => {
    setProgress({ label: 'AI review', done: 0, failed: 0, total: chosen.length, reasons: {} });
    let done = 0; let failed = 0;
    const reasons = {};
    for (let i = 0; i < chosen.length; i += 1) {
      const r = chosen[i];
      let res; let out = '';
      // A busy or rate limited AI service gets a short rest and up to two more tries.
      for (let attempt = 0; attempt < 3; attempt += 1) {
        res = await backend.rpc('ai_review_message', { sermon_id: r.id, replace: replaceAll });
        out = res.status === 'success' ? String(res.data ?? '') : '';
        if (!transient(res, out)) break;
        await sleep(3000 * (attempt + 1));
      }
      if (res.status === 'success' && out && out[0] !== '!') done += 1;
      else {
        failed += 1;
        const why = explain(res, out).replace(/ It said:.*$/, '');
        reasons[why] = (reasons[why] || 0) + 1;
        if (!reasons.__sample && out.startsWith('!no_match')) reasons.__sample = explain(res, out);
      }
      setProgress({ label: 'AI review', done, failed, total: chosen.length, reasons: { ...reasons } });
      if (out === '!no_key' || out === '!no_categories') break;
      // A short pause keeps a new account under the AI service's requests-per-minute limit.
      if (i < chosen.length - 1) await sleep(1100);
    }
    if (done) logActivity(user, 'AI reviewed', title, `${done} messages`);
    // Read the list back from the database, so the report is about what was really saved.
    const fresh = await dataFetch('read/sermons?sort=id:desc');
    const stillBlank = fresh.status === 'success' ? (fresh.data ?? []).filter(m => chosen.some(c => c.id === m.id) && !String(m.topic || '').trim()).length : null;
    await onDone();
    setProgress({ label: 'AI review', done, failed, total: chosen.length, finished: true, reasons: { ...reasons }, stillBlank });
  };

  const summarizeWithAi = async () => {
    const label = 'AI summaries';
    const todo = chosen.filter(r => replaceAll || !String(r.description || '').trim());
    setProgress({ label, done: 0, failed: 0, total: todo.length, reasons: {} });
    let done = 0; let failed = 0;
    const reasons = {};
    for (let i = 0; i < todo.length; i += 1) {
      let res; let out = '';
      for (let attempt = 0; attempt < 3; attempt += 1) {
        res = await backend.rpc('ai_summarize_message', { sermon_id: todo[i].id, force: replaceAll });
        out = res.status === 'success' ? String(res.data ?? '') : '';
        if (!transient(res, out)) break;
        await sleep(3000 * (attempt + 1));
      }
      if (out === 'ok') done += 1;
      else {
        failed += 1;
        const why = explain(res, out);
        reasons[why] = (reasons[why] || 0) + 1;
      }
      setProgress({ label, done, failed, total: todo.length, reasons: { ...reasons } });
      if (out === '!no_key') break;
      if (i < todo.length - 1) await sleep(1100);
    }
    if (done) logActivity(user, 'AI summarized', title, `${done} messages`);
    await onDone();
    setProgress({ label, done, failed, total: todo.length, finished: true, reasons: { ...reasons } });
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

  const [open, setOpen] = useState('');
  const [hasTranscript, setHasTranscript] = useState(new Set());
  useEffect(() => {
    backend.rpc('sermon_transcript_status', {}).then(res => { if (res.status === 'success') setHasTranscript(new Set((res.data || []).map(r => String(r.sermon_id)))); });
  }, [items.length]);
  const n = selected.size;
  const noCategory = items.filter(i => !String(i.topic || '').trim());
  const noSummary = items.filter(i => !String(i.description || '').trim());
  const redo = items.filter(i => i.ai_summarized_at && hasTranscript.has(String(i.id)));
  const pick = (list) => setSelected(new Set(list.map(i => i.id)));
  const toggle = (k) => setOpen(o => (o === k ? '' : k));
  const label = (k) => `${n} ${n === 1 ? 'message' : 'messages'}`;

  const field = (key, name, list, setLabel, ph) => (
    <div>
      <label className="block text-sm font-semibold mb-1" htmlFor={`bulk-in-${key}`}>{name}</label>
      <div className="flex flex-wrap items-center gap-2">
        <input id={`bulk-in-${key}`} list={`bulk-${key}`} value={values[key]} onChange={(e) => set(key, e.target.value)} placeholder={ph} className={input} />
        <datalist id={`bulk-${key}`}>{list.map(v => <option key={v} value={v} />)}</datalist>
        <button type="button" disabled={busy || !values[key].trim()} onClick={() => setField(key, setLabel)} className={btn}>Change to this</button>
        <button type="button" disabled={busy} onClick={() => clearField(key, `Clear ${name.toLowerCase()}`)} className={btn}>Remove it</button>
      </div>
    </div>
  );

  const status = (testResult || progress) && (
    <div className="px-5 pt-4 text-sm text-black space-y-3">
      {testResult && (
        <div role="status" className="rounded-[10px] bg-[#EDE9DC] p-4">
          {testResult.loading && <p>Asking the AI.</p>}
          {testResult.error && <p className="text-[#c74f2f] font-semibold">{testResult.error}</p>}
          {testResult.data && (
            <dl className="space-y-1">
              {Object.entries(testResult.data).map(([k, v]) => (
                <div key={k} className="flex flex-wrap gap-2"><dt className="font-semibold">{k.replace(/_/g, ' ')}:</dt><dd className="break-words">{Array.isArray(v) ? v.join(', ') || 'none' : String(v)}</dd></div>
              ))}
            </dl>
          )}
        </div>
      )}
      {progress && (
        <div role="status">
          <p className="font-semibold">
            {progress.finished
              ? `${progress.label}: ${progress.done} updated${progress.failed ? `, ${progress.failed} not changed` : ''}.${typeof progress.stillBlank === 'number' ? ` ${progress.stillBlank} of the ${progress.total} still have no category in the database.` : ''}`
              : `${progress.label}: ${progress.done + progress.failed} of ${progress.total}`}
          </p>
          {progress.finished && progress.reasons && Object.keys(progress.reasons).some(k => k !== '__sample') && (
            <ul className="mt-2 list-disc pl-5 space-y-1">
              {Object.entries(progress.reasons).filter(([k]) => k !== '__sample').map(([why, count]) => <li key={why}>{count} {count === 1 ? 'message' : 'messages'}: {why}</li>)}
              {progress.reasons.__sample && <li>{progress.reasons.__sample}</li>}
            </ul>
          )}
        </div>
      )}
    </div>
  );

  const panels = {
    series: (
      <div className="space-y-5">
        <p className="text-sm text-black">Changes the series or speaker on the {label()} you ticked. To rename a series, tick all of its messages and change the series name. To merge two series, tick both and change them to one name.</p>
        {field('series', 'Series', seriesList, 'Set series', 'Series name')}
        {field('speaker', 'Speaker', speakers, 'Set speaker', 'Speaker name')}
      </div>
    ),
    categories: (
      <div className="space-y-4">
        <p className="text-sm text-black">A message can have up to three categories. Choose a category, then choose what to do with it on the {label()} you ticked.</p>
        <div>
          <label className="block text-sm font-semibold mb-1" htmlFor="bulk-in-topic">Category</label>
          <input id="bulk-in-topic" list="bulk-topic" value={values.topic} onChange={(e) => set('topic', e.target.value)} placeholder="Choose or type a category" className={`${input} w-full sm:w-auto`} />
          <datalist id="bulk-topic">{topics.map(v => <option key={v} value={v} />)}</datalist>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={busy || !values.topic.trim()} onClick={() => run(`Add category ${values.topic.trim()}`, r => { const next = addCategory(r.topic, values.topic); return next === (r.topic || '') ? null : { topic: next }; })} className={btn}>Add it</button>
          <button type="button" disabled={busy || !values.topic.trim()} onClick={() => run(`Remove category ${values.topic.trim()}`, r => { const next = removeCategory(r.topic, values.topic); return next === (r.topic || '') ? null : { topic: next }; })} className={btn}>Take it off</button>
          <button type="button" disabled={busy || !values.topic.trim()} onClick={() => run(`Set category ${values.topic.trim()}`, () => ({ topic: values.topic.trim() }))} className={btn}>Make it the only category</button>
          <button type="button" disabled={busy} onClick={() => clearField('topic', 'Clear categories')} className={btn}>Remove all categories</button>
        </div>
      </div>
    ),
    ai: (
      <div className="space-y-4">
        <p className="text-sm text-black">The AI helper reads each message’s title, description and transcript. It works through the {label()} you ticked one at a time, so a long list takes a few minutes.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-[10px] bg-[#EDE9DC] p-4">
            <p className="font-semibold">Choose categories</p>
            <p className="text-sm text-black mt-1">Picks one to three categories from your approved list.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" disabled={busy} onClick={reviewWithAi} className={btn}>Choose categories for {n}</button>
              {n === 1 && <button type="button" disabled={busy || testResult?.loading} onClick={testOne} className={btn}>Try it (saves nothing)</button>}
            </div>
          </div>
          <div className="rounded-[10px] bg-[#EDE9DC] p-4">
            <p className="font-semibold">Write summaries</p>
            <p className="text-sm text-black mt-1">Writes a short summary for messages that have none, from the transcript when there is one.</p>
            <div className="mt-3"><button type="button" disabled={busy} onClick={summarizeWithAi} className={btn}>Write summaries for {n}</button></div>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={replaceAll} onChange={(e) => setReplaceAll(e.target.checked)} className="w-5 h-5 accent-[#c74f2f]" />
          Also redo messages that already have categories or a summary
        </label>
      </div>
    ),
    site: (
      <div className="space-y-4">
        <p className="text-sm text-black">Choose whether the {label()} you ticked show on the website.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={busy} onClick={() => run('Show on website', () => ({ published: 1 }))} className={btn}>Show on the website</button>
          <button type="button" disabled={busy} onClick={() => run('Make drafts', () => ({ published: 0 }))} className={btn}>Hide as drafts</button>
          <button type="button" disabled={busy} onClick={() => setConfirmDelete(true)} className={`${btn} !text-[#c74f2f]`}>Delete them</button>
        </div>
      </div>
    ),
  };
  const TOOLS = [['series', 'Series and speaker'], ['categories', 'Categories'], ['ai', 'AI helper'], ['site', 'Show or hide']];

  return (
    <>
      <section className="bg-white rounded-2xl border border-[#1e2522]/10 shadow-sm p-5 md:p-6 mb-6" aria-label="Choose messages to edit">
        <h3 className="text-xl font-bold">Edit many messages at once</h3>
        <p className="text-sm text-black mt-1 max-w-3xl">Step 1: tick the messages in the list, or choose a group below. Step 2: a toolbar appears at the bottom of the screen with what you can do to them.</p>
        <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className={btn} onClick={() => setSelected(new Set(filtered.map(i => i.id)))}>Tick all {filtered.length} shown</button>
            <button type="button" className={btn} onClick={() => setSelected(new Set())} disabled={n === 0}>Untick all</button>
            <span className="text-sm font-semibold">{n} ticked</span>
          </div>
          <label className="text-sm font-semibold">
            <span className="block mb-1">Tick a whole series</span>
            <select value="" onChange={(e) => { const name = e.target.value; if (name) pick(items.filter(i => String(i.series || '').trim() === name)); }} className={input}>
              <option value="">Choose a series</option>
              {seriesList.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">
            <span className="block mb-1">Tick messages that need work</span>
            <select value="" onChange={(e) => { const v = e.target.value; if (v === 'cat') pick(noCategory); if (v === 'sum') pick(noSummary); if (v === 'redo') pick(redo); }} className={input}>
              <option value="">Choose a group</option>
              <option value="cat">With no category ({noCategory.length})</option>
              <option value="sum">With no summary ({noSummary.length})</option>
              <option value="redo">With an AI description and a private transcript ({redo.length})</option>
            </select>
          </label>
        </div>
        {n === 0 && status}
      </section>

      {n > 0 && (
        <div className="fixed bottom-0 inset-x-0 lg:left-72 z-40 p-3 md:p-4 pointer-events-none" role="region" aria-label="What to do with the ticked messages">
          <div className="pointer-events-auto max-w-5xl mx-auto rounded-2xl shadow-2xl border border-[#1e2522]/15 bg-white overflow-hidden">
            {(open || status) && (
              <div className="max-h-[60vh] overflow-y-auto pb-5 border-b border-[#1e2522]/10">
                {status}
                {open && <div className="px-5 pt-4" id={`bulk-panel-${open}`}>{panels[open]}</div>}
              </div>
            )}
            <div className="bg-[#1e2522] text-white px-4 py-3 flex flex-wrap items-center gap-2">
              <span className="font-bold mr-2">{label()} ticked</span>
              {TOOLS.map(([k, name]) => (
                <button key={k} type="button" aria-expanded={open === k} aria-controls={`bulk-panel-${k}`} onClick={() => toggle(k)} className={`px-4 py-2 rounded-lg text-sm font-bold ${open === k ? 'bg-[#eaa235] text-[#1e2522]' : 'bg-white/10 hover:bg-white/20'}`}>{name}</button>
              ))}
              <button type="button" onClick={() => { setSelected(new Set()); setOpen(''); }} className="ml-auto px-4 py-2 rounded-lg text-sm font-bold underline underline-offset-4">Untick all</button>
            </div>
          </div>
        </div>
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
    </>
  );
}
