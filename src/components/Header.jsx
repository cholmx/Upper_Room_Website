import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { NAV } from '../content/nav';
import { useSite } from '../settings';
import Logo from './Logo';
import { Btn } from './ui';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMenu, FiX, FiChevronDown } = FiIcons;

const linkBase = 'whitespace-nowrap font-serif italic uppercase text-[0.9rem] tracking-widest py-1 border-b-2 transition-all duration-300 inline-flex items-center gap-1';
const linkOn = 'border-[#D49E46] text-black';
const linkOff = 'border-transparent text-black/70 hover:text-black hover:border-black/20';

function DesktopDropdown({ item }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const btn = useRef(null);
  const { pathname } = useLocation();
  const active = item.children.some(c => c.to === pathname);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); btn.current?.focus(); } };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}
    >
      <button ref={btn} type="button" aria-expanded={open} aria-haspopup="true" onClick={() => setOpen(o => !o)} className={`${linkBase} ${active ? linkOn : linkOff}`}>
        {item.label}
        <SafeIcon icon={FiChevronDown} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50 min-w-[16rem]">
          <ul className="bg-white rounded-2xl border border-black/5 shadow-2xl py-3">
            {item.children.map(c => (
              <li key={c.to}>
                <Link to={c.to} className="block px-6 py-2.5 font-serif italic uppercase text-[0.85rem] tracking-widest text-black/80 hover:text-black hover:bg-[#F7F5EE]">{c.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function MobileMenu({ onClose }) {
  const SITE = useSite();
  const first = useRef(null);
  const [openGroup, setOpenGroup] = useState(null);

  useEffect(() => {
    first.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const big = { fontFamily: "'Playfair Display', sans-serif", fontWeight: 900 };

  return createPortal(
    <div id="mobile-menu" className="xl:hidden fixed inset-0 z-[60] bg-[#F7F5EE] overflow-y-auto" role="dialog" aria-modal="true" aria-label="Site menu">
      <div className="flex items-center justify-between px-6 h-16">
        <span className="uppercase text-xl tracking-tight" style={{ fontFamily: "'Playfair Display', sans-serif", fontWeight: 1000 }}>{SITE.shortName}</span>
        <button type="button" aria-label="Close menu" onClick={onClose} className="p-3 bg-white rounded-full shadow-md hover:scale-105 transition-transform">
          <SafeIcon icon={FiX} size={22} />
        </button>
      </div>
      <div className="px-6 pt-2 grid grid-cols-2 gap-3">
        <Btn ref={first} to="/plan-your-visit" variant="primary" onClick={onClose} className="!px-4 text-center">Plan Your Visit</Btn>
        <Btn href={SITE.giveUrl} variant="dark" className="!px-4">Give</Btn>
      </div>
      <nav aria-label="Main" className="px-6 py-6 pb-28">
        <ul className="divide-y divide-black/10">
          {NAV.map(item => (
            <li key={item.label}>
              {item.children ? (
                <>
                  <button type="button" aria-expanded={openGroup === item.label} onClick={() => setOpenGroup(g => (g === item.label ? null : item.label))} className="w-full flex items-center justify-between min-h-[60px] uppercase text-2xl text-left" style={big}>
                    {item.label}
                    <SafeIcon icon={FiChevronDown} className={`transition-transform ${openGroup === item.label ? 'rotate-180' : ''}`} />
                  </button>
                  {openGroup === item.label && (
                    <ul className="pb-4 pl-2">
                      {item.children.map(c => (
                        <li key={c.to}><Link to={c.to} onClick={onClose} className="flex items-center min-h-[48px] font-serif italic uppercase tracking-widest text-[0.95rem] text-black/80">{c.label}</Link></li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link to={item.to} onClick={onClose} className="flex items-center min-h-[60px] uppercase text-2xl hover:text-[#BD8937] transition-colors" style={big}>{item.label}</Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>,
    document.body
  );
}

export default function Header() {
  const SITE = useSite();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <header className={`sticky top-0 z-50 flex items-center transition-all duration-300 text-black ${scrolled ? 'bg-[#F7F5EE]/90 backdrop-blur-md border-b border-black/5 shadow-sm h-16' : 'bg-[#F7F5EE] border-b border-transparent h-16 xl:h-24'}`}>
      <div className="max-w-[1320px] w-full mx-auto px-6 flex items-center justify-between gap-6">
        <Logo />
        <nav aria-label="Main" className="hidden xl:flex items-center gap-6 pt-1">
          {NAV.map(item => (item.children
            ? <DesktopDropdown key={item.label} item={item} />
            : <NavLink key={item.to} to={item.to} className={({ isActive }) => `${linkBase} ${isActive ? linkOn : linkOff}`}>{item.label}</NavLink>))}
          <a href={SITE.giveUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2 rounded-full bg-[#1E2522] text-white font-serif italic uppercase text-[0.85rem] tracking-widest hover:bg-[#D49E46] hover:text-black transition-colors">
            Give<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </nav>
        <div className="flex items-center gap-2 xl:hidden">
          <a href={SITE.giveUrl} target="_blank" rel="noopener noreferrer" className="px-4 min-[400px]:px-5 py-2 rounded-full bg-[#1E2522] text-white font-serif italic uppercase text-[0.8rem] min-[400px]:text-[0.85rem] tracking-widest">
            Give<span className="sr-only"> (opens in a new tab)</span>
          </a>
          <button type="button" className="p-2 hover:bg-black/5 rounded-full transition-colors" aria-expanded={open} aria-controls="mobile-menu" aria-label="Open menu" onClick={() => setOpen(true)}>
            <SafeIcon icon={FiMenu} size={24} />
          </button>
        </div>
      </div>
      {open && <MobileMenu onClose={() => setOpen(false)} />}
    </header>
  );
}
