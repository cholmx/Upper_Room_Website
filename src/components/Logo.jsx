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
      {img.url && <img src={img.url} alt="" className="h-11 w-auto mt-2 mr-3" />}
      <span
        className={`text-lg min-[400px]:text-xl lg:text-[1.4rem] pt-1 tracking-tight whitespace-nowrap ${tone === 'light' ? 'text-white' : 'text-[#1e2522]'}`}
        style={{ fontFamily: "Inter Tight, Arial, Helvetica, sans-serif", fontWeight: 700 }}
      >
        {img.url ? SITE.name : SITE.shortName}
      </span>
    </Link>
  );
}
