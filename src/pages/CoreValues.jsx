import React, { useState } from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { usePhoto } from '../photos';
import { CORE_VALUES } from '../content/values';
import { Section, PageHeader, EndCta } from '../components/ui';

// The icon comes from Site Photos in the admin, then from /images/core-values/core-value-N.png,
// and shows the value's number if neither exists yet.
function ValueIcon({ n }) {
  const { url } = usePhoto(`core-value-${n}`);
  const [failed, setFailed] = useState(false);
  const src = url || `/images/core-values/core-value-${n}.png`;
  if (failed && !url) {
    return <span aria-hidden="true" className="w-16 h-16 rounded-full bg-[#FFC44F] text-[#080c0b] font-display text-2xl font-semibold flex items-center justify-center">{n}</span>;
  }
  return <img src={src} alt="" width="72" height="72" loading="lazy" className="w-[72px] h-[72px] object-contain" onError={() => setFailed(true)} />;
}

export default function CoreValues() {
  usePageMeta('values');
  return (
    <>
      <PageHeader
        kicker="Core values"
        title="What we care about"
        intro="When what matters to God starts to matter to us, people change. These six values shape how we run the church, how we treat each other, and how we spend our week."
      />
      <Section tone="cream">
        <ol className="grid md:grid-cols-2 gap-6">
          {CORE_VALUES.map(v => (
            <li key={v.id}>
              <details id={v.id} className="u-acc group bg-white rounded-2xl border border-black/10 h-full">
                <summary className="cursor-pointer list-none p-6 flex items-start gap-5 min-h-[56px]">
                  <ValueIcon n={v.n} />
                  <span className="flex-grow">
                    <h2 className="block text-xl md:text-2xl font-display font-semibold">{v.title}</h2>
                    <span className="block mt-1 text-[#2b2f2d]">{v.summary}</span>
                    <span className="block mt-3 text-sm font-semibold text-[#8A6309]"><span className="group-open:hidden">Read more</span><span className="hidden group-open:inline">Show less</span></span>
                  </span>
                </summary>
                <div className="px-6 pb-6 -mt-1 text-[#2b2f2d] leading-relaxed">
                  <p>{v.body}</p>
                  <h3 className="text-lg mt-5 mb-2">In practice, this means</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    {v.practice.map(p => <li key={p}>{p}</li>)}
                  </ul>
                </div>
              </details>
            </li>
          ))}
        </ol>
        <p className="mt-10 max-w-3xl text-lg leading-relaxed text-[#2b2f2d]">
          Living by these values is hard some days, and we get it wrong sometimes. We keep going because it is worth it. As Psalm 58:11 says in the New Living Translation, “There truly is a reward for those who live for God.”
        </p>
      </Section>
      <EndCta title="See these values in action" text="They are easier to feel than to read about. Come see for yourself." to="/plan-your-visit" label="Plan Your Visit" />
    </>
  );
}
