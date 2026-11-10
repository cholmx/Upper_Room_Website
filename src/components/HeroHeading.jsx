import React, { useEffect, useState } from 'react';

// The Home hero heading. With extra lines it fades from one to the next, the old line blurring out as the new one sharpens in, and repeats. All lines sit in one grid cell, so the
// heading keeps the height of the longest line and nothing below it jumps. Visitors who ask for less motion see the first line only.
export default function HeroHeading({ id, lines, className = '', interval = 6500 }) {
  const [i, setI] = useState(0);
  const [still, setStill] = useState(false);
  // The first paint, and the static copy of the page, show only the main heading. The rest join once the page is running.
  const [ready, setReady] = useState(false);
  const all = lines.filter(Boolean);

  useEffect(() => { setReady(true); }, []);

  useEffect(() => {
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setStill(true); return undefined; }
    if (all.length < 2) return undefined;
    const t = setInterval(() => setI(n => (n + 1) % all.length), interval);
    return () => clearInterval(t);
  }, [all.length, interval]);

  if (!ready || all.length < 2 || still) return <h1 id={id} className={className}>{all[0]}</h1>;
  return (
    <h1 id={id} className={`${className} grid`}>
      {all.map((line, n) => (
        <span key={line} aria-hidden={n === i ? undefined : 'true'} className="col-start-1 row-start-1 self-end hero-line" style={{ opacity: n === i ? 1 : 0, filter: n === i ? 'blur(0px)' : 'blur(14px)', transition: 'opacity 2s ease-in-out, filter 2s ease-in-out', willChange: 'opacity, filter' }}>{line}</span>
      ))}
    </h1>
  );
}
