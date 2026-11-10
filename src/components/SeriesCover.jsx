import React from 'react';

// Neutral palettes for a series without its own cover art. Which one a series gets depends on its name, so a series keeps the same look.
const PALETTES = [
  ['#e4e1da', '#cfcac0', '#f3f1ec'],
  ['#dedfdc', '#c6c9c6', '#eef0ee'],
  ['#e6e0d6', '#d2c8b8', '#f4f0e8'],
  ['#dfdcd8', '#c9c3bd', '#efede9'],
];
const hash = (s) => [...String(s)].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);

// A soft, blurred, grainy backdrop with the series name in Merriweather italic.
export default function SeriesCover({ name, className = '' }) {
  const h = hash(name);
  const [a, b, c] = PALETTES[h % PALETTES.length];
  const x1 = 10 + (h % 30); const y1 = 15 + ((h >> 3) % 30);
  const x2 = 55 + ((h >> 5) % 35); const y2 = 55 + ((h >> 7) % 35);
  const x3 = 30 + ((h >> 9) % 50);
  return (
    <div className={`series-cover ${className}`} style={{ background: a }}>
      <span aria-hidden="true" className="series-cover-blur" style={{ background: `radial-gradient(circle at ${x1}% ${y1}%, ${b} 0, transparent 55%), radial-gradient(circle at ${x2}% ${y2}%, ${b} 0, transparent 50%), radial-gradient(circle at ${x3}% 8%, ${c} 0, transparent 55%)` }} />
      <span aria-hidden="true" className="series-cover-grain" />
      <span className="series-cover-name font-serif italic font-normal text-xl md:text-2xl leading-snug text-[#1e2522]" style={{ fontFamily: 'Merriweather, Georgia, serif', fontStyle: 'italic', fontWeight: 400 }}>{name}</span>
    </div>
  );
}
