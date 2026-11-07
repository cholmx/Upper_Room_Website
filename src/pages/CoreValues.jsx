import React, { useState } from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { usePhoto } from '../photos';
import { CORE_VALUES, CORE_VALUES_INTRO, INSIDE_OUT, GROWING } from '../content/values';
import { Btn, Section, SectionHeader, PageHeader, PhotoSplit } from '../components/ui';

// The icon comes from Site Photos in the admin, then from /images/core-values/core-value-N.png,
// and shows the value's number if neither exists yet.
function ValueIcon({ n }) {
  const { url } = usePhoto(`core-value-${n}`);
  const [failed, setFailed] = useState(false);
  const src = url || `/images/core-values/core-value-${n}.png`;
  if (failed && !url) {
    return <span aria-hidden="true" className="w-[132px] h-[132px] md:w-[200px] md:h-[200px] rounded-full bg-[#c74f2f] text-white text-5xl font-semibold flex items-center justify-center">{n}</span>;
  }
  return <img src={src} alt="" width="200" height="200" loading="lazy" className="w-[132px] h-[132px] md:w-[200px] md:h-[200px] object-contain" onError={() => setFailed(true)} />;
}

export default function CoreValues() {
  usePageMeta('values');
  return (
    <>
      <PageHeader kicker="Core Values" title="Our Core Values" intro={CORE_VALUES_INTRO} />

      <PhotoSplit tone="white" slot="values-intro" side="right">
        <SectionHeader title="Living from the inside out" className="!mb-6" />
        <p className="lead">{INSIDE_OUT}</p>
      </PhotoSplit>

      <ol className="contents">
        {CORE_VALUES.map(v => {
          const dark = v.n % 2 === 1;
          return (
            <li key={v.id} id={v.id} className="contents">
              <Section tone={dark ? 'tan' : 'white'}>
                <div className="grid md:grid-cols-[220px_1fr] gap-8 md:gap-14 items-center">
                  <div className="flex md:flex-col items-center md:items-start gap-5">
                    <ValueIcon n={v.n} />
                    <span className={`font-display font-bold text-5xl md:text-6xl text-[#c74f2f]`}>{String(v.n).padStart(2, '0')}</span>
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-4xl mb-4">{v.title}</h2>
                    <p className={`text-[0.95rem] leading-relaxed text-[#1e2522]/80`}>{v.body}</p>
                    <p className={`mt-5 rounded-[10px] p-5 text-[0.95rem] leading-relaxed ${dark ? 'bg-white/60' : 'bg-[#1e2522]/5'} text-[#1e2522]/80`}>{v.practice}</p>
                  </div>
                </div>
              </Section>
            </li>
          );
        })}
      </ol>

      <PhotoSplit tone="white" slot="values-growing" side="left">
        <SectionHeader title="Growing in our values" className="!mb-6" />
        <p className="text-[0.95rem] leading-relaxed text-[#1e2522]/80">{GROWING}</p>
        <div className="mt-6"><Btn to="/discipleship" variant="primary">Explore Adult Discipleship Training</Btn></div>
      </PhotoSplit>
    </>
  );
}
