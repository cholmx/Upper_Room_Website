import React, { useEffect, useRef, useState } from 'react';
import { dataFetch } from '../../api';
import { useAuth } from '../../auth';
import { logActivity } from '../../lib/activity';
import { mergeSectionOrder } from '../../utils';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSave, FiLoader, FiChevronUp, FiChevronDown, FiMenu } = FiIcons;

const TABLE = 'home_section_order_church';

export const HOME_SECTIONS = [
  { key: 'campaign', label: 'Campaign banner' },
  { key: 'story', label: 'Our story' },
  { key: 'statement', label: 'Mission statement' },
  { key: 'wherewhen', label: 'Where and when' },
  { key: 'features', label: 'This week (sermon, Sunday, next event)' },
  { key: 'nextsteps', label: 'Next steps (visit, connect, serve, give)' },
  { key: 'latestposts', label: 'Latest blog posts' },
  { key: 'gallery', label: 'Photo gallery' },
  { key: 'photosections', label: 'Photo sections' },
];

export default function SectionOrderManager() {
  const { user } = useAuth();
  const [order, setOrder] = useState(HOME_SECTIONS.map(s => s.key));
  const [rows, setRows] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const dragKey = useRef(null);

  useEffect(() => {
    dataFetch(`read/${TABLE}?sort=sort_order_num_val:asc`).then(res => {
      if (res.status === 'success') {
        const data = res.data ?? [];
        setRows(Object.fromEntries(data.map(r => [r.section_key_name, r])));
        setOrder(mergeSectionOrder(data.map(r => r.section_key_name), HOME_SECTIONS.map(s => s.key)));
      } else {
        setMessage({ type: 'error', text: `Could not load layout: ${res.error}` });
      }
      setLoading(false);
    });
  }, []);

  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
  };

  const drop = (overKey) => {
    const from = order.indexOf(dragKey.current);
    const to = order.indexOf(overKey);
    dragKey.current = null;
    if (from < 0 || to < 0 || from === to) return;
    const next = [...order];
    next.splice(to, 0, next.splice(from, 1)[0]);
    setOrder(next);
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    const results = await Promise.all(order.map((key, i) => {
      const body = JSON.stringify({ section_key_name: key, sort_order_num_val: i + 1 });
      return rows[key]
        ? dataFetch(`update/${TABLE}/${rows[key].id}`, { method: 'PUT', body })
        : dataFetch(`create/${TABLE}`, { method: 'POST', body });
    }));
    setSaving(false);
    if (results.some(r => r.status !== 'success')) {
      setMessage({ type: 'error', text: 'Some sections could not be saved. Please try again.' });
      return;
    }
    const created = {};
    results.forEach((r, i) => { if (!rows[order[i]] && r.data?.id) created[order[i]] = { id: r.data.id, section_key_name: order[i] }; });
    setRows(prev => ({ ...prev, ...created }));
    logActivity(user, 'reordered', 'Home layout', 'Home page sections');
    setMessage({ type: 'success', text: 'Home page layout saved.' });
  };

  if (loading) {
    return <div className="flex justify-center p-12" role="status" aria-label="Loading"><SafeIcon icon={FiLoader} className="animate-spin text-3xl text-[#CCA866]" /></div>;
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
      <p className="text-gray-600 mb-6">Choose the order of the sections below the Home page banner. Drag a row by the handle, or use the arrows.</p>
      <ol className="space-y-2 mb-6">
        {order.map((key, i) => {
          const label = HOME_SECTIONS.find(s => s.key === key)?.label || key;
          return (
            <li
              key={key}
              draggable
              onDragStart={() => { dragKey.current = key; }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => drop(key)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 bg-gray-50"
            >
              <span className="text-gray-400 cursor-grab" aria-hidden="true"><SafeIcon icon={FiMenu} /></span>
              <span className="w-6 text-sm text-gray-400 font-bold">{i + 1}</span>
              <span className="flex-1 font-semibold">{label}</span>
              <button type="button" aria-label={`Move ${label} up`} disabled={i === 0} onClick={() => move(i, -1)} className="p-1.5 text-gray-500 hover:text-black disabled:opacity-30"><SafeIcon icon={FiChevronUp} /></button>
              <button type="button" aria-label={`Move ${label} down`} disabled={i === order.length - 1} onClick={() => move(i, 1)} className="p-1.5 text-gray-500 hover:text-black disabled:opacity-30"><SafeIcon icon={FiChevronDown} /></button>
            </li>
          );
        })}
      </ol>
      {message && (
        <div role={message.type === 'error' ? 'alert' : 'status'} className={`mb-6 p-4 rounded-lg text-sm font-medium ${message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>{message.text}</div>
      )}
      <div className="flex justify-end">
        <button onClick={save} disabled={saving} className="bg-[#0B1613] text-white font-bold py-3 px-8 rounded-lg hover:bg-black transition disabled:bg-gray-400 flex items-center gap-2">
          {saving ? <SafeIcon icon={FiLoader} className="animate-spin" /> : <SafeIcon icon={FiSave} />}
          {saving ? 'Saving...' : 'Save Layout'}
        </button>
      </div>
    </div>
  );
}
