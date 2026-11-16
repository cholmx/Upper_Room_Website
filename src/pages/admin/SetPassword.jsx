import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useNoIndex from '../../hooks/useNoIndex';
import { backend } from '../../lib/backend';
import { useAuth } from '../../auth';

const input = 'w-full px-3 py-2 text-sm bg-white border border-black/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9AB55] text-[#1C2A2B]';

// The page behind the link in an invitation or a password reset email: choose a password, then go to the admin.
export default function SetPassword() {
  useNoIndex();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { startSession } = useAuth();
  const type = params.get('type');
  const tokenHash = params.get('token_hash');
  const [state, setState] = useState('checking');
  const [error, setError] = useState('');
  const [pw, setPw] = useState('');
  const [again, setAgain] = useState('');
  const [busy, setBusy] = useState(false);
  const [invited, setInvited] = useState(type === 'invite');

  useEffect(() => {
    let live = true;
    (async () => {
      const res = await backend.verifyLink(type, tokenHash);
      if (!live) return;
      if (res.status === 'success') { setState('ready'); setInvited(type === 'invite'); }
      else { setError(res.error); setState('bad'); }
    })();
    return () => { live = false; };
  }, [type, tokenHash]);

  const save = async (e) => {
    e.preventDefault();
    setError('');
    if (pw.length < 10) { setError('Please use at least 10 characters.'); return; }
    if (pw !== again) { setError('The two passwords do not match.'); return; }
    setBusy(true);
    const res = await backend.updatePassword(pw);
    if (res.status !== 'success') { setBusy(false); setError(res.error || 'That did not save. Please try again.'); return; }
    const u = await startSession();
    setBusy(false);
    if (u && u.role) navigate('/admin', { replace: true });
    else navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F4ECDD] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm p-6 rounded-xl border border-black/10 shadow-sm">
        <h1 className="text-lg font-bold text-[#1C2A2B]">{invited ? 'Welcome to the team' : 'Choose a new password'}</h1>
        <p className="text-xs text-black/60 mb-4">Upper Room Fellowship admin</p>
        {state === 'checking' && <p role="status" className="text-sm text-[#1C2A2B]">One moment.</p>}
        {state === 'bad' && <p role="alert" className="text-sm text-[#1C2A2B]">{error}</p>}
        {state === 'ready' && (
          <form onSubmit={save} className="space-y-3" noValidate>
            {error && <div role="alert" className="bg-[#C65D3B]/10 border border-[#C65D3B] text-[#1C2A2B] p-2 rounded-lg text-xs font-medium">{error}</div>}
            <div>
              <label htmlFor="new-pw" className="block text-xs font-semibold text-[#1C2A2B] mb-1">New password (at least 10 characters)</label>
              <input id="new-pw" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} className={input} required />
            </div>
            <div>
              <label htmlFor="new-pw2" className="block text-xs font-semibold text-[#1C2A2B] mb-1">Type it again</label>
              <input id="new-pw2" type="password" autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} className={input} required />
            </div>
            <button type="submit" disabled={busy} className="w-full mt-1 py-2 text-sm font-semibold rounded-lg bg-[#1C2A2B] text-white hover:bg-[#F9AB55] hover:text-[#1C2A2B] disabled:opacity-60 transition-colors">{busy ? 'Saving...' : 'Save password and continue'}</button>
          </form>
        )}
      </div>
    </div>
  );
}
