import React, { useEffect, useState } from 'react';
import { dataFetch } from '../../api';
import { useAuth } from '../../auth';
import { logActivity } from '../../lib/activity';
import { PHOTOS_TABLE } from '../../photos';
import { PHOTO_SLOTS } from '../../content/photos';
import { safeUrl } from '../../utils';
import FieldInput from './FieldInput';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSave, FiLoader } = FiIcons;

const GROUPS = [
  { kind: undefined, title: 'Photos', help: 'Each photo shows where its label says. Until one is added, the site shows the label as a placeholder.' },
  { kind: 'logo', title: 'Logos and sharing image', help: 'The dark logo sits on light backgrounds and the light logo on dark ones.' },
  { kind: 'model', title: '3D model', help: 'Paste a link to a .glb file from your architect or designer. Until then the site shows a simple concept model. Large files should be under 20 MB.' },
  { kind: 'icon', title: 'Core value icons', help: 'Small square icons shown beside each core value.' },
];

function Slot({ slot, row, onSaved }) {
  const { user } = useAuth();
  const [url, setUrl] = useState(row?.image_url || '');
  const [alt, setAlt] = useState(row?.alt_text || '');
  const [state, setState] = useState({ busy: false, msg: null });
  const dirty = url !== (row?.image_url || '') || alt !== (row?.alt_text || '');

  const save = async () => {
    if (url && !safeUrl(url)) { setState({ busy: false, msg: { type: 'error', text: 'Enter a full link starting with http:// or https://' } }); return; }
    setState({ busy: true, msg: null });
    const body = JSON.stringify({ slot_key: slot.key, image_url: url, alt_text: alt });
    const res = row?.id
      ? await dataFetch(`update/${PHOTOS_TABLE}/${row.id}`, { method: 'PUT', body })
      : await dataFetch(`create/${PHOTOS_TABLE}`, { method: 'POST', body });
    if (res.status === 'success') {
      logActivity(user, 'updated', 'Site Photos', slot.label);
      onSaved();
      setState({ busy: false, msg: { type: 'success', text: 'Saved' } });
    } else {
      setState({ busy: false, msg: { type: 'error', text: `Save failed: ${res.error}` } });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
      <div>
        <h3 className="font-bold text-gray-900">{slot.label.charAt(0).toUpperCase() + slot.label.slice(1)}</h3>
        <p className="text-xs text-gray-500">Slot: {slot.key}</p>
      </div>
      {slot.kind === 'model' ? (
        <div>
          <label htmlFor={`model-${slot.key}`} className="block text-sm font-bold text-gray-800 mb-2">Link to the .glb file</label>
          <input id={`model-${slot.key}`} type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:border-[#CCA866]" />
        </div>
      ) : (
        <FieldInput field={{ name: `photo-${slot.key}`, label: 'Image', type: 'image' }} value={url} onChange={(_, v) => setUrl(v)} />
      )}
      {slot.kind !== 'icon' && slot.kind !== 'logo' && slot.kind !== 'model' && (
        <div>
          <label htmlFor={`alt-${slot.key}`} className="block text-sm font-bold text-gray-800 mb-2">Description for screen readers</label>
          <input id={`alt-${slot.key}`} type="text" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder={slot.alt} className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:border-[#CCA866]" />
        </div>
      )}
      <div className="flex items-center gap-4">
        <button type="button" onClick={save} disabled={state.busy || !dirty} className="bg-[#0B1613] text-white font-bold py-2.5 px-6 rounded-lg hover:bg-black disabled:bg-gray-300 flex items-center gap-2">
          {state.busy ? <SafeIcon icon={FiLoader} className="animate-spin" /> : <SafeIcon icon={FiSave} />} Save
        </button>
        {state.msg && <span role={state.msg.type === 'error' ? 'alert' : 'status'} className={`text-sm font-medium ${state.msg.type === 'error' ? 'text-red-700' : 'text-green-700'}`}>{state.msg.text}</span>}
      </div>
    </div>
  );
}

export default function SitePhotosManager() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    const res = await dataFetch(`read/${PHOTOS_TABLE}`);
    if (res.status === 'success') { setRows(res.data ?? []); setError(''); } else setError(`Could not load photos: ${res.error}`);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  if (loading) return <div className="flex justify-center p-12" role="status" aria-label="Loading"><SafeIcon icon={FiLoader} className="animate-spin text-3xl text-[#CCA866]" /></div>;
  const byKey = Object.fromEntries(rows.map(r => [r.slot_key, r]));

  return (
    <div className="space-y-10">
      {error && <div role="alert" className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">{error}</div>}
      {GROUPS.map(g => (
        <section key={g.title} aria-labelledby={`grp-${g.title}`}>
          <h2 id={`grp-${g.title}`} className="text-xl font-bold mb-1">{g.title}</h2>
          <p className="text-gray-600 mb-4">{g.help}</p>
          <div className="grid xl:grid-cols-2 gap-5">
            {PHOTO_SLOTS.filter(s => s.kind === g.kind).map(s => <Slot key={s.key + (byKey[s.key]?.id || '')} slot={s} row={byKey[s.key]} onSaved={load} />)}
          </div>
        </section>
      ))}
    </div>
  );
}
