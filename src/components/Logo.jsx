import React from 'react';
import { Link } from 'react-router-dom';
import { usePhoto } from '../photos';
import { useSite } from '../settings';

// Uses the uploaded logo files when they exist, and a plain wordmark until then.
export default function Logo({ tone = 'dark', className = '' }) {
  const SITE = useSite();
  const dark = usePhoto('logo-dark');
  const light = usePhoto('logo-light');
  const img = tone === 'light' ? light : dark;
  return (
    <Link to="/" className={`inline-flex items-center gap-3 leading-none ${className}`}>
      {img.url ? (
        <img src={img.url} alt={SITE.name} className="h-10 w-auto" />
      ) : (
        <span className={`font-display ${tone === 'light' ? 'text-white' : 'text-[#080c0b]'}`}>
          <span className="block text-xl md:text-2xl font-semibold tracking-tight">The Upper Room</span>{' '}
          <span className={`block text-[0.7rem] md:text-xs font-bold tracking-[0.28em] uppercase ${tone === 'light' ? 'text-[#FFC44F]' : 'text-[#8A6309]'}`}>Fellowship</span>
        </span>
      )}
    </Link>
  );
}
