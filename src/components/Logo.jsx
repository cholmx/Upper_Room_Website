import React from 'react';
import { Link } from 'react-router-dom';
import { usePhoto } from '../photos';
import { useSite } from '../settings';

// The uploaded logo when there is one, and the original text wordmark until then.
export default function Logo({ tone = 'dark', className = '' }) {
  const SITE = useSite();
  const dark = usePhoto('logo-dark');
  const light = usePhoto('logo-light');
  const img = tone === 'light' ? light : dark;
  return (
    <Link to="/" className={`inline-flex items-center hover:opacity-70 transition-opacity ${className}`}>
      {img.url ? (
        <img src={img.url} alt={SITE.name} className="h-10 w-auto" />
      ) : (
        <span
          className="uppercase text-base min-[400px]:text-xl lg:text-[1.65rem] pt-1 tracking-tight whitespace-nowrap"
          style={{ fontFamily: "'Google Sans Flex', sans-serif", fontWeight: 1000 }}
        >
          {SITE.shortName}
        </span>
      )}
    </Link>
  );
}
