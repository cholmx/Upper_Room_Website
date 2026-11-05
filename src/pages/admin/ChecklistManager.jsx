import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { dataFetch } from '../../api';
import { CHECKLIST } from '../../content/checklist';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiLoader } = FiIcons;
export const CHECKLIST_TABLE = 'launch_checklist_church';

export default function ChecklistManager() {
  const [rows, setRows] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hideDone, setHideDone] = useState(false);

  useEffect(() => {
    dataFetch(`read/${CHECKLIST_TABLE}`).then(res => {
      if (res.status === 'success') setRows(Object.fromEntries((res.data ?? []).map(r => [r.item_key, r])));
      else setError(`Could not load saved progress: ${res.error}. Check marks will not stick until the checklist table exists.`);
      setLoading(false);
    });
  }, []);

  const doneCount = useMemo(() => CHECKLIST.filter(i => rows[i.id]?.done === 1).length, [rows]);

  const toggle = async (item) => {
    const row = rows[item.id];
    const next = row?.done === 1 ? 0 : 1;
    setRows(r => ({ ...r, [item.id]: { ...(row || { item_key: item.id }), done: next } }));
    const body = JSON.stringify({ item_key: item.id, done: next });
    const res = row?.id
      ? await dataFetch(`update/${CHECKLIST_TABLE}/${row.id}`, { method: 'PUT', body })
      : await dataFetch(`create/${CHECKLIST_TABLE}`, { method: 'POST', body });
    if (res.status === 'success') {
      if (!row?.id && res.data?.id) setRows(r => ({ ...r, [item.id]: { ...r[item.id], id: res.data.id } }));
      setError('');
    } else {
      setRows(r => ({ ...r, [item.id]: row || undefined }));
      setError(`Could not save: ${res.error}`);
    }
  };

  if (loading) return <div className="flex justify-center p-12" role="status" aria-label="Loading"><SafeIcon icon={FiLoader} className="animate-spin text-3xl text-[#c74f2f]" /></div>;

  const shown = CHECKLIST.filter(i => !(hideDone && rows[i.id]?.done === 1));
  const pct = Math.round((doneCount / CHECKLIST.length) * 100);

  return (
    <div>
      <p className="text-[#1e2522]/70 mb-4">Everything still shown in brackets on the site is listed here. Check an item once the real answer is on the site, and it stops being a reminder.</p>
      <div className="bg-white rounded-2xl border border-[#1e2522]/10 p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <p className="font-bold" aria-live="polite">{doneCount} of {CHECKLIST.length} confirmed</p>
          <label className="inline-flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} className="w-4 h-4" /> Hide finished items</label>
        </div>
        <div className="h-3 rounded-full bg-[#1e2522]/5 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Checklist progress">
          <div className="h-full bg-[#eaa235]" style={{ width: `${pct}%` }}></div>
        </div>
      </div>
      {error && <div role="alert" className="mb-4 p-4 rounded-lg bg-[#c74f2f]/10 border border-[#c74f2f] text-[#c74f2f] text-sm font-medium">{error}</div>}
      <ul className="bg-white rounded-2xl border border-[#1e2522]/10 divide-y divide-[#1e2522]/10">
        {shown.map(i => {
          const done = rows[i.id]?.done === 1;
          return (
            <li key={i.id} className="p-4 flex items-start gap-4">
              <input id={`chk-${i.id}`} type="checkbox" checked={done} onChange={() => toggle(i)} className="w-5 h-5 mt-1 accent-[#8A6309]" />
              <label htmlFor={`chk-${i.id}`} className="flex-grow cursor-pointer">
                <span className={`block font-medium ${done ? 'line-through text-[#1e2522]/50' : 'text-[#1e2522]'}`}>{i.label}</span>
                <span className="block text-sm text-[#1e2522]/70">{i.where}</span>
              </label>
              {i.route && <Link to={i.route} target="_blank" className="text-sm font-bold text-[#8A6309] underline">View page</Link>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
