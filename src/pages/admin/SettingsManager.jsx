import React, { useEffect, useState } from 'react';
import { dataFetch } from '../../api';
import { useAuth } from '../../auth';
import { logActivity } from '../../lib/activity';
import { SETTINGS_TABLE } from '../../settings';
import FieldInput from './FieldInput';
import { validate } from './validate';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSave, FiLoader } = FiIcons;

const FIELDS = [
  { name: 'announcement_text', label: 'Announcement bar text (leave blank for none)', type: 'text' },
  { name: 'announcement_url', label: 'Announcement link (optional)', type: 'url' },
  { name: 'service_time', label: 'Service Time (for example Sundays at 10:30am)', type: 'text', required: true },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'email', label: 'Public Email', type: 'text' },
  { name: 'street', label: 'Street Address', type: 'text' },
  { name: 'city', label: 'City', type: 'text' },
  { name: 'region', label: 'State', type: 'text' },
  { name: 'postal_code', label: 'ZIP Code', type: 'text' },
  { name: 'give_url', label: 'Giving Link', type: 'url' },
  { name: 'facebook_url', label: 'Facebook Link', type: 'url' },
  { name: 'instagram_url', label: 'Instagram Link', type: 'url' },
  { name: 'youtube_url', label: 'YouTube Link', type: 'url' },
];

export default function SettingsManager() {
  const { user } = useAuth();
  const [row, setRow] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);

  useEffect(() => {
    dataFetch(`read/${SETTINGS_TABLE}?limit=1`).then(res => {
      if (res.status === 'success') setRow(res.data?.[0] ?? {});
      else setMessage({ type: 'error', text: `Could not load settings: ${res.error}` });
      setLoading(false);
    });
  }, []);

  const change = (name, value) => {
    setRow(r => ({ ...r, [name]: value }));
    setErrors(e => ({ ...e, [name]: undefined }));
  };

  const save = async (e) => {
    e.preventDefault();
    const found = validate(FIELDS, row);
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }
    setSaving(true);
    setMessage(null);
    const body = JSON.stringify(Object.fromEntries(FIELDS.map(f => [f.name, row[f.name] || ''])));
    const res = row.id
      ? await dataFetch(`update/${SETTINGS_TABLE}/${row.id}`, { method: 'PUT', body })
      : await dataFetch(`create/${SETTINGS_TABLE}`, { method: 'POST', body });
    setSaving(false);
    if (res.status === 'success') {
      if (!row.id && res.data?.id) setRow(r => ({ ...r, id: res.data.id }));
      logActivity(user, 'updated', 'Settings', 'Site settings');
      setMessage({ type: 'success', text: 'Settings saved. Visitors see the changes on their next page load.' });
    } else {
      setMessage({ type: 'error', text: `Save failed: ${res.error}` });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12" role="status" aria-label="Loading"><SafeIcon icon={FiLoader} className="animate-spin text-3xl text-[#CCA866]" /></div>;
  }

  return (
    <form onSubmit={save} noValidate className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
      <p className="text-gray-600">These details appear across the site. Leave a field blank to use the built-in default.</p>
      {FIELDS.map(f => <FieldInput key={f.name} field={f} value={row[f.name]} onChange={change} error={errors[f.name]} />)}
      {message && (
        <div role={message.type === 'error' ? 'alert' : 'status'} className={`p-4 rounded-lg text-sm font-medium ${message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>{message.text}</div>
      )}
      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="bg-[#0B1613] text-white font-bold py-3 px-8 rounded-lg hover:bg-black transition disabled:bg-gray-400 flex items-center gap-2">
          {saving ? <SafeIcon icon={FiLoader} className="animate-spin" /> : <SafeIcon icon={FiSave} />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
}
