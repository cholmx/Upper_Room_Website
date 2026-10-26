import React, { useRef, useState } from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { publicDataFetch } from '../api';
import { useSite } from '../settings';
import PageHero from '../components/PageHero';

const KINDS = [
  { value: 'question', label: 'General question' },
  { value: 'prayer', label: 'Prayer request' },
  { value: 'visit', label: 'Planning a visit' },
];

export default function Contact() {
  const SITE = useSite();
  usePageMeta('Contact', 'Send a message or prayer request to Upper Room Fellowship.');
  const opened = useRef(Date.now());
  const [form, setForm] = useState({ name: '', email: '', kind: 'question', message: '', website: '' });
  const [status, setStatus] = useState({ state: 'idle', error: '' });

  const change = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    // Bots fill the hidden field or submit instantly; pretend success and drop it.
    if (form.website || Date.now() - opened.current < 3000) {
      setStatus({ state: 'sent', error: '' });
      return;
    }
    setStatus({ state: 'sending', error: '' });
    const res = await publicDataFetch('create/contact_messages_church', {
      method: 'POST',
      body: JSON.stringify({
        name: form.name.trim(),
        email: form.email.trim(),
        kind: form.kind,
        message: form.message.trim(),
        handled: 0,
      }),
    });
    if (res.status === 'success') {
      setStatus({ state: 'sent', error: '' });
      setForm({ name: '', email: '', kind: 'question', message: '', website: '' });
    } else {
      setStatus({ state: 'error', error: `We couldn't send that right now. You can also email ${SITE.email} or call ${SITE.phone}.` });
    }
  };

  const input = 'w-full px-4 py-3 bg-white rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#A6790F]';

  return (
    <div className="bg-[#F9F9F7] min-h-screen text-black pb-24 pt-20">
      <PageHero kicker="Get In Touch" title="Contact Us" subtitle="We would love to hear from you." image="https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=2000" />
      <div className="max-w-[1000px] mx-auto px-6 mt-16 grid md:grid-cols-5 gap-12">
        <div className="md:col-span-2 space-y-4 text-lg">
          <h2 className="text-3xl mb-4">Reach us</h2>
          <p><a className="font-bold hover:text-[#A6790F]" href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
          <p><a className="font-bold hover:text-[#A6790F]" href={SITE.phoneHref}>{SITE.phone}</a></p>
          <p><a className="hover:text-[#A6790F]" href={SITE.googleMapsUrl} target="_blank" rel="noopener noreferrer">{SITE.addressLine}</a></p>
          <p className="opacity-70">{SITE.serviceTime}</p>
        </div>

        <div className="md:col-span-3">
          {status.state === 'sent' ? (
            <div role="status" className="bg-white border border-black/5 rounded-3xl p-10 text-center">
              <h2 className="text-3xl mb-3">Thank you</h2>
              <p className="opacity-70 text-lg mb-6">Your message was sent. Someone from our team will follow up soon.</p>
              <button className="btn btn-outline border-black/30 text-black" onClick={() => setStatus({ state: 'idle', error: '' })}>Send another</button>
            </div>
          ) : (
            <form onSubmit={submit} className="bg-white border border-black/5 rounded-3xl p-8 md:p-10 space-y-6">
              <div>
                <label htmlFor="c-kind" className="block text-sm font-bold mb-2">What is this about?</label>
                <select id="c-kind" name="kind" value={form.kind} onChange={change} className={input}>
                  {KINDS.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
                </select>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="c-name" className="block text-sm font-bold mb-2">Name</label>
                  <input id="c-name" name="name" required maxLength={100} autoComplete="name" value={form.name} onChange={change} className={input} />
                </div>
                <div>
                  <label htmlFor="c-email" className="block text-sm font-bold mb-2">Email</label>
                  <input id="c-email" name="email" type="email" required maxLength={200} autoComplete="email" value={form.email} onChange={change} className={input} />
                </div>
              </div>
              <div>
                <label htmlFor="c-message" className="block text-sm font-bold mb-2">Message</label>
                <textarea id="c-message" name="message" required rows={6} maxLength={4000} value={form.message} onChange={change} className={input} />
              </div>
              {/* Honeypot: hidden from people and assistive tech */}
              <div aria-hidden="true" className="absolute -left-[9999px]">
                <label>Website<input tabIndex={-1} autoComplete="off" name="website" value={form.website} onChange={change} /></label>
              </div>
              {status.state === 'error' && <p role="alert" className="text-red-700 font-medium">{status.error}</p>}
              <button type="submit" disabled={status.state === 'sending'} className="btn btn-solid disabled:opacity-60">
                {status.state === 'sending' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
