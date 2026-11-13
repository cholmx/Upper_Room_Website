import useNoIndex from '../../hooks/useNoIndex';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth';
import { backend } from '../../lib/backend';

export default function Login() {
  useNoIndex();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState('signin');
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleForgot = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const res = await backend.post('staff-admin', { action: 'forgot', email: email.trim() }, { signedIn: false });
    setSubmitting(false);
    if (res.status === 'success') setSent(true);
    else setError(res.error || 'That did not work. Please try again.');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await login(email.trim(), password);
    setSubmitting(false);
    if (result.ok) {
      navigate('/admin');
    } else {
      setError(result.error || 'Unable to sign in');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f3ee] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xs p-6 rounded-xl border border-black/10 shadow-sm">
        <div className="mb-5">
          <h1 className="text-lg font-bold text-[#1e2522]">Admin</h1>
          <p className="text-xs text-black/60">Upper Room Fellowship</p>
        </div>

        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 text-[#9a3a1f] p-2 rounded-lg mb-4 text-xs font-medium">
            {error}
          </div>
        )}

        {mode === 'forgot' ? (
          sent ? (
            <div role="status" className="space-y-3 text-sm text-[#1e2522]">
              <p>If that email belongs to the team, a link to choose a new password is on its way. It can take a few minutes.</p>
              <button type="button" onClick={() => { setMode('signin'); setSent(false); }} className="font-semibold underline underline-offset-2">Back to sign in</button>
            </div>
          ) : (
            <form onSubmit={handleForgot} className="space-y-3">
              <p className="text-xs text-black/70">Enter your email and we will send you a link to choose a new password.</p>
              <div>
                <label htmlFor="forgot-email" className="block text-xs font-semibold text-[#1e2522] mb-1">Email</label>
                <input id="forgot-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-black/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eaa235] text-[#1e2522]" required />
              </div>
              <button type="submit" disabled={submitting} className="w-full mt-1 py-2 text-sm font-semibold rounded-lg bg-[#1e2522] text-white hover:bg-[#eaa235] hover:text-[#1e2522] disabled:opacity-60 transition-colors">{submitting ? 'Sending...' : 'Send me a link'}</button>
              <button type="button" onClick={() => { setMode('signin'); setError(''); }} className="w-full text-xs font-semibold underline underline-offset-2 text-[#1e2522]">Back to sign in</button>
            </form>
          )
        ) : (
        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-[#1e2522] mb-1">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eaa235] text-[#1e2522]"
              required
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-xs font-semibold text-[#1e2522] mb-1">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#eaa235] text-[#1e2522]"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-1 py-2 text-sm font-semibold rounded-lg bg-[#1e2522] text-white hover:bg-[#eaa235] hover:text-[#1e2522] disabled:opacity-60 transition-colors"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
          <button type="button" onClick={() => { setMode('forgot'); setError(''); }} className="w-full text-xs font-semibold underline underline-offset-2 text-[#1e2522]">Forgot your password?</button>
        </form>
        )}
      </div>
    </div>
  );
}
