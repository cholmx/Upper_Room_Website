import React, { useState, useEffect, useRef } from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { usePhoto } from '../photos';
import { CORE_VALUES, CORE_VALUES_INTRO, INSIDE_OUT, GROWING } from '../content/values';
import { Btn, Section, SectionHeader, PageHeader, PhotoBand } from '../components/ui';

// The icon comes from Site Photos in the admin, then from /images/core-values/core-value-N.png,
// and shows the value's number if neither exists yet.
function ValueIcon({ n, size }) {
  const { url } = usePhoto(`core-value-${n}`);
  const [failed, setFailed] = useState(false);
  const src = url || `/images/core-values/core-value-${n}.png`;
  if (failed && !url) {
    return <span aria-hidden="true" style={{ width: size, height: size }} className="rounded-full bg-[#c74f2f] text-white font-semibold flex items-center justify-center shrink-0">{n}</span>;
  }
  return <img src={src} alt="" width={size} height={size} loading="lazy" style={{ width: size, height: size }} className="value-icon object-contain shrink-0" onError={() => setFailed(true)} />;
}

function indexFromHash() {
  if (typeof window === 'undefined') return 0;
  const id = window.location.hash.replace('#', '');
  const i = CORE_VALUES.findIndex(v => v.id === id);
  return i >= 0 ? i : 0;
}

function ValueExplorer() {
  const [active, setActive] = useState(indexFromHash);
  const [showQuestion, setShowQuestion] = useState(false);
  const tabs = useRef([]);
  const v = CORE_VALUES[active];

  useEffect(() => {
    const onHash = () => setActive(indexFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const select = (i, focus) => {
    const next = (i + CORE_VALUES.length) % CORE_VALUES.length;
    setActive(next);
    setShowQuestion(false);
    try { window.history.replaceState(null, '', `#${CORE_VALUES[next].id}`); } catch { /* ignore */ }
    if (focus && tabs.current[next]) tabs.current[next].focus();
    else if (!focus && typeof window !== 'undefined' && window.innerWidth < 1024) {
      const el = document.getElementById('value-panel');
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
    }
  };

  const onKey = (e, i) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); select(i + 1, true); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); select(i - 1, true); }
    else if (e.key === 'Home') { e.preventDefault(); select(0, true); }
    else if (e.key === 'End') { e.preventDefault(); select(CORE_VALUES.length - 1, true); }
  };

  return (
    <div className="grid lg:grid-cols-[340px_1fr] gap-6 lg:gap-10 items-start">
      <div role="tablist" aria-label="Core values" className="grid grid-cols-2 lg:grid-cols-1 gap-3">
        {CORE_VALUES.map((val, i) => {
          const on = i === active;
          return (
            <button
              key={val.id}
              ref={el => { tabs.current[i] = el; }}
              role="tab"
              id={`value-tab-${val.id}`}
              aria-selected={on}
              aria-controls="value-panel"
              tabIndex={on ? 0 : -1}
              onClick={() => select(i)}
              onKeyDown={e => onKey(e, i)}
              className={`text-left rounded-[10px] p-4 flex items-center gap-4 min-h-[72px] transition-colors ${on ? 'bg-[#1e2522] text-white shadow-lg' : 'bg-white text-[#1e2522] hover:bg-white/70'}`}
            >
              <span className={`font-display font-bold text-2xl w-9 shrink-0 ${on ? 'text-[#eaa235]' : 'text-[#c74f2f]'}`}>{String(val.n).padStart(2, '0')}</span>
              <span className="block">
                <span className="block font-display font-bold text-base md:text-lg leading-tight">{val.title}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div id="value-panel" role="tabpanel" aria-labelledby={`value-tab-${v.id}`} tabIndex={0} className="bg-white rounded-[10px] p-6 md:p-10 value-panel" key={v.id}>
        <div className="flex items-center gap-5 md:gap-7">
          <ValueIcon n={v.n} size={96} />
          <div>
            <p className="kicker text-[#c74f2f] !mb-1">Value {v.n} of {CORE_VALUES.length}</p>
            <h2 className="text-3xl md:text-4xl leading-[1.05] md:leading-[1.05]">{v.title}</h2>
          </div>
        </div>

        <p className="mt-6 lead">{v.thrive}</p>
        <div className="mt-4 space-y-4 text-[1rem] leading-relaxed text-black">
          {v.body.map(t => <p key={t}>{t}</p>)}
        </div>

        <h3 className="mt-8 mb-3 text-xl">In practice, this means:</h3>
        <ul className="space-y-2">
          {v.practices.map(p => (
            <li key={p} className="flex gap-3 text-[1rem] leading-snug text-black">
              <span aria-hidden="true" className="mt-[0.45em] w-2 h-2 rounded-full bg-[#c74f2f] shrink-0" />
              <span>{p}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <button
            type="button"
            aria-expanded={showQuestion}
            onClick={() => setShowQuestion(s => !s)}
            className="inline-flex items-center min-h-[44px] px-5 rounded-full bg-[#EDE9DC] hover:bg-[#1e2522]/15 font-display font-bold text-[#1e2522]"
          >
            {showQuestion ? 'Hide the question' : 'Sit with a question'}
          </button>
          {showQuestion && (
            <p className="mt-4 rounded-[10px] bg-[#EDE9DC] p-5 font-serif italic text-[1.125rem] leading-relaxed text-black">{v.question}</p>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-[#1e2522]/10 flex items-center justify-between gap-3">
          <button type="button" onClick={() => select(active - 1)} className="inline-flex items-center min-h-[44px] px-4 rounded-full hover:bg-[#1e2522]/10 font-display font-bold text-[#1e2522]">
            <span aria-hidden="true" className="mr-2">&larr;</span>Previous
          </button>
          <button type="button" onClick={() => select(active + 1)} className="inline-flex items-center min-h-[44px] px-4 rounded-full hover:bg-[#1e2522]/10 font-display font-bold text-[#1e2522]">
            Next<span aria-hidden="true" className="ml-2">&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CoreValues() {
  usePageMeta('values');
  return (
    <>
      <PageHeader kicker="Core Values" title="Our Core Values" intro={CORE_VALUES_INTRO} />

      <Section tone="white">
        <div className="max-w-3xl">
          <SectionHeader title="Living from the inside out" className="!mb-6" />
          <p className="lead">{INSIDE_OUT}</p>
        </div>
      </Section>

      <Section tone="gray" id="values-explorer">
        <SectionHeader title="Explore the six values" intro="Choose a value to see what it means, how we practice it, and a question to sit with." className="!mb-8" />
        <ValueExplorer />
      </Section>

      <PhotoBand slot="values-growing">
        <h2 className="text-3xl md:text-5xl mb-5">Growing in our values</h2>
        <p className="text-base leading-relaxed">{GROWING}</p>
        <div className="mt-6"><Btn to="/discipleship" variant="primary">Explore Adult Discipleship Training</Btn></div>
      </PhotoBand>
    </>
  );
}
