import React from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../settings';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPhone, FiMapPin, FiCalendar } = FiIcons;

const item = 'flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[56px] text-[0.85rem] font-serif tracking-normal font-semibold';

// Phones only: the three things a first-time visitor needs, always within reach.
export default function StickyMobileBar() {
  const SITE = useSite();
  return (
    <nav aria-label="Quick actions" className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#1e2522] border-t border-white/10 flex pb-[env(safe-area-inset-bottom)]">
      <a href={SITE.phoneHref} className={`${item} text-[#f7f5ee]`}>
        <SafeIcon icon={FiPhone} className="text-xl text-[#eaa235]" /> Call
      </a>
      <a href={SITE.googleMapsUrl} target="_blank" rel="noopener noreferrer" className={`${item} text-[#f7f5ee] border-x border-white/10`}>
        <SafeIcon icon={FiMapPin} className="text-xl text-[#eaa235]" /> Directions<span className="sr-only"> (opens in a new tab)</span>
      </a>
      <Link to="/plan-your-visit" className={`${item} bg-[#eaa235] text-black`}>
        <SafeIcon icon={FiCalendar} className="text-xl" /> Plan Your Visit
      </Link>
    </nav>
  );
}
