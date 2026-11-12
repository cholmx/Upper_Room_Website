import React, { useEffect, useState } from 'react';
import { dataFetch } from '../../api';
import { SETTINGS_TABLE } from '../../settings';
import { useAuth } from '../../auth';
import { logActivity } from '../../lib/activity';

// A switch at the top of the Growth Campaign screen for the "Transforming Together" section on the Home page.
export default function CampaignHomeSwitch() {
  const { user } = useAuth();
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    let live = true;
    dataFetch(`read/${SETTINGS_TABLE}?limit=1`).then(res => {
      if (!live) return;
      if (res.status === 'success') setRow(res.data?.[0] ?? {});
      else setNote('Could not load this setting. If this keeps happening, apply the latest database update.');
      setLoading(false);
    });
    return () => { live = false; };
  }, []);

  const on = !row || (row.campaign_home_on !== 0 && row.campaign_home_on !== false);

  const toggle = async () => {
    setBusy(true); setNote('');
    const body = JSON.stringify({ campaign_home_on: on ? 0 : 1 });
    const res = row && row.id
      ? await dataFetch(`update/${SETTINGS_TABLE}/${row.id}`, { method: 'PUT', body })
      : await dataFetch(`create/${SETTINGS_TABLE}`, { method: 'POST', body });
    setBusy(false);
    if (res.status === 'success') {
      setRow(r => ({ ...(r || {}), id: (r && r.id) || res.data?.id, campaign_home_on: on ? 0 : 1 }));
      logActivity(user, on ? 'hid the Growth Campaign section on the Home page' : 'showed the Growth Campaign section on the Home page', 'Growth Campaign', '');
      setNote(on ? 'The section is hidden. Visitors see the change on their next page load.' : 'The section is showing again.');
    } else setNote(`That did not save. ${res.error || ''}`.trim());
  };

  if (loading) return null;
  return (
    <section aria-label="Home page section" className="mb-6 bg-white rounded-2xl border border-[#1e2522]/10 p-5 flex flex-wrap items-center justify-between gap-4">
      <div className="max-w-2xl">
        <p className="text-lg font-bold">{on ? 'The Growth Campaign section is showing on the Home page' : 'The Growth Campaign section is hidden on the Home page'}</p>
        <p className="text-sm text-black mt-1">This is the "Transforming Together" band with the Give and Learn More buttons. The Growth Campaign page itself stays up either way.</p>
        {note && <p role="status" className="mt-2 text-sm font-semibold">{note}</p>}
      </div>
      <button type="button" role="switch" aria-checked={on} onClick={toggle} disabled={busy} className={`px-5 py-2.5 rounded-full font-bold text-sm disabled:opacity-50 ${on ? 'bg-white border border-[#1e2522]/30' : 'bg-[#1e2522] text-white'}`}>
        {busy ? 'Saving' : on ? 'Hide it' : 'Show it'}
      </button>
    </section>
  );
}
