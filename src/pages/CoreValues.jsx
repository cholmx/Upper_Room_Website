import React, { useState } from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { usePhoto } from '../photos';
import { CORE_VALUES, CORE_VALUES_INTRO, INSIDE_OUT, GROWING } from '../content/values';
import { Section, SectionHeader, PageHeader } from '../components/ui';

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
      <PageHeader kicker="Core Values" title="Core Values" intro={CORE_VALUES_INTRO} />

      <Section tone="cream" narrow>
        <SectionHeader title="Living from the inside out" />
        <div className="space-y-5 text-lg leading-relaxed text-black/80">
          {INSIDE_OUT.map(p => <p key={p}>{p}</p>)}
          <p className="font-semibold">The following core values drive everything we do at Upper Room Fellowship.</p>
        </div>
      </Section>

      <Section tone="white">
        <ol className="grid md:grid-cols-2 gap-6">
          {CORE_VALUES.map(v => (
            <li key={v.id}>
              <details id={v.id} className="u-acc neu-acc group rounded-2xl h-full">
                <summary className="cursor-pointer list-none p-6 flex items-start gap-5 min-h-[56px]">
                  <ValueIcon n={v.n} />
                  <span className="flex-grow">
                    <h2 className="block text-xl md:text-2xl font-semibold">{v.title}</h2>
                    <span className="block mt-1 text-black/80">{v.summary}</span>
                    <span className="block mt-3 text-sm font-semibold text-[#2b433e]"><span className="group-open:hidden">Read more</span><span className="hidden group-open:inline">Show less</span></span>
                  </span>
                </summary>
                <div className="px-6 pb-6 -mt-1 text-black/80 leading-relaxed space-y-3">
                  {v.body.map(p => <p key={p}>{p}</p>)}
                  <h3 className="text-lg mt-5 mb-2">In practice, this means</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    {v.practice.map(p => <li key={p}>{p}</li>)}
                  </ul>
                </div>
              </details>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="cream" narrow>
        <SectionHeader title="Growing in our values" />
        <div className="space-y-5 text-lg leading-relaxed text-black/80">
          {GROWING.map(p => <p key={p}>{p}</p>)}
        </div>
      </Section>
    </>
  );
}
