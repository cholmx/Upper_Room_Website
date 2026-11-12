import React, { useState } from 'react';
import { backend } from '../lib/backend';

const field = 'neu-field w-full min-h-[48px] px-4 py-3 rounded-xl border border-[#1e2522]/25 focus:outline-none focus:ring-2 focus:ring-[#1e2522] focus:border-[#1e2522] text-base text-black bg-white';

// Sign up for the weekly email. The "website" box is hidden and is a trap for bots, so it must stay empty.
export default function WeeklySignup({ variant = 'band', source = 'Website' }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [trap, setTrap] = useState('');
  const [state, setState] = useState({ status: 'idle', message: '' });
  const dark = variant === 'footer';
  const id = `weekly-${variant}`;

  const submit = async (e) => {
    e.preventDefault();
    if (state.status === 'busy') return;
    setState({ status: 'busy', message: '' });
    const res = await backend.rpc('subscribe_weekly', { p_name: name.trim(), p_email: email.trim(), p_website: trap, p_source: source });
    if (res.status === 'success' && res.data === 'ok') {
      setState({ status: 'done', message: 'You are on the list. Watch for a short confirmation email, and the first weekly email on Wednesday morning.' });
      setName(''); setEmail('');
    } else if (res.status === 'success' && res.data === 'invalid') {
      setState({ status: 'error', message: 'That email address does not look right. Please check it and try again.' });
    } else if (res.status === 'success' && res.data === 'busy') {
      setState({ status: 'error', message: 'A lot of people are signing up right now. Please try again in a little while.' });
    } else {
      setState({ status: 'error', message: 'We could not sign you up just now. Please try again in a few minutes.' });
    }
  };

  const form = (
    state.status === 'done' ? (
      <p role="status" className={`${dark ? 'text-white' : 'text-black'} font-semibold`}>{state.message}</p>
    ) : (
      <form onSubmit={submit} noValidate className={dark ? 'grid gap-3 sm:grid-cols-[1fr_1fr_auto] items-end' : 'grid gap-4 md:grid-cols-[1fr_1fr_auto] items-end'}>
        <div>
          <label htmlFor={`${id}-name`} className={`block text-sm font-semibold mb-1 ${dark ? 'text-white' : ''}`}>First name <span className="font-normal opacity-70">(optional)</span></label>
          <input id={`${id}-name`} name="name" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} className={field} />
        </div>
        <div>
          <label htmlFor={`${id}-email`} className={`block text-sm font-semibold mb-1 ${dark ? 'text-white' : ''}`}>Email</label>
          <input id={`${id}-email`} name="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} aria-describedby={state.status === 'error' ? `${id}-err` : undefined} className={field} />
        </div>
        <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
          <label>Website<input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} /></label>
        </div>
        <button type="submit" disabled={state.status === 'busy'} className={`min-h-[48px] px-6 rounded-full font-display font-bold disabled:opacity-60 ${dark ? 'bg-[#eaa235] text-[#1e2522] hover:bg-white' : 'bg-[#c74f2f] text-white hover:bg-[#a83f23]'}`}>
          {state.status === 'busy' ? 'Signing up' : 'Sign me up'}
        </button>
        {state.status === 'error' && <p id={`${id}-err`} role="alert" className={`md:col-span-3 text-sm font-semibold ${dark ? 'text-[#eaa235]' : 'text-[#c74f2f]'}`}>{state.message}</p>}
      </form>
    )
  );

  if (dark) {
    return (
      <div className="px-6 md:px-10 py-10 md:py-12 border-b border-white/10 relative z-10">
        <div className="max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white">The weekly URF email</h2>
          <p className="mt-2 mb-5 text-[0.95rem] text-white/85">Every Wednesday morning: last Sunday’s message, a thought for the week, and what is happening at church in the next seven days.</p>
          {form}
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-3xl">
      <h2 className="text-3xl md:text-5xl mb-4">The weekly URF email</h2>
      <p className="text-[1rem] leading-relaxed text-black mb-6">Every Wednesday morning we send one short email with last Sunday’s message, a thought for the week, and the events coming up in the next seven days. You can leave at any time.</p>
      {form}
    </div>
  );
}
