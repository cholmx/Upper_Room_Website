import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useNoIndex from '../hooks/useNoIndex';
import usePageMeta from '../hooks/usePageMeta';
import { backend } from '../lib/backend';
import { useSite } from '../settings';
import { Btn, Section } from '../components/ui';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The page behind the unsubscribe link at the bottom of each welcome email.
export default function Unsubscribe() {
  useNoIndex();
  usePageMeta('Unsubscribe | Upper Room Fellowship', 'Stop the welcome emails from Upper Room Fellowship.');
  const SITE = useSite();
  const [params] = useSearchParams();
  const token = (params.get('t') || '').trim();
  const [state, setState] = useState(UUID.test(token) ? 'working' : 'bad');

  useEffect(() => {
    if (!UUID.test(token)) return;
    let live = true;
    backend.rpc('unsubscribe_welcome', { p_token: token }).then(res => {
      if (!live) return;
      setState(res.status === 'success' && res.data ? 'done' : res.status === 'success' ? 'bad' : 'error');
    });
    return () => { live = false; };
  }, [token]);

  return (
    <Section tone="white" narrow>
      <div className="py-8">
        {state === 'working' && <p role="status" className="text-black">One moment.</p>}
        {state === 'done' && (
          <>
            <h1 className="text-3xl md:text-5xl mb-4">You are unsubscribed</h1>
            <p className="text-black max-w-[55ch]">You will not get any more welcome emails from Upper Room Fellowship. If you ever have a question or would like to visit, we would love to hear from you.</p>
            <div className="mt-6"><Btn to="/" variant="primary">Go to the home page</Btn></div>
          </>
        )}
        {(state === 'bad' || state === 'error') && (
          <>
            <h1 className="text-3xl md:text-5xl mb-4">{state === 'bad' ? 'That link did not work' : 'We could not do that just now'}</h1>
            <p className="text-black max-w-[55ch]">{state === 'bad' ? 'The unsubscribe link may be old or incomplete.' : 'Please try the link again in a few minutes.'} You can also email <a className="underline underline-offset-4 font-semibold" href={`mailto:${SITE.email}?subject=Unsubscribe`}>{SITE.email}</a> and we will take you off the list.</p>
          </>
        )}
      </div>
    </Section>
  );
}
