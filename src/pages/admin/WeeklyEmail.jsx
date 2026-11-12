import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import { backend } from '../../lib/backend';
import { dataFetch } from '../../api';
import { useAuth } from '../../auth';
import { logActivity } from '../../lib/activity';
import ConfirmDialog from '../../components/ConfirmDialog';

const btn = 'px-3 py-1.5 rounded-lg border border-[#1e2522]/20 bg-white font-bold text-sm disabled:opacity-40';
const input = 'w-full px-3 py-2 rounded-lg border border-[#1e2522]/20 bg-white';
const card = 'bg-white rounded-2xl border border-[#1e2522]/10 p-5 md:p-6';

const AI_ERRORS = {
  '!no_key': 'The Anthropic key is not stored in the database yet.',
  '!too_little': 'This message has no summary or transcript to write from yet.',
  '!request_failed': 'The request did not go through. Please try again.',
  '!unreadable': 'The answer could not be used. Please try again.',
  '!not_found': 'That message could not be found.',
};

const day = (iso) => {
  if (!iso) return '';
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T12:00:00` : iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

// The weekly email: turn it on, see what next Wednesday's email looks like, change the thought, send a test, and manage who gets it.
export default function WeeklyEmail() {
  const { user } = useAuth();
  const settings = useFetch('read/weekly_settings_church?id=1', { admin: true });
  const people = useFetch('read/weekly_subscribers_church?sort=id:desc', { admin: true });
  const issues = useFetch('read/weekly_issues_church?sort=id:desc&limit=10', { admin: true });
  const cfg = (settings.data || [])[0] || null;
  const rows = people.data || [];
  const active = rows.filter(r => r.status === 'active').length;

  const [preview, setPreview] = useState(null);
  const [previewError, setPreviewError] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [thought, setThought] = useState('');
  const [blurb, setBlurb] = useState('');
  const [blurbNote, setBlurbNote] = useState('');
  const [thoughtNote, setThoughtNote] = useState('');
  const [busy, setBusy] = useState('');
  const [testTo, setTestTo] = useState('');
  const [testNote, setTestNote] = useState('');
  const [confirmSend, setConfirmSend] = useState(false);
  const [sendNote, setSendNote] = useState('');
  const [many, setMany] = useState('');
  const [manyNote, setManyNote] = useState('');
  const [q, setQ] = useState('');
  const [pendingRemove, setPendingRemove] = useState(null);

  const loadPreview = useCallback(async () => {
    setLoadingPreview(true); setPreviewError('');
    const res = await backend.rpc('preview_weekly_email', {});
    if (res.status === 'success' && res.data) {
      setPreview(res.data);
      if (res.data.sermon_id) {
        const s = await dataFetch(`read/sermons?id=${res.data.sermon_id}`);
        const row = s.status === 'success' ? (Array.isArray(s.data) ? s.data[0] : s.data) : null;
        setThought((row && row.weekly_thought) || '');
        setBlurb((row && row.weekly_blurb) || '');
      } else { setThought(''); setBlurb(''); }
    } else setPreviewError(res.error || 'The preview could not be built.');
    setLoadingPreview(false);
  }, []);
  useEffect(() => { loadPreview(); }, [loadPreview]);

  const toggle = async () => {
    if (!cfg) return;
    setBusy('toggle');
    const next = cfg.enabled === 1 ? 0 : 1;
    const res = await dataFetch('update/weekly_settings_church/1', { method: 'PUT', body: JSON.stringify({ enabled: next }) });
    setBusy('');
    if (res.status === 'success') { logActivity(user, next ? 'turned the weekly email on' : 'turned the weekly email off', 'Weekly Email', ''); settings.reload(); }
  };

  const saveThought = async () => {
    if (!preview?.sermon_id) return;
    setBusy('save'); setThoughtNote('');
    const res = await backend.rpc('set_weekly_thought', { p_sermon_id: preview.sermon_id, p_text: thought });
    setBusy('');
    if (res.status === 'success') { setThoughtNote('Saved.'); logActivity(user, 'edited the weekly thought', 'Weekly Email', ''); loadPreview(); } else setThoughtNote(res.error || 'That did not save.');
  };

  const saveBlurb = async () => {
    if (!preview?.sermon_id) return;
    setBusy('saveblurb'); setBlurbNote('');
    const res = await backend.rpc('set_weekly_blurb', { p_sermon_id: preview.sermon_id, p_text: blurb });
    setBusy('');
    if (res.status === 'success') { setBlurbNote('Saved.'); loadPreview(); } else setBlurbNote(res.error || 'That did not save.');
  };

  const writeBlurb = async () => {
    if (!preview?.sermon_id) return;
    setBusy('aiblurb'); setBlurbNote('');
    const res = await backend.rpc('ai_weekly_blurb', { p_sermon_id: preview.sermon_id });
    setBusy('');
    if (res.status === 'success' && res.data === 'ok') { setBlurbNote('A new short summary is ready.'); loadPreview(); }
    else setBlurbNote(AI_ERRORS[res.data] || (typeof res.data === 'string' && res.data.startsWith('!status_') ? 'The AI service answered with an error. Please try again.' : res.error || 'That did not work.'));
  };

  const writeThought = async () => {
    if (!preview?.sermon_id) return;
    setBusy('ai'); setThoughtNote('');
    const res = await backend.rpc('ai_weekly_thought', { p_sermon_id: preview.sermon_id, p_force: true });
    setBusy('');
    if (res.status === 'success' && res.data === 'ok') { setThoughtNote('A new thought is ready.'); loadPreview(); }
    else setThoughtNote(AI_ERRORS[res.data] || (typeof res.data === 'string' && res.data.startsWith('!status_') ? 'The AI service answered with an error. Please try again.' : res.error || 'That did not work.'));
  };

  const sendTest = async (e) => {
    e.preventDefault();
    setBusy('test'); setTestNote('');
    const res = await backend.rpc('send_weekly_test', { p_to: testTo.trim() });
    setBusy('');
    const d = res.status === 'success' ? res.data : null;
    setTestNote(d && d.status === 'sent' ? 'Sent. Check that inbox, and the spam folder.' : `Not sent. ${(d && d.error) || res.error || ''}`);
  };

  const sendNow = async () => {
    setConfirmSend(false); setBusy('send'); setSendNote('');
    const res = await backend.rpc('send_weekly_now', {});
    setBusy('');
    if (res.status === 'success' && typeof res.data === 'string' && res.data.startsWith('ok:')) {
      setSendNote(`Sending to ${res.data.slice(3)} people. It takes a few minutes to go out.`);
      logActivity(user, 'sent the weekly email', 'Weekly Email', res.data.slice(3));
      issues.reload(); people.reload();
    } else if (res.data === '!already_sent') setSendNote('The weekly email already went out today.');
    else setSendNote(res.error || 'That did not work.');
  };

  const addMany = async (e) => {
    e.preventDefault();
    setBusy('add'); setManyNote('');
    const res = await backend.rpc('add_weekly_subscribers', { p_lines: many });
    setBusy('');
    if (res.status === 'success') {
      const d = res.data || {};
      setManyNote(`Added ${d.added || 0}. ${d.skipped ? `${d.skipped} were already on the list. ` : ''}${d.invalid ? `${d.invalid} lines had no email address.` : ''}`.trim());
      if (d.added) { setMany(''); people.reload(); }
    } else setManyNote(res.error || 'That did not work.');
  };

  const remove = async () => {
    const c = pendingRemove; setPendingRemove(null);
    const res = await dataFetch(`delete/weekly_subscribers_church/${c.id}`, { method: 'DELETE' });
    if (res.status === 'success') { logActivity(user, 'removed from the weekly email', 'Weekly Email', c.email); people.reload(); }
  };

  const shown = useMemo(() => rows.filter(r => !q.trim() || `${r.name} ${r.email}`.toLowerCase().includes(q.trim().toLowerCase())), [rows, q]);
  const last = (issues.data || [])[0];
  const on = cfg && cfg.enabled === 1;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#1e2522]">Weekly Email</h2>

      <section className={card} aria-label="Status">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-lg font-bold">{on ? 'The weekly email is on' : 'The weekly email is off'}</p>
            <p className="text-sm text-black mt-1">
              {on
                ? `It goes out every Wednesday morning at ${cfg.send_hour}:00 Eastern to everyone who is signed up. It sends once a day at most.`
                : 'Nothing is sent until you turn it on. Sign-ups from the website are collected either way.'}
            </p>
            <p className="text-sm text-black mt-1">{active} {active === 1 ? 'person is' : 'people are'} signed up.{last ? ` The last email went out ${day(last.issue_date)} to ${last.recipients} people.` : ''}</p>
          </div>
          <button type="button" onClick={toggle} disabled={!cfg || busy === 'toggle'} className={`${btn} ${on ? '' : '!bg-[#1e2522] !text-white'}`}>{on ? 'Turn off' : 'Turn on'}</button>
        </div>
      </section>

      <section className={card} aria-label="This week's email">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold">What would go out right now</h3>
          <button type="button" onClick={loadPreview} disabled={loadingPreview} className={btn}>{loadingPreview ? 'Loading' : 'Refresh preview'}</button>
        </div>
        <p className="text-sm text-black mt-1 max-w-3xl">It is built from your newest published message, a short version of its summary, and the events in the next seven days. Edit those in Messages and Events, then refresh.</p>
        {previewError && <p role="alert" className="mt-3 text-sm font-semibold text-[#c74f2f]">{previewError}</p>}
        {preview && (
          <div className="mt-4 grid lg:grid-cols-[1fr_340px] gap-6 items-start">
            <div>
              <p className="text-sm font-semibold mb-2">Subject: <span className="font-normal">{preview.subject}</span></p>
              <iframe title="Preview of the weekly email" sandbox="" srcDoc={preview.html} className="w-full h-[640px] rounded-lg border border-[#1e2522]/15 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold" htmlFor="weekly-blurb">Short summary of the message</label>
              <p className="text-xs text-black mt-1">AI shortens the message summary to a sentence or two. It is written again only if the summary changes. Change it any way you like.</p>
              <textarea id="weekly-blurb" rows={4} maxLength={600} value={blurb} onChange={(e) => setBlurb(e.target.value)} className={`${input} mt-2`} disabled={!preview.sermon_id} />
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" onClick={saveBlurb} disabled={busy !== '' || !preview.sermon_id} className={btn}>{busy === 'saveblurb' ? 'Saving' : 'Save summary'}</button>
                <button type="button" onClick={writeBlurb} disabled={busy !== '' || !preview.sermon_id} className={btn}>{busy === 'aiblurb' ? 'Writing' : 'Shorten with AI'}</button>
              </div>
              {blurbNote && <p role="status" className="mt-2 text-sm font-semibold">{blurbNote}</p>}

              <label className="block text-sm font-semibold mt-6" htmlFor="weekly-thought">A thought for the week</label>
              <p className="text-xs text-black mt-1">Written by AI from the message the first time. Change it any way you like.</p>
              <textarea id="weekly-thought" rows={7} maxLength={1500} value={thought} onChange={(e) => setThought(e.target.value)} className={`${input} mt-2`} disabled={!preview.sermon_id} />
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" onClick={saveThought} disabled={busy !== '' || !preview.sermon_id} className={btn}>{busy === 'save' ? 'Saving' : 'Save thought'}</button>
                <button type="button" onClick={writeThought} disabled={busy !== '' || !preview.sermon_id} className={btn}>{busy === 'ai' ? 'Writing' : 'Write a new one with AI'}</button>
              </div>
              {thoughtNote && <p role="status" className="mt-2 text-sm font-semibold">{thoughtNote}</p>}
              <p className="mt-4 text-sm text-black">{preview.event_count} {preview.event_count === 1 ? 'event' : 'events'} in the next seven days.</p>
            </div>
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-[#1e2522]/10 grid md:grid-cols-2 gap-6">
          <form onSubmit={sendTest} className="flex flex-wrap items-end gap-3">
            <label className="text-sm font-semibold flex-1 min-w-[14rem]">
              <span className="block mb-1">Send a test to</span>
              <input type="email" required value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="you@example.com" className={input} />
            </label>
            <button type="submit" disabled={busy === 'test'} className={btn}>{busy === 'test' ? 'Sending' : 'Send test'}</button>
            {testNote && <p role="status" className="basis-full text-sm font-semibold">{testNote}</p>}
          </form>
          <div>
            <p className="text-sm font-semibold mb-1">Send it to everyone now</p>
            <p className="text-xs text-black mb-2">Use this to send early or to send the first one. It will not send twice in one day.</p>
            <button type="button" onClick={() => setConfirmSend(true)} disabled={busy === 'send' || active === 0} className={`${btn} !bg-[#1e2522] !text-white`}>{busy === 'send' ? 'Sending' : `Send to ${active} ${active === 1 ? 'person' : 'people'}`}</button>
            {sendNote && <p role="status" className="mt-2 text-sm font-semibold">{sendNote}</p>}
          </div>
        </div>
      </section>

      <section className={card} aria-label="People">
        <h3 className="text-lg font-bold">People on the list</h3>
        <form onSubmit={addMany} className="mt-3 max-w-xl">
          <label className="text-sm font-semibold block" htmlFor="weekly-add">Add people, one per line: name, email</label>
          <textarea id="weekly-add" rows={3} value={many} onChange={(e) => setMany(e.target.value)} className={`${input} mt-1`} placeholder={'Jane Smith, jane@example.com'} />
          <div className="mt-2 flex items-center gap-3"><button type="submit" disabled={busy === 'add' || !many.trim()} className={btn}>{busy === 'add' ? 'Adding' : 'Add'}</button>{manyNote && <p role="status" className="text-sm font-semibold">{manyNote}</p>}</div>
        </form>
        <div className="mt-5 flex items-center gap-3"><label className="text-sm font-semibold" htmlFor="weekly-q">Search</label><input id="weekly-q" value={q} onChange={(e) => setQ(e.target.value)} className={`${input} max-w-xs`} /></div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b border-[#1e2522]/15"><th className="py-2 pr-3">Name</th><th className="py-2 pr-3">Email</th><th className="py-2 pr-3">Signed up</th><th className="py-2 pr-3">From</th><th className="py-2 pr-3">Status</th><th className="py-2"><span className="sr-only">Remove</span></th></tr></thead>
            <tbody>
              {shown.slice(0, 200).map(r => (
                <tr key={r.id} className="border-b border-[#1e2522]/10">
                  <td className="py-2 pr-3">{r.name || ''}</td><td className="py-2 pr-3">{r.email}</td><td className="py-2 pr-3">{day(r.created_at)}</td><td className="py-2 pr-3">{r.source}</td>
                  <td className="py-2 pr-3">{r.status === 'active' ? 'Active' : 'Unsubscribed'}</td>
                  <td className="py-2"><button type="button" onClick={() => setPendingRemove(r)} className="text-[#c74f2f] font-bold underline underline-offset-2">Remove</button></td>
                </tr>
              ))}
              {shown.length === 0 && <tr><td colSpan={6} className="py-4 text-black">{rows.length === 0 ? 'No one has signed up yet.' : 'No one matches that search.'}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {(issues.data || []).length > 0 && (
        <section className={card} aria-label="Past emails">
          <h3 className="text-lg font-bold mb-2">Past emails</h3>
          <ul className="text-sm space-y-1">{(issues.data || []).map(i => <li key={i.id}>{day(i.issue_date)}: {i.subject}, sent to {i.recipients}</li>)}</ul>
        </section>
      )}

      {confirmSend && <ConfirmDialog title="Send the weekly email now?" message={`The email shown above goes to ${active} ${active === 1 ? 'person' : 'people'} right away. This cannot be undone.`} confirmLabel="Send" onCancel={() => setConfirmSend(false)} onConfirm={sendNow} />}
      {pendingRemove && <ConfirmDialog title="Remove this person?" message={`${pendingRemove.name || pendingRemove.email} will be taken off the list. They can sign up again later.`} confirmLabel="Remove" onCancel={() => setPendingRemove(null)} onConfirm={remove} />}
    </div>
  );
}
