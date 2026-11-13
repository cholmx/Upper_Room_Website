import React, { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import { backend } from '../../lib/backend';
import { useAuth } from '../../auth';
import { logActivity } from '../../lib/activity';
import ConfirmDialog from '../../components/ConfirmDialog';

const btn = 'px-3 py-1.5 rounded-lg border border-[#1e2522]/20 bg-white font-bold text-sm disabled:opacity-40';
const input = 'w-full px-3 py-2 rounded-lg border border-[#1e2522]/20 bg-white';
const card = 'bg-white rounded-2xl border border-[#1e2522]/10 p-5 md:p-6';

const day = (iso) => {
  const d = iso ? new Date(iso) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
};

// The team: who can sign in to the admin, and what they can do. Only admins see this screen.
export default function TeamManager() {
  const { user } = useAuth();
  const team = useFetch('read/staff_roles_church?sort=created_at:asc', { admin: true });
  const rows = team.data || [];
  const [form, setForm] = useState({ name: '', email: '', role: 'editor' });
  const [state, setState] = useState(null);
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState('');
  const [note, setNote] = useState('');
  const [pendingRemove, setPendingRemove] = useState(null);
  const [copied, setCopied] = useState(false);

  const call = async (body) => backend.post('staff-admin', body);

  const invite = async (e) => {
    e.preventDefault();
    setState({ busy: true }); setLink(''); setCopied(false);
    const res = await call({ action: 'invite', name: form.name, email: form.email, role: form.role });
    if (res.status === 'success') {
      setState({ done: `An invitation is on its way to ${form.email}. It sends within a minute.` });
      setLink(res.data?.link || '');
      logActivity(user, 'invited to the team', 'Team', form.email);
      setForm({ name: '', email: '', role: form.role });
      team.reload();
    } else setState({ error: res.error });
  };

  const resend = async (r) => {
    setBusy(r.user_id); setNote(''); setLink(''); setCopied(false);
    const res = await call({ action: 'resend', email: r.email });
    setBusy('');
    if (res.status === 'success') { setNote(`A new link was sent to ${r.email}.`); setLink(res.data?.link || ''); team.reload(); } else setNote(res.error);
  };

  const changeRole = async (r, role) => {
    setBusy(r.user_id); setNote('');
    const res = await call({ action: 'set_role', user_id: r.user_id, role });
    setBusy('');
    if (res.status === 'success') { logActivity(user, `changed role to ${role}`, 'Team', r.email); team.reload(); } else setNote(res.error);
  };

  const remove = async () => {
    const r = pendingRemove; setPendingRemove(null);
    setBusy(r.user_id); setNote('');
    const res = await call({ action: 'remove', user_id: r.user_id });
    setBusy('');
    if (res.status === 'success') { logActivity(user, 'removed from the team', 'Team', r.email); setNote(`${r.email} was removed and can no longer sign in.`); team.reload(); } else setNote(res.error);
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(link); setCopied(true); } catch { setCopied(false); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#1e2522]">Team</h2>

      <section className={card} aria-label="What each role can do">
        <p className="text-sm text-black max-w-3xl"><strong>Admins</strong> can do everything. <strong>Editors</strong> can use the Inbox (form submissions, the welcome emails and the weekly email) and write Blog Posts. Everything else is hidden from them, and the database blocks it too.</p>
      </section>

      <section className={card} aria-label="Invite someone">
        <h3 className="text-lg font-bold">Invite someone</h3>
        <p className="text-sm text-black mt-1 max-w-3xl">They get an email with a link to choose a password. The link works once and lasts a day.</p>
        <form onSubmit={invite} className="mt-4 grid md:grid-cols-[1fr_1fr_160px_auto] gap-3 items-end">
          <label className="text-sm font-semibold">Name<input className={`${input} mt-1`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="off" /></label>
          <label className="text-sm font-semibold">Email (required)<input type="email" required className={`${input} mt-1`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="off" /></label>
          <label className="text-sm font-semibold">Role
            <select className={`${input} mt-1`} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <button type="submit" disabled={state?.busy} className={`${btn} !bg-[#1e2522] !text-white`}>{state?.busy ? 'Sending' : 'Send invite'}</button>
        </form>
        {state?.done && <p role="status" className="mt-3 text-sm font-semibold">{state.done}</p>}
        {state?.error && <p role="alert" className="mt-3 text-sm font-semibold text-[#c74f2f]">{state.error}</p>}
      </section>

      {link && (
        <section className={card} aria-label="Invite link">
          <p className="text-sm font-semibold">If the email does not arrive, you can send this link yourself. It works once.</p>
          <div className="mt-2 flex flex-wrap gap-2 items-center">
            <input readOnly value={link} onFocus={(e) => e.target.select()} className={`${input} flex-1 min-w-[16rem] text-xs`} aria-label="Invite link" />
            <button type="button" onClick={copy} className={btn}>{copied ? 'Copied' : 'Copy'}</button>
          </div>
        </section>
      )}

      <section className={card} aria-label="People on the team">
        <h3 className="text-lg font-bold">People on the team</h3>
        {note && <p role="status" className="mt-2 text-sm font-semibold">{note}</p>}
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b border-[#1e2522]/15"><th className="py-2 pr-3">Name</th><th className="py-2 pr-3">Email</th><th className="py-2 pr-3">Role</th><th className="py-2 pr-3">Added</th><th className="py-2"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {rows.map(r => {
                const me = r.user_id === user?.id;
                return (
                  <tr key={r.user_id} className="border-b border-[#1e2522]/10">
                    <td className="py-2 pr-3">{r.name || ''}{me ? <span className="ml-2 text-xs text-black/60">(you)</span> : null}</td>
                    <td className="py-2 pr-3">{r.email}</td>
                    <td className="py-2 pr-3">
                      <select aria-label={`Role for ${r.email}`} value={r.role} disabled={me || busy === r.user_id} onChange={(e) => changeRole(r, e.target.value)} className="px-2 py-1 rounded-lg border border-[#1e2522]/20 bg-white">
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-2 pr-3">{day(r.created_at)}</td>
                    <td className="py-2 whitespace-nowrap">
                      <button type="button" onClick={() => resend(r)} disabled={busy === r.user_id} className="font-bold underline underline-offset-2 mr-4">Send a new link</button>
                      {!me && <button type="button" onClick={() => setPendingRemove(r)} disabled={busy === r.user_id} className="text-[#c74f2f] font-bold underline underline-offset-2">Remove</button>}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && <tr><td colSpan={5} className="py-4 text-black">No one is on the team yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {pendingRemove && (
        <ConfirmDialog
          title="Remove this person?"
          message={`${pendingRemove.name || pendingRemove.email} will no longer be able to sign in. You can invite them again later.`}
          confirmLabel="Remove"
          onCancel={() => setPendingRemove(null)}
          onConfirm={remove}
        />
      )}
    </div>
  );
}
