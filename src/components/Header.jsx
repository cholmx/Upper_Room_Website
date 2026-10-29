import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { NAV } from '../content/nav';
import { useSite } from '../settings';
import Logo from './Logo';
import { Btn } from './ui';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMenu, FiX, FiChevronDown } = FiIcons;

const linkCls = ({ isActive }) =>
  `inline-flex items-center min-h-[44px] px-3 rounded-md text-[0.95rem] font-semibold hover:bg-black/5 ${isActive ? 'text-[#8A6309] underline underline-offset-8 decoration-2' : 'text-[#080c0b]'}`;

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
      <button
        ref={btn}
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-1 min-h-[44px] px-3 rounded-md text-[0.95rem] font-semibold hover:bg-black/5 ${active ? 'text-[#8A6309]' : 'text-[#080c0b]'}`}
      >
        {item.label}
        <SafeIcon icon={FiChevronDown} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full pt-1 z-50 min-w-[15rem]">
          <ul className="bg-white rounded-xl border border-black/10 shadow-xl py-2">
            {item.children.map(c => (
              <li key={c.to}>
                <Link to={c.to} className="block px-4 py-2.5 text-[0.95rem] font-medium text-[#080c0b] hover:bg-[#F2F1ED]">{c.label}</Link>
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

  return (
    <div id="mobile-menu" className="lg:hidden fixed inset-x-0 top-[var(--header-h,64px)] bottom-0 z-40 bg-[#F9F9F7] overflow-y-auto pb-24" role="dialog" aria-label="Site menu">
      <div className="px-5 pt-5 grid grid-cols-2 gap-3">
        <Btn ref={first} to="/plan-your-visit" variant="primary" onClick={onClose}>Plan Your Visit</Btn>
        <Btn href={SITE.giveUrl} variant="dark">Give</Btn>
      </div>
      <nav aria-label="Main" className="px-5 py-4">
        <ul className="divide-y divide-black/10">
          {NAV.map(item => (
            <li key={item.label}>
              {item.children ? (
                <>
                  <button
                    type="button"
                    aria-expanded={openGroup === item.label}
                    onClick={() => setOpenGroup(g => (g === item.label ? null : item.label))}
                    className="w-full flex items-center justify-between min-h-[56px] text-lg font-semibold text-left"
                  >
                    {item.label}
                    <SafeIcon icon={FiChevronDown} className={`transition-transform ${openGroup === item.label ? 'rotate-180' : ''}`} />
                  </button>
                  {openGroup === item.label && (
                    <ul className="pb-3 pl-3">
                      {item.children.map(c => (
                        <li key={c.to}><Link to={c.to} onClick={onClose} className="flex items-center min-h-[48px] text-base font-medium text-[#2b2f2d]">{c.label}</Link></li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link to={item.to} onClick={onClose} className="flex items-center min-h-[56px] text-lg font-semibold">{item.label}</Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default function Header() {
  const SITE = useSite();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-[#F9F9F7] border-b border-black/10" style={{ '--header-h': '64px' }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Main" className="hidden lg:flex items-center gap-1">
          {NAV.map(item => (item.children
            ? <DesktopDropdown key={item.label} item={item} />
            : <NavLink key={item.to} to={item.to} className={linkCls}>{item.label}</NavLink>))}
        </nav>
        <div className="flex items-center gap-2">
          <Btn href={SITE.giveUrl} variant="dark" className="!min-h-[44px] !px-5">Give</Btn>
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-md hover:bg-black/5"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen(o => !o)}
          >
            <SafeIcon icon={open ? FiX : FiMenu} className="text-2xl" />
          </button>
        </div>
      </div>
      {open && <MobileMenu onClose={() => setOpen(false)} />}
    </header>
  );
}
