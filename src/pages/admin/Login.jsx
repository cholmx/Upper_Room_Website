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
    <div className="min-h-screen bg-[#1e2522] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background Ambience */}

      <div className="bg-[#11201B] p-10 rounded-3xl shadow-2xl max-w-md w-full border border-white/10 relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
            Content Studio
          </h1>
          <p className="font-serif italic text-[#eaa235] text-sm">Upper Room Fellowship</p>
        </div>

        {error && (
          <div className="bg-[#c74f2f]/10 border border-[#c74f2f] text-[#c74f2f] p-4 rounded-xl mb-6 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="login-email" className="block text-[0.9rem] font-bold tracking-wide mb-3 text-white/70">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#eaa235] focus:border-transparent text-white placeholder-white/20"
              required
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-[0.9rem] font-bold tracking-wide mb-3 text-white/70">
              Studio Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#eaa235] focus:border-transparent text-white placeholder-white/20"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full disabled:opacity-60 bg-[#eaa235] text-[#1e2522] font-bold text-sm tracking-wide py-4 rounded-xl hover:bg-white transition-colors shadow-[0_0_20px_rgba(255,196,79,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
          >
            {submitting ? 'Signing in...' : 'Enter Studio'}
          </button>
        </form>
      </div>
    </div>
  );
}