import React from 'react';
import { isRecent } from '../utils';

// A small "New" mark on a message from the last week.
export default function NewBadge({ date, className = '' }) {
  if (!isRecent(date)) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold font-display text-[#C65D3B] ${className}`}>
      <span className="new-dot" aria-hidden="true"></span>New
    </span>
  );
}
