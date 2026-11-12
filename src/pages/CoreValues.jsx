import React, { useState, useEffect, useRef } from 'react';
import usePageMeta from '../hooks/usePageMeta';
import useIsDesktop from '../hooks/useIsDesktop';
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

function ValueBody({ v, first }) {
  return (
    <>
      <p className={`${first ? '' : 'mt-6 '}lead`}>{v.thrive}</p>
      <div className="mt-4 space-y-4 text-[1rem] leading-relaxed text-black">
        {v.body.map(t => <p key={t}>{t}</p>)}
      </div>

      <h3 className="mt-8 mb-3 text-xl">In practice, this means:</h3>
      <ul className="space-y-2">
        {v.practices.map(p => (
          <li key={p} className="flex gap-3 text-[1rem] leading-snug text-black">
            <span aria-hidden="true" className="mt-[0.45em] w-2 h-2 rounded-full bg-[#4a6d65] shrink-0" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

// On phones the six values are a list. Tap one to open it right where it is, so there is no scrolling back and forth.
function ValueList() {
  const [open, setOpen] = useState(() => (typeof window !== 'undefined' && window.location.hash ? indexFromHash() : -1));
  const rows = useRef([]);

  useEffect(() => {
    const onHash = () => { if (window.location.hash) setOpen(indexFromHash()); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const toggle = i => {
    const next = open === i ? -1 : i;
    setOpen(next);
    if (next >= 0) {
      try { window.history.replaceState(null, '', `#${CORE_VALUES[next].id}`); } catch { /* ignore */ }
      setTimeout(() => { if (rows.current[next]) rows.current[next].scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50);
    }
  };

  return (
    <ul className="space-y-3">
      {CORE_VALUES.map((v, i) => {
        const on = i === open;
        return (
          <li key={v.id} ref={el => { rows.current[i] = el; }} style={{ scrollMarginTop: 92 }} className="bg-white rounded-[10px] overflow-hidden">
            <h3 className="!text-base">
              <button
                type="button"
                id={`value-head-${v.id}`}
                aria-expanded={on}
                aria-controls={`value-body-${v.id}`}
                onClick={() => toggle(i)}
                className="w-full flex items-center gap-4 text-left p-4 min-h-[64px]"
              >
                <span className="font-display font-bold text-2xl text-[#c74f2f] w-9 shrink-0">{String(v.n).padStart(2, '0')}</span>
                <span className="flex-1 font-display font-bold text-lg leading-tight text-[#1e2522]">{v.title}</span>
                <span aria-hidden="true" className={`shrink-0 text-2xl text-[#1e2522] transition-transform ${on ? 'rotate-45' : ''}`}>+</span>
              </button>
            </h3>
            {on && (
              <div id={`value-body-${v.id}`} role="region" aria-labelledby={`value-head-${v.id}`} className="px-5 pb-6 value-panel">
                <div className="mb-4"><ValueIcon n={v.n} size={72} /></div>
                <ValueBody v={v} first />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function ValueExplorer() {
  const [active, setActive] = useState(indexFromHash);
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
    try { window.history.replaceState(null, '', `#${CORE_VALUES[next].id}`); } catch { /* ignore */ }
    if (focus && tabs.current[next]) tabs.current[next].focus();
    else if (!focus && typeof window !== 'undefined' && window.innerWidth < 1024) {
      // Look the panel up after React has swapped it in.
      setTimeout(() => {
        const el = document.getElementById('value-panel');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  const onKey = (e, i) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); select(i + 1, true); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); select(i - 1, true); }
    else if (e.key === 'Home') { e.preventDefault(); select(0, true); }
    else if (e.key === 'End') { e.preventDefault(); select(CORE_VALUES.length - 1, true); }
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[340px_minmax(0,1fr)] gap-6 lg:gap-10 items-start">
      <div role="tablist" aria-label="Core values" className="grid grid-cols-1 min-[360px]:grid-cols-[repeat(2,minmax(0,1fr))] lg:grid-cols-1 gap-2.5 md:gap-3">
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
              className={`text-left rounded-[10px] p-3 md:p-4 flex flex-row items-center gap-3 min-[360px]:flex-col min-[360px]:items-start min-[360px]:gap-1 lg:flex-row lg:items-center lg:gap-4 min-h-[72px] transition-colors ${on ? 'bg-[#1e2522] text-white shadow-lg' : 'bg-white text-[#1e2522] hover:bg-white/70'}`}
            >
              <span className={`font-display font-bold text-xl md:text-2xl lg:w-9 shrink-0 ${on ? 'text-[#eaa235]' : 'text-[#c74f2f]'}`}>{String(val.n).padStart(2, '0')}</span>
              <span className="block">
                <span className="block font-display font-bold text-[0.95rem] md:text-lg leading-tight">{val.title}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div id="value-panel" role="tabpanel" style={{ scrollMarginTop: 96 }} aria-labelledby={`value-tab-${v.id}`} tabIndex={0} className="bg-white rounded-[10px] p-5 min-[400px]:p-6 md:p-10 value-panel min-w-0" key={v.id}>
        <div className="flex flex-col items-start gap-3 min-[400px]:flex-row min-[400px]:items-center min-[400px]:gap-5 md:gap-7">
          <ValueIcon n={v.n} size={80} />
          <div className="min-w-0">
            <p className="kicker text-[#c74f2f] !mb-1">Value {v.n} of {CORE_VALUES.length}</p>
            <h2 className="text-2xl min-[400px]:text-3xl md:text-4xl leading-[1.05] md:leading-[1.05] break-words">{v.title}</h2>
          </div>
        </div>

        <ValueBody v={v} />

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

function ValueChooser() {
  const desktop = useIsDesktop();
  return desktop ? <ValueExplorer /> : <ValueList />;
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
        <SectionHeader title="Explore the six values" intro="Open a value to see how we thrive in it and what it looks like in practice." className="!mb-8" />
        <ValueChooser />
      </Section>

      <PhotoBand slot="values-growing">
        <h2 className="text-3xl md:text-5xl mb-5">Growing in our values</h2>
        <p className="text-base leading-relaxed">{GROWING}</p>
        <div className="mt-6"><Btn to="/discipleship" variant="gold">Explore Adult Discipleship Training</Btn></div>
      </PhotoBand>
    </>
  );
}
