// One listener for the whole site. A ripple grows from the point of contact on any .btn.
// It is a plain element removed when it ends, so React never re-renders for it.
export function installRipple() {
  if (typeof document === 'undefined') return () => {};
  const calm = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const onDown = (e) => {
    if (e.button > 0 || calm()) return;
    const el = e.target.closest && e.target.closest('.btn');
    if (!el || el.disabled) return;
    const r = el.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2;
    const dot = document.createElement('span');
    dot.className = 'btn-ripple';
    dot.setAttribute('aria-hidden', 'true');
    dot.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
    dot.addEventListener('animationend', () => dot.remove());
    el.appendChild(dot);
  };
  document.addEventListener('pointerdown', onDown, { passive: true });
  return () => document.removeEventListener('pointerdown', onDown);
}
