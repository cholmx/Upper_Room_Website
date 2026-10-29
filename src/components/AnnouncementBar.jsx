import React, { useEffect, useState } from 'react';
import { useSite } from '../settings';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX } = FiIcons;
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
    <div className="bg-[#0B1613] text-[#F9F9F7]" role="region" aria-label="Announcement">
      <div className="max-w-[1145px] mx-auto px-6 py-2.5 flex items-center justify-between gap-4 text-[0.9rem]">
        <p className="flex-grow text-center sm:text-left font-serif italic uppercase tracking-widest">
          {text}
          {SITE.announcementUrl && (
            <> <a href={SITE.announcementUrl} className="underline underline-offset-4 font-bold text-[#FFC44F]">Learn more</a></>
          )}
        </p>
        <button type="button" onClick={close} aria-label="Dismiss announcement" className="inline-flex items-center justify-center w-10 h-10 -mr-2 rounded hover:bg-white/10">
          <SafeIcon icon={FiX} />
        </button>
      </div>
    </div>
  );
}
