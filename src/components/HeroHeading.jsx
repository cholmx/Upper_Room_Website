import React, { useEffect, useState } from 'react';

// The Home hero heading. With extra lines it fades from one to the next, the old line blurring out as the new one sharpens in, and repeats. All lines sit in one grid cell, so the
// heading keeps the height of the longest line and nothing below it jumps. Visitors who ask for less motion see the first line only.
export default function HeroHeading({ id, lines, className = '', interval = 5500 }) {
  const [i, setI] = useState(0);
  const [still, setStill] = useState(false);
  // The first paint, and the static copy of the page, show only the main heading. The rest join once the page is running.
  const [ready, setReady] = useState(false);
  // A line that repeats another (ignoring capitals and end punctuation) is dropped, so no line shows twice in a row.
  const seen = new Set();
  const all = lines.filter(Boolean).filter(l => {
    const k = String(l).toLowerCase().replace(/[\s.!?,]+$/g, '').replace(/\s+/g, ' ');
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  const sig = all.join('|');

  useEffect(() => { setReady(true); }, []);

  useEffect(() => {
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setStill(true); return undefined; }
    if (all.length < 2) return undefined;
    const t = setInterval(() => setI(n => (n + 1) % all.length), interval);
    return () => clearInterval(t);
  }, [sig, all.length, interval]);

  if (!ready || all.length < 2 || still) return <h1 id={id} className={className}>{all[0]}</h1>;
  return (
    <h1 id={id} className={`${className} grid`}>
      {all.map((line, n) => (
        <span key={n} aria-hidden={n === i ? undefined : 'true'} className="col-start-1 row-start-1 self-end hero-line" style={{ opacity: n === i ? 1 : 0, filter: n === i ? 'blur(0px)' : 'blur(28px)', transition: 'opacity 1s ease-in-out, filter 1s ease-in-out', willChange: 'opacity, filter' }}>{line}</span>
      ))}
    </h1>
  );
}
