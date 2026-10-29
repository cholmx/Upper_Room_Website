import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth';
import { motion } from 'framer-motion';

export default function Login() {
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
    <div className="min-h-screen bg-[#0B1613] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FFC44F] rounded-full blur-[150px] opacity-20 animate-pulse" style={{ animationDuration: '4s' }}></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#CCA866] rounded-full blur-[150px] opacity-10 animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-[#11201B]/80 backdrop-blur-2xl p-10 rounded-3xl shadow-2xl max-w-md w-full border border-white/10 relative z-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black uppercase text-white mb-2 tracking-tight">
            Content Studio
          </h1>
          <p className="font-serif italic text-[#FFC44F] text-sm">Upper Room Fellowship</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 text-sm font-medium text-center">
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="login-email" className="block text-[0.75rem] font-bold uppercase tracking-wider mb-3 text-white/50">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFC44F] focus:border-transparent transition-all text-white placeholder-white/20"
              required
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-[0.75rem] font-bold uppercase tracking-wider mb-3 text-white/50">
              Studio Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFC44F] focus:border-transparent transition-all text-white placeholder-white/20"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full disabled:opacity-60 bg-[#FFC44F] text-[#0B1613] font-bold uppercase text-xs tracking-widest py-4 rounded-xl hover:bg-white transition-colors shadow-[0_0_20px_rgba(255,196,79,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
          >
            {submitting ? 'Signing in...' : 'Enter Studio'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}