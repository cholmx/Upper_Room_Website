import React, { useMemo, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import { backend } from '../../lib/backend';
import { dataFetch } from '../../api';
import { useAuth } from '../../auth';
import { logActivity } from '../../lib/activity';
import ConfirmDialog from '../../components/ConfirmDialog';

const btn = 'px-3 py-1.5 rounded-lg border border-[#1e2522]/20 bg-white font-bold text-sm disabled:opacity-40';
const input = 'w-full px-3 py-2 rounded-lg border border-[#1e2522]/20 bg-white';
const STATUS = { active: 'Active', paused: 'Paused', finished: 'Finished', unsubscribed: 'Unsubscribed' };
const SOURCES = ['Paper card', 'In person', 'Phone call', 'Connect Card', 'Contact form', 'Other'];

const when = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const days = Math.round((d.getTime() - Date.now()) / 86400000);
  const day = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  if (days <= 0) return 'due now';
  if (days === 1) return `tomorrow (${day})`;
  return `${day}, in ${days} days`;
};

// Everyone in the welcome emails: add a new person, and see which email each person is on and what comes next.
export default function WelcomeList() {
  const { user } = useAuth();
  const people = useFetch('read/welcome_contacts_church?sort=id:desc', { admin: true });
  const stepsFetch = useFetch('read/welcome_steps_church?sort=step_number:asc', { admin: true });
  const steps = useMemo(() => (stepsFetch.data || []).filter(s => s.published !== 0 && s.published !== false), [stepsFetch.data]);
  const rows = people.data || [];

  const [form, setForm] = useState({ name: '', email: '', phone: '', source: 'Paper card' });
  const [adding, setAdding] = useState(null);
  const [many, setMany] = useState('');
  const [manyState, setManyState] = useState(null);
  const [filter, setFilter] = useState('active');
  const [q, setQ] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [note, setNote] = useState('');
  const [pendingRemove, setPendingRemove] = useState(null);

  const reload = () => { people.reload(); };

  const progress = (c) => {
    const sent = steps.filter(s => s.step_number < c.next_step).length;
    const next = steps.find(s => s.step_number >= c.next_step);
    return { sent, total: steps.length, next };
  };

  const counts = useMemo(() => {
    const by = { active: 0, paused: 0, finished: 0, unsubscribed: 0 };
    const waiting = {};
    rows.forEach(c => {
      by[c.status] = (by[c.status] || 0) + 1;
      if (c.status === 'active') {
        const nx = steps.find(s => s.step_number >= c.next_step);
        if (nx) waiting[nx.step_number] = (waiting[nx.step_number] || 0) + 1;
      }
    });
    return { by, waiting };
  }, [rows, steps]);

  const addOne = async (e) => {
    e.preventDefault();
    setAdding({ busy: true });
    const clean = (v) => String(v || '').replace(/[,\n]/g, ' ').trim();
    const line = [clean(form.name), form.email.trim(), clean(form.phone)].filter(Boolean).join(', ');
    const res = await backend.rpc('add_welcome_contacts', { p_lines: line, p_source: form.source });
    if (res.status !== 'success') { setAdding({ error: res.error || 'That did not work. Please try again.' }); return; }
    const d = res.data || {};
    if (d.added) {
      logActivity(user, 'added to welcome emails', 'Welcome List', form.name || form.email);
      setAdding({ done: `${form.name || form.email} is on the list. Their first email is going out now.` });
      setForm({ name: '', email: '', phone: '', source: form.source });
      reload();
    } else if (d.invalid) setAdding({ error: 'That does not look like an email address.' });
    else setAdding({ error: 'That address is already on the list, or the person unsubscribed. Look for them below.' });
  };

  const addMany = async (e) => {
    e.preventDefault();
    setManyState({ busy: true });
    const res = await backend.rpc('add_welcome_contacts', { p_lines: many, p_source: form.source });
    if (res.status === 'success') {
      const d = res.data || {};
      setManyState({ done: `Added ${d.added || 0}. ${d.skipped ? `${d.skipped} skipped because they are already on the list. ` : ''}${d.invalid ? `${d.invalid} lines had no email address and were left out.` : ''}`.trim() });
      if (d.added) { setMany(''); reload(); }
    } else setManyState({ error: res.error });
  };

  const act = async (c, action) => {
    setBusyId(c.id); setNote('');
    const res = await backend.rpc('welcome_contact_action', { p_id: c.id, p_action: action });
    setBusyId(null);
    if (res.status !== 'success') { setNote(res.error || 'That did not work.'); return; }
    logActivity(user, `welcome emails: ${action}`, 'Welcome List', c.email);
    setNote(action === 'send_now' ? `The next email to ${c.name || c.email} is on its way within a minute.` : '');
    reload();
  };

  const remove = async () => {
    const c = pendingRemove; setPendingRemove(null);
    const res = await dataFetch(`delete/welcome_contacts_church/${c.id}`, { method: 'DELETE' });
    if (res.status === 'success') { logActivity(user, 'removed from welcome emails', 'Welcome List', c.email); reload(); } else setNote(res.error);
  };

  const shown = rows.filter(c => (filter === 'all' || c.status === filter) && (!q.trim() || `${c.name} ${c.email}`.toLowerCase().includes(q.trim().toLowerCase())));
  const chip = (on) => `px-4 py-2 rounded-full text-sm font-bold ${on ? 'bg-[#1e2522] text-white' : 'bg-white border border-[#1e2522]/20 text-[#1e2522]'}`;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#1e2522]">Welcome List</h2>

      <section className="bg-white rounded-2xl border border-[#1e2522]/10 p-5 md:p-6" aria-label="Add a new person">
        <h3 className="text-lg font-bold">Add a new person</h3>
        <p className="text-sm text-black mt-1 max-w-3xl">Use this for someone who filled out a paper card or told you in person. Their first welcome email goes out right away, and the rest follow on schedule.</p>
        <form onSubmit={addOne} className="mt-4 grid md:grid-cols-4 gap-3 items-end">
          <label className="text-sm font-semibold">Name<input className={`${input} mt-1`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="off" /></label>
          <label className="text-sm font-semibold">Email (required)<input type="email" required className={`${input} mt-1`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="off" /></label>
          <label className="text-sm font-semibold">Phone (optional)<input className={`${input} mt-1`} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="off" /></label>
          <label className="text-sm font-semibold">How they came<select className={`${input} mt-1`} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>{SOURCES.map(s => <option key={s}>{s}</option>)}</select></label>
          <div className="md:col-span-4 flex flex-wrap items-center gap-3">
            <button type="submit" disabled={adding?.busy} className="bg-[#1e2522] text-white font-bold py-2.5 px-5 rounded-lg disabled:opacity-50">{adding?.busy ? 'Adding' : 'Add and start the emails'}</button>
            {adding && !adding.busy && <p role={adding.error ? 'alert' : 'status'} className={`text-sm font-semibold ${adding.error ? 'text-[#c74f2f]' : ''}`}>{adding.error || adding.done}</p>}
          </div>
        </form>
        <details className="mt-5">
          <summary className="cursor-pointer text-sm font-bold">Add several at once, from a stack of cards</summary>
          <form onSubmit={addMany} className="mt-3">
            <p className="text-sm text-black max-w-3xl">One person per line: name, email, and phone if you have it. They are added with the "How they came" choice above.</p>
            <label htmlFor="many" className="sr-only">People to add</label>
            <textarea id="many" rows={5} value={many} onChange={(e) => setMany(e.target.value)} placeholder={'Jane Smith, jane@example.com, 330 555 1212\nTom Lee, tom@example.com'} className={`${input} mt-2`} />
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button type="submit" disabled={manyState?.busy || !many.trim()} className={btn}>{manyState?.busy ? 'Adding' : 'Add them all'}</button>
              {manyState && !manyState.busy && <p role={manyState.error ? 'alert' : 'status'} className={`text-sm font-semibold ${manyState.error ? 'text-[#c74f2f]' : ''}`}>{manyState.error || manyState.done}</p>}
            </div>
          </form>
        </details>
      </section>

      <section aria-label="Where everyone is">
        <h3 className="text-lg font-bold mb-3">Where everyone is</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {steps.map(s => (
            <div key={s.id} className="bg-white rounded-xl border border-[#1e2522]/10 p-4">
              <p className="text-2xl font-bold">{counts.waiting[s.step_number] || 0}</p>
              <p className="text-xs text-black mt-1">waiting for email {s.step_number}</p>
              <p className="text-xs font-semibold mt-1 leading-tight">{s.subject}</p>
            </div>
          ))}
          <div className="bg-white rounded-xl border border-[#1e2522]/10 p-4"><p className="text-2xl font-bold">{counts.by.finished || 0}</p><p className="text-xs text-black mt-1">finished all emails</p></div>
          <div className="bg-white rounded-xl border border-[#1e2522]/10 p-4"><p className="text-2xl font-bold">{counts.by.paused || 0}</p><p className="text-xs text-black mt-1">paused</p></div>
          <div className="bg-white rounded-xl border border-[#1e2522]/10 p-4"><p className="text-2xl font-bold">{counts.by.unsubscribed || 0}</p><p className="text-xs text-black mt-1">unsubscribed</p></div>
        </div>
      </section>

      <section aria-label="The list">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {[['active', 'Active'], ['paused', 'Paused'], ['finished', 'Finished'], ['unsubscribed', 'Unsubscribed'], ['all', 'Everyone']].map(([k, label]) => (
            <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)} className={chip(filter === k)}>{label}{k !== 'all' ? ` (${counts.by[k] || 0})` : ` (${rows.length})`}</button>
          ))}
          <label className="sr-only" htmlFor="wl-search">Search the list</label>
          <input id="wl-search" type="search" placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} className="ml-auto px-3 py-2 rounded-lg border border-[#1e2522]/20 bg-white min-w-[14rem]" />
        </div>
        {note && <p role="status" className="mb-3 text-sm font-semibold">{note}</p>}
        {people.loading && !people.data ? <p className="text-black">Loading the list.</p> : people.error ? <p role="alert" className="text-[#c74f2f] font-semibold">{people.error}</p> : shown.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#1e2522]/10 p-8 text-center text-black">{rows.length === 0 ? 'No one is on the list yet. People who fill out the Connect Card or the contact form show up here on their own.' : 'No one matches that.'}</div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#1e2522]/10 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead><tr className="border-b border-[#1e2522]/10"><th className="p-3">Person</th><th className="p-3">Progress</th><th className="p-3">Next email</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
              <tbody>
                {shown.map(c => {
                  const p = progress(c);
                  const nextText = c.status === 'active' ? (p.next ? `${p.sent + 1}. ${p.next.subject}, ${when(c.next_send_at)}` : 'Nothing left to send') : c.status === 'paused' ? 'Paused' : c.status === 'finished' ? 'Done' : 'Unsubscribed';
                  return (
                    <tr key={c.id} className="border-b border-[#1e2522]/10 align-top">
                      <td className="p-3"><p className="font-bold">{c.name || '(no name)'}</p><p className="break-all">{c.email}</p><p className="text-xs text-black mt-1">{c.source}{c.created_at ? `, added ${new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : ''}</p></td>
                      <td className="p-3 min-w-[9rem]">
                        <div className="flex gap-1" role="img" aria-label={`${p.sent} of ${p.total} emails sent`}>
                          {steps.map(s => <span key={s.id} className={`h-2.5 flex-1 rounded-full ${s.step_number < c.next_step ? 'bg-[#c74f2f]' : 'bg-[#1e2522]/15'}`} />)}
                        </div>
                        <p className="mt-1.5 text-xs">{p.sent} of {p.total} sent{c.last_sent_at ? `, last on ${new Date(c.last_sent_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : ''}</p>
                      </td>
                      <td className="p-3 max-w-[16rem]">{nextText}</td>
                      <td className="p-3"><span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-[#EDE9DC]">{STATUS[c.status] || c.status}</span></td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          {c.status === 'active' && <button type="button" disabled={busyId === c.id} onClick={() => act(c, 'send_now')} className={btn}>Send next now</button>}
                          {c.status === 'active' && <button type="button" disabled={busyId === c.id} onClick={() => act(c, 'pause')} className={btn}>Pause</button>}
                          {c.status === 'paused' && <button type="button" disabled={busyId === c.id} onClick={() => act(c, 'resume')} className={btn}>Resume</button>}
                          {(c.status === 'finished' || c.status === 'paused') && <button type="button" disabled={busyId === c.id} onClick={() => act(c, 'restart')} className={btn}>Start over</button>}
                          {c.status !== 'unsubscribed' && <button type="button" disabled={busyId === c.id} onClick={() => act(c, 'unsubscribe')} className={btn}>Stop emails</button>}
                          <button type="button" onClick={() => setPendingRemove(c)} className={`${btn} !text-[#c74f2f]`}>Remove</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {pendingRemove && (
        <ConfirmDialog
          title="Remove this person?"
          message={`${pendingRemove.name || pendingRemove.email} will be taken off the list. If they were added again later, they would start from the first email. To stop their emails without removing them, use Stop emails instead.`}
          confirmLabel="Remove"
          onCancel={() => setPendingRemove(null)}
          onConfirm={remove}
        />
      )}
    </div>
  );
}
