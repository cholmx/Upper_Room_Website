import { useEffect, useRef } from 'react';

// A light 3D tilt toward the pointer for the cards inside a grid. One listener for the whole
// grid, only for a mouse, and never when the visitor asked for less motion.
export default function useTilt(max = 5) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === 'undefined' || !window.matchMedia) return undefined;
    if (!window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return undefined;
    let card = null;
    const move = (e) => {
      const c = e.target.closest && e.target.closest('.fcard');
      if (card && card !== c) reset(card);
      card = c;
      if (!c || !el.contains(c)) return;
      const r = c.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      c.style.setProperty('--ry', `${(x * max * 2).toFixed(2)}deg`);
      c.style.setProperty('--rx', `${(-y * max * 2).toFixed(2)}deg`);
    };
    const reset = (c) => { c.style.removeProperty('--rx'); c.style.removeProperty('--ry'); };
    const leave = () => { if (card) reset(card); card = null; };
    el.addEventListener('pointermove', move, { passive: true });
    el.addEventListener('pointerleave', leave);
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); };
  }, [max]);
  return ref;
}
