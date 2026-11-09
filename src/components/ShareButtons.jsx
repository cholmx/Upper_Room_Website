import React, { useState } from 'react';

const btn = 'btn btn-outline !py-2 !px-4 text-sm';

// Copy the link, send it by email, or use the phone's own share sheet when it has one.
export default function ShareButtons({ title, url }) {
  const [copied, setCopied] = useState(false);
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  const link = url || (typeof window !== 'undefined' ? window.location.href : '');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const area = document.createElement('textarea');
      area.value = link;
      document.body.appendChild(area);
      area.select();
      try { document.execCommand('copy'); } catch { /* the link stays visible in the address bar */ }
      area.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Share this message">
      {canShare && <button type="button" className={btn} onClick={() => navigator.share({ title, url: link }).catch(() => {})}>Share</button>}
      <button type="button" className={btn} onClick={copy}>{copied ? 'Link copied' : 'Copy link'}</button>
      <a className={btn} href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${title}\n${link}`)}`}>Email</a>
      <span role="status" className="sr-only">{copied ? 'Link copied to the clipboard' : ''}</span>
    </div>
  );
}
