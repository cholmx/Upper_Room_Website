import React, { useState } from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { usePhoto } from '../photos';
import { CORE_VALUES, CORE_VALUES_INTRO, INSIDE_OUT, GROWING } from '../content/values';
import { Btn, Section, SectionHeader, PageHeader } from '../components/ui';

// The icon comes from Site Photos in the admin, then from /images/core-values/core-value-N.png,
// and shows the value's number if neither exists yet.
function ValueIcon({ n }) {
  const { url } = usePhoto(`core-value-${n}`);
  const [failed, setFailed] = useState(false);
  const src = url || `/images/core-values/core-value-${n}.png`;
  if (failed && !url) {
    return <span aria-hidden="true" className="w-16 h-16 rounded-full bg-[#c74f2f] text-white text-2xl font-semibold flex items-center justify-center">{n}</span>;
  }
  return <img src={src} alt="" width="72" height="72" loading="lazy" className="w-[72px] h-[72px] object-contain" onError={() => setFailed(true)} />;
}

export default function CoreValues() {
  usePageMeta('values');
  return (
    <>
      <PageHeader kicker="Core Values" title="Our Core Values" intro={CORE_VALUES_INTRO} />

      <Section tone="white" narrow>
        <SectionHeader title="Living from the inside out" />
        <p className="lead">{INSIDE_OUT}</p>
      </Section>

      <Section tone="white">
        <ol className="grid md:grid-cols-2 gap-6">
          {CORE_VALUES.map(v => (
            <li key={v.id} id={v.id} className="fcard !p-8">
              <div className="flex items-center gap-4 mb-4">
                <ValueIcon n={v.n} />
                <h2 className="text-xl md:text-2xl">{v.n}. {v.title}</h2>
              </div>
              <p className="text-[0.95rem] leading-relaxed text-[#1e2522]/80">{v.body}</p>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-[#1e2522]/80">{v.practice}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="white" narrow>
        <SectionHeader title="Growing in our values" />
        <p className="text-[0.95rem] leading-relaxed text-[#1e2522]/80">{GROWING}</p>
        <div className="mt-6"><Btn to="/discipleship" variant="primary">Explore Adult Discipleship Training</Btn></div>
      </Section>
    </>
  );
}
