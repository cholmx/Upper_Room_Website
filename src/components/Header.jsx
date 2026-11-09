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

const linkBase = 'whitespace-nowrap font-display font-bold text-[0.95rem] tracking-wide py-1 inline-flex items-center gap-1';
const linkOn = 'text-[#c74f2f]';
const linkOff = 'text-black hover:text-[#1e2522]';
const linkOnLight = 'text-[#eaa235]';
const linkOffLight = 'text-white/90 hover:text-white';

function DesktopDropdown({ item, light }) {
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
      <div className="inline-flex items-center">
        <Link to={item.children[0].to} className={`${linkBase} ${active ? (light ? linkOnLight : linkOn) : (light ? linkOffLight : linkOff)}`}>{item.label}</Link>
        <button ref={btn} type="button" aria-expanded={open} aria-haspopup="true" aria-label={`${item.label} menu`} onClick={() => setOpen(o => !o)} className={`${linkBase} !px-1 ${active ? (light ? linkOnLight : linkOn) : (light ? linkOffLight : linkOff)}`}>
          <SafeIcon icon={FiChevronDown} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50 min-w-[16rem]">
          <ul className="bg-white rounded-2xl py-3 elev-2">
            {item.children.map(c => (
              <li key={c.to}>
                <Link to={c.to} className="block px-6 py-2.5 font-display font-semibold text-[0.95rem] tracking-wide text-black hover:text-[#1e2522] hover:bg-[#ffffff]">{c.label}</Link>
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

  const big = { fontFamily: "Arial, Helvetica, sans-serif", fontWeight: 700 };

  return createPortal(
    <div id="mobile-menu" className="xl:hidden fixed inset-0 z-[60] bg-[#ffffff] overflow-y-auto" role="dialog" aria-modal="true" aria-label="Site menu">
      <div className="flex items-center justify-between px-6 h-16">
        <span className="text-2xl tracking-tight" style={{ fontFamily: "Arial, Helvetica, sans-serif", fontWeight: 700 }}>{SITE.shortName}</span>
        <button type="button" aria-label="Close menu" onClick={onClose} className="p-3 bg-white rounded-full elev-1 transition-transform">
          <SafeIcon icon={FiX} size={22} />
        </button>
      </div>
      <div className="px-6 pt-2 grid grid-cols-2 gap-3">
        <Btn ref={first} to="/plan-your-visit" variant="primary" onClick={onClose} className="!px-4 text-center">Plan Your Visit</Btn>
        <Btn href={SITE.giveUrl} variant="accent" className="!px-4">Give</Btn>
      </div>
      <nav aria-label="Main" className="px-6 py-6 pb-28">
        <ul>
          {NAV.map(item => (
            <li key={item.label}>
              {item.children ? (
                <>
<div className="flex items-center justify-between min-h-[60px]">
                    <Link to={item.children[0].to} onClick={onClose} className="flex-1 flex items-center min-h-[60px] text-2xl hover:text-[#eaa235] transition-colors" style={big}>{item.label}</Link>
                    <button type="button" aria-expanded={openGroup === item.label} aria-label={`${item.label} menu`} onClick={() => setOpenGroup(g => (g === item.label ? null : item.label))} className="p-4">
                      <SafeIcon icon={FiChevronDown} className={`text-2xl transition-transform ${openGroup === item.label ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                  {openGroup === item.label && (
                    <ul className="pb-4 pl-2">
                      {item.children.map(c => (
                        <li key={c.to}><Link to={c.to} onClick={onClose} className="flex items-center min-h-[48px] font-display font-bold tracking-wide text-[1rem] text-black">{c.label}</Link></li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                item.external
                  ? <a href={SITE.giveUrl} target="_blank" rel="noopener noreferrer" onClick={onClose} className="flex items-center min-h-[60px] text-2xl hover:text-[#eaa235] transition-colors" style={big}>{item.label}<span className="sr-only"> (opens in a new tab)</span></a>
                  : <Link to={item.to} onClick={onClose} className="flex items-center min-h-[60px] text-2xl hover:text-[#eaa235] transition-colors" style={big}>{item.label}</Link>
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
  const [hasHero, setHasHero] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  // When a page opens with a photo hero, the menu sits on top of the photo until the page is scrolled.
  useEffect(() => {
    const check = () => {
      const first = document.querySelector('main')?.firstElementChild;
      setHasHero(Boolean(first && first.querySelector('.photo-section')));
    };
    check();
    const timers = [120, 500, 1200].map(ms => setTimeout(check, ms));
    return () => timers.forEach(clearTimeout);
  }, [pathname]);
  const light = hasHero && !scrolled;

  return (
    <header className={`sticky top-0 z-50 flex items-center h-20 transition-colors ${hasHero ? '-mb-20' : ''} ${light ? 'bg-transparent text-white' : 'bg-white text-[#1e2522] shadow-[0_1px_2px_rgba(30,37,34,0.05),0_6px_18px_-6px_rgba(30,37,34,0.10)]'}`}>
      <div className="max-w-[1312px] w-full mx-auto px-9 md:px-14 flex items-center justify-between gap-6">
        <Logo tone={light ? 'light' : 'dark'} />
        <nav aria-label="Main" className="hidden xl:flex items-center gap-5 pt-1">
          {NAV.map(item => (item.children
            ? <DesktopDropdown key={item.label} item={item} light={light} />
            : item.external
              ? <a key={item.label} href={SITE.giveUrl} target="_blank" rel="noopener noreferrer" className={`${linkBase} ${light ? linkOffLight : linkOff}`}>{item.label}<span className="sr-only"> (opens in a new tab)</span></a>
              : <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `${linkBase} ${isActive ? (light ? linkOnLight : linkOn) : (light ? linkOffLight : linkOff)}`}>{item.label}</NavLink>))}
        </nav>
        <div className="flex items-center gap-2 xl:hidden">
          <button type="button" className={`p-2 rounded-full transition-colors ${light ? 'hover:bg-white/10' : 'hover:bg-[#1e2522]/5'}`} aria-expanded={open} aria-controls="mobile-menu" aria-label="Open menu" onClick={() => setOpen(true)}>
            <SafeIcon icon={FiMenu} size={24} />
          </button>
        </div>
      </div>
      {open && <MobileMenu onClose={() => setOpen(false)} />}
    </header>
  );
}
