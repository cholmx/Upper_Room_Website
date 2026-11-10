import React from 'react';

// Dark green with blurred splotches of color. Which colors a series gets depends on its name, so a series keeps the same look.
const SPLOTCHES = [
  ['#c74f2f', '#eaa235', 'rgba(232, 231, 227, 0.5)'],
  ['#eaa235', '#c74f2f', '#3f7a55'],
  ['#c74f2f', 'rgba(232, 231, 227, 0.5)', '#eaa235'],
  ['#eaa235', 'rgba(232, 231, 227, 0.5)', '#c74f2f'],
];
const hash = (s) => [...String(s)].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);

// A dark green cover with the series name in bold yellow Merriweather italic.
export default function SeriesCover({ name, className = '' }) {
  const h = hash(name);
  const [a, b, c] = SPLOTCHES[h % SPLOTCHES.length];
  const p = (shift, range) => 8 + ((h >> shift) % range);
  const blobs = [
    `radial-gradient(circle at ${p(0, 35)}% ${p(3, 30)}%, ${a} 0, transparent 42%)`,
    `radial-gradient(circle at ${60 + p(5, 30)}% ${50 + p(7, 35)}%, ${b} 0, transparent 40%)`,
    `radial-gradient(circle at ${p(9, 60)}% ${70 + p(11, 25)}%, ${c} 0, transparent 30%)`,
  ].join(', ');
  return (
    <div className={`series-cover ${className}`}>
      <span aria-hidden="true" className="series-cover-blur" style={{ background: blobs, opacity: 0.55 }} />
      <span aria-hidden="true" className="series-cover-grain" />
      <span className="series-cover-name font-serif italic font-normal text-xl md:text-2xl " style={{ fontFamily: 'Merriweather, Georgia, serif', fontStyle: 'italic', fontWeight: 700, lineHeight: 1.08 }}>{name}</span>
    </div>
  );
}
