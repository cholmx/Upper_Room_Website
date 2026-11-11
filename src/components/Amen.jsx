import { useEffect } from 'react';

// A small surprise: typing the word "amen" anywhere on the page sends up a handful of colored dots.
export default function Amen() {
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    let typed = '';
    const onKey = (e) => {
      const tag = (e.target?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable) { typed = ''; return; }
      if (e.key.length !== 1) return;
      typed = (typed + e.key.toLowerCase()).slice(-4);
      if (typed !== 'amen') return;
      typed = '';
      const colors = ['#eaa235', '#c74f2f', '#EDE9DC', '#1e2522'];
      const dots = Array.from({ length: 36 }, (_, i) => {
        const dot = document.createElement('span');
        dot.className = 'amen-dot';
        dot.setAttribute('aria-hidden', 'true');
        const angle = (Math.PI * (0.15 + 0.7 * Math.random()));
        const dist = 160 + Math.random() * 360;
        dot.style.setProperty('--x', `${Math.round(Math.cos(angle) * dist * (Math.random() > 0.5 ? 1 : -1))}px`);
        dot.style.setProperty('--y', `${-Math.round(Math.sin(angle) * dist)}px`);
        dot.style.background = colors[i % colors.length];
        dot.style.border = '1px solid rgba(30,37,34,0.15)';
        document.body.appendChild(dot);
        return dot;
      });
      setTimeout(() => dots.forEach(d => d.remove()), 2000);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return null;
}
