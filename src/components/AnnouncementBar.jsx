import React, { useEffect, useState } from 'react';
import { useSite } from '../settings';
import SafeIcon from '../common/SafeIcon';
import { FiX } from 'react-icons/fi';

const KEY = 'urf_announcement_dismissed';

// Optional, dismissible. It shows only when an announcement is set in the admin Settings tab.
export default function AnnouncementBar() {
  const SITE = useSite();
  const text = SITE.announcementText;
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try { setDismissed(localStorage.getItem(KEY) === text); } catch { setDismissed(false); }
  }, [text]);

  if (!text || dismissed) return null;

  const close = () => {
    setDismissed(true);
    try { localStorage.setItem(KEY, text); } catch { /* storage unavailable */ }
  };

  return (
    <div className="bg-[#c74f2f] text-white" role="region" aria-label="Announcement">
      <div className="max-w-[1312px] mx-auto px-9 md:px-14 py-2.5 flex items-center justify-between gap-4 text-[0.9rem]">
        <p className="flex-grow text-center sm:text-left font-display font-semibold tracking-wide text-[0.85rem]">
          {text}
          {SITE.announcementUrl && (
            <> <a href={SITE.announcementUrl} className="underline underline-offset-4 font-bold text-[#eaa235]">Learn more</a></>
          )}
        </p>
        <button type="button" onClick={close} aria-label="Dismiss announcement" className="inline-flex items-center justify-center w-10 h-10 -mr-2 rounded hover:bg-white/10">
          <SafeIcon icon={FiX} />
        </button>
      </div>
    </div>
  );
}
