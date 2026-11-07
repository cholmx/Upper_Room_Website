import { useEffect } from 'react';

// Pictures still loading start clear and fade in once they arrive. Pictures already on screen from the
// cache are left alone, and a picture that fails to load is shown as it is so nothing stays hidden.
export default function useImageFade() {
  useEffect(() => {
    const seen = new WeakSet();
    const prepare = (img) => {
      if (!(img instanceof HTMLImageElement) || seen.has(img) || img.complete) return;
      seen.add(img);
      img.classList.add('img-fade');
      const show = () => requestAnimationFrame(() => img.classList.add('img-in'));
      img.addEventListener('load', show, { once: true });
      img.addEventListener('error', show, { once: true });
    };
    const scan = (root) => {
      if (root instanceof HTMLImageElement) prepare(root);
      else if (root.querySelectorAll) root.querySelectorAll('img').forEach(prepare);
    };
    scan(document.body);
    const watcher = new MutationObserver((records) => {
      for (const r of records) r.addedNodes.forEach(scan);
    });
    watcher.observe(document.body, { childList: true, subtree: true });
    return () => watcher.disconnect();
  }, []);
}
