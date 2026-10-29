import React, { useEffect, useMemo, useState } from 'react';
import { dataFetch } from '../../api';
import { useAuth } from '../../auth';
import { logActivity } from '../../lib/activity';
import { FORMS } from '../../content/forms';
import ConfirmDialog from '../../components/ConfirmDialog';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiLoader, FiDownload } = FiIcons;
const TABLE = 'form_submissions_church';

const label = (key) => FORMS[key]?.label || key;
const pretty = (k) => k.replace(/_/g, ' ').replace(/^./, c => c.toUpperCase());
const show = (v) => (Array.isArray(v) ? v.join(', ') : String(v));

function csvCell(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows) {
  const dataKeys = [...new Set(rows.flatMap(r => Object.keys(r.data || {})))];
  const head = ['Received', 'Form', 'Name', 'Email', 'Phone', 'Handled', ...dataKeys.map(pretty)];
  const lines = rows.map(r => [r.created_at, label(r.form_type), r.name, r.email, r.phone, r.handled === 1 ? 'Yes' : 'No', ...dataKeys.map(k => show(r.data?.[k] ?? ''))]);
  return [head, ...lines].map(l => l.map(csvCell).join(',')).join('\n');
}

export default function FormSubmissionsManager() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('new');
  const [open, setOpen] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = async () => {
    const res = await dataFetch(`read/${TABLE}?sort=id:desc&limit=500`);
    if (res.status === 'success') { setRows(res.data ?? []); setError(''); } else setError(`Could not load submissions: ${res.error}`);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const shown = useMemo(() => rows.filter(r => (!type || r.form_type === type) && (status === 'all' || (status === 'new' ? r.handled !== 1 : r.handled === 1))), [rows, type, status]);
  const newCount = rows.filter(r => r.handled !== 1).length;

  const toggleHandled = async (r) => {
    const next = r.handled === 1 ? 0 : 1;
    const res = await dataFetch(`update/${TABLE}/${r.id}`, { method: 'PUT', body: JSON.stringify({ handled: next }) });
    if (res.status === 'success') setRows(list => list.map(x => (x.id === r.id ? { ...x, handled: next } : x)));
    else setError(`Could not update: ${res.error}`);
  };

  const remove = async () => {
    const r = pendingDelete;
    setPendingDelete(null);
    const res = await dataFetch(`delete/${TABLE}/${r.id}`, { method: 'DELETE' });
    if (res.status === 'success') { setRows(list => list.filter(x => x.id !== r.id)); logActivity(user, 'deleted', 'Form Submissions', `${label(r.form_type)} from ${r.name || 'anonymous'}`); }
    else setError(`Delete failed: ${res.error}`);
  };

  const exportCsv = () => {
    const blob = new Blob([toCsv(shown)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form-submissions-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex justify-center p-12" role="status" aria-label="Loading"><SafeIcon icon={FiLoader} className="animate-spin text-3xl text-[#CCA866]" /></div>;

  return (
    <div>
      {error && <div role="alert" className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">{error}</div>}
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div>
          <label htmlFor="fs-type" className="block text-sm font-bold mb-1">Form</label>
          <select id="fs-type" value={type} onChange={(e) => setType(e.target.value)} className="px-3 py-2.5 bg-white rounded-lg border border-gray-200">
            <option value="">All forms</option>
            {Object.entries(FORMS).map(([k, f]) => <option key={k} value={k}>{f.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="fs-status" className="block text-sm font-bold mb-1">Show</label>
          <select id="fs-status" value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2.5 bg-white rounded-lg border border-gray-200">
            <option value="new">Not yet handled ({newCount})</option>
            <option value="done">Handled</option>
            <option value="all">Everything</option>
          </select>
        </div>
        <button type="button" onClick={exportCsv} disabled={shown.length === 0} className="ml-auto px-4 py-2.5 rounded-lg border border-gray-200 bg-white font-bold flex items-center gap-2 disabled:opacity-40">
          <SafeIcon icon={FiDownload} /> Export CSV
        </button>
      </div>

      {shown.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500">Nothing here.</div>
      ) : (
        <ul className="space-y-3">
          {shown.map(r => (
            <li key={r.id} className="bg-white rounded-xl border border-gray-100">
              <div className="p-4 flex flex-wrap items-center gap-3">
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${r.handled === 1 ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-800'}`}>{r.handled === 1 ? 'Handled' : 'New'}</span>
                <span className="font-bold">{label(r.form_type)}</span>
                <span className="text-gray-700">{r.name || 'No name'}</span>
                <span className="text-gray-500 text-sm">{[r.email, r.phone].filter(Boolean).join('  |  ')}</span>
                <span className="ml-auto text-sm text-gray-400">{r.created_at ? new Date(r.created_at).toLocaleString() : ''}</span>
              </div>
              <div className="px-4 pb-4 flex flex-wrap gap-2">
                <button type="button" aria-expanded={open === r.id} onClick={() => setOpen(open === r.id ? null : r.id)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-bold">{open === r.id ? 'Hide details' : 'Show details'}</button>
                <button type="button" onClick={() => toggleHandled(r)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-bold">{r.handled === 1 ? 'Mark as new' : 'Mark as handled'}</button>
                {r.email && <a href={`mailto:${r.email}`} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-bold">Reply by email</a>}
                <button type="button" onClick={() => setPendingDelete(r)} className="px-3 py-1.5 rounded-lg border border-red-200 text-red-700 text-sm font-bold">Delete</button>
              </div>
              {open === r.id && (
                <dl className="px-4 pb-4 grid sm:grid-cols-[12rem_1fr] gap-x-4 gap-y-2 text-sm">
                  {Object.entries(r.data || {}).length === 0 && <p className="text-gray-500 sm:col-span-2">No other details.</p>}
                  {Object.entries(r.data || {}).map(([k, v]) => (
                    <React.Fragment key={k}><dt className="font-bold text-gray-600">{pretty(k)}</dt><dd className="whitespace-pre-wrap break-words">{show(v)}</dd></React.Fragment>
                  ))}
                </dl>
              )}
            </li>
          ))}
        </ul>
      )}
      {pendingDelete && <ConfirmDialog title="Delete this submission?" message={`${label(pendingDelete.form_type)} from ${pendingDelete.name || 'anonymous'} will be permanently removed.`} onCancel={() => setPendingDelete(null)} onConfirm={remove} />}
    </div>
  );
}
