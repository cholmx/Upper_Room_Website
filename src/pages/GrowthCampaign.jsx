import React, { useEffect, useState } from 'react';
import usePageMeta from '../hooks/usePageMeta';
import useFetch from '../hooks/useFetch';
import { useSite } from '../settings';
import { Btn, Section, SectionHeader, PageHeader, Accordion } from '../components/ui';
import RichText from '../components/RichText';
import { CardSkeletons, ErrorState } from '../components/StateViews';

const TABS = [
  ['vision', 'Vision'],
  ['qa', 'Q&A'],
];

const slug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function GrowthCampaign() {
  usePageMeta('growth');
  const SITE = useSite();
  const { data, loading, error, reload } = useFetch('read/campaign_items_church?sort=sort_order_num:asc');
  const [tab, setTab] = useState('vision');

  // The tab can be opened from an address such as /growth-campaign#qa.
  useEffect(() => {
    const read = () => { const h = window.location.hash.slice(1); if (TABS.some(([k]) => k === h)) setTab(h); };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);
  const choose = (k) => { setTab(k); try { window.history.replaceState(null, '', `#${k}`); } catch { /* the address is left as it is */ } };

  const items = data || [];
  const visions = items.filter(i => i.kind === 'vision');
  const qas = items.filter(i => i.kind === 'qa');
  const C = SITE.campaign;

  const onKey = (e, k) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const i = TABS.findIndex(([x]) => x === k);
    const next = TABS[(i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length][0];
    choose(next);
    requestAnimationFrame(() => document.getElementById(`ctab-${next}`)?.focus());
  };

  return (
    <>
      <PageHeader kicker="Transforming Together" title="Growth Campaign" intro="We are making room for more people to encounter Jesus. Here is our vision, and answers to the questions we hear most.">
        <Btn href={C.give} variant="primary">Give to the Growth Campaign</Btn>
        <Btn href={C.pledge} variant="light">Submit Your Commitment Card</Btn>
      </PageHeader>

      <nav aria-label="Growth Campaign sections" className="sticky top-20 z-40 bg-white border-b border-[#1e2522]/10">
        <div role="tablist" className="max-w-[1312px] mx-auto px-6 md:px-14 flex gap-2 overflow-x-auto py-3">
          {TABS.map(([k, label]) => (
            <button key={k} id={`ctab-${k}`} type="button" role="tab" aria-selected={tab === k} aria-controls={`cpanel-${k}`} tabIndex={tab === k ? 0 : -1} onClick={() => choose(k)} onKeyDown={(e) => onKey(e, k)} className={`min-h-[44px] px-5 rounded-full font-display font-bold text-sm whitespace-nowrap ${tab === k ? 'bg-[#1e2522] text-white' : 'bg-[#EDE9DC] text-[#1e2522] hover:bg-[#1e2522]/15'}`}>{label}</button>
          ))}
        </div>
      </nav>

      <Section tone="gray">
        {loading && !data ? <CardSkeletons count={2} /> : error ? <ErrorState message={error} onRetry={reload} /> : (
          <>
            <div id="cpanel-vision" role="tabpanel" aria-labelledby="ctab-vision" hidden={tab !== 'vision'}>
              {visions.length === 0 ? <p className="text-black">The vision will be posted here.</p> : (
                <div className="max-w-3xl">
                  {visions.map(v => (
                    <article key={v.id} className="mb-12 bg-white rounded-[10px] elev-1 p-6 md:p-10">
                      <h2 className="text-3xl md:text-4xl mb-6">{v.title}</h2>
                      <RichText value={v.body} />
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div id="cpanel-qa" role="tabpanel" aria-labelledby="ctab-qa" hidden={tab !== 'qa'}>
              <SectionHeader title="Questions and answers" intro="Have a question that is not here? Email us and we will add it." />
              {qas.length === 0 ? <p className="text-black">Questions and answers will be posted here.</p> : (
                <div className="max-w-3xl">
                  <Accordion group="campaign-qa" items={qas.map(q => ({ id: `q-${slug(q.title)}`, title: q.title, content: <RichText value={q.body} /> }))} />
                  <p className="mt-6"><a className="underline underline-offset-4 font-semibold" href={`mailto:${SITE.email}?subject=Growth%20Campaign%20question`}>Ask a question</a></p>
                </div>
              )}
            </div>

          </>
        )}
      </Section>
    </>
  );
}
