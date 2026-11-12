import useNoIndex from '../../hooks/useNoIndex';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth';

export default function Login() {
  useNoIndex();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

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
        </form>
      </div>
    </div>
  );
}
