import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { publicDataFetch } from '../api';
import { SITE } from '../config';

const { FiMenu, FiX } = FiIcons;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [customPages, setCustomPages] = useState([]);
  const location = useLocation();

  useEffect(() => {
    async function fetchPages() {
      const res = await publicDataFetch('read/custom_pages_church');
      if (res.status === 'success') {
        setCustomPages(res.data ?? []);
      }
    }
    fetchPages();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Messages', path: '/sermons' },
    { name: 'Events', path: '/events' },
    { name: 'Blog', path: '/blog' },
    { name: 'New Here', path: '/visit' },
    ...customPages.map(p => ({ name: p.nav_label_text || p.title_text, path: `/p/${p.slug_key}` }))
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center transition-all duration-300 ${
      isScrolled 
        ? 'bg-[#F9F9F7]/85 backdrop-blur-md border-b border-black/5 shadow-sm h-16' 
        : 'bg-[#F9F9F7] border-b border-transparent h-24'
    } text-black`}>
      <div className="max-w-[1145px] w-full mx-auto px-6 flex items-center justify-between">
        <Link 
          to="/" 
          className="uppercase text-xl lg:text-[1.65rem] pt-1 tracking-tight whitespace-nowrap hover:opacity-70 transition-opacity"
          style={{ fontFamily: "'Google Sans Flex', sans-serif", fontWeight: 1000 }}
        >
          Upper Room Fellowship
        </Link>

        {/* Desktop */}
        <ul className="hidden lg:flex gap-8 items-center pt-1">
          {links.map(link => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`font-serif italic uppercase text-[0.9rem] tracking-widest py-1 border-b-2 transition-all duration-300 ${
                  location.pathname === link.path 
                    ? 'border-[#FFC44F] text-black' 
                    : 'border-transparent text-black/70 hover:text-black hover:border-black/20'
                }`}
              >
                {link.name}
              </Link>
            </li>
          ))}
          <li>
            <a
              href={SITE.giveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 rounded-full bg-[#0B1613] text-white font-serif italic uppercase text-[0.85rem] tracking-widest hover:bg-[#FFC44F] hover:text-black transition-colors"
            >
              Give
            </a>
          </li>
        </ul>

        {/* Mobile Toggle */}
        <button aria-label="Open menu" aria-expanded={isOpen} className="lg:hidden p-2 hover:bg-black/5 rounded-full transition-colors" onClick={() => setIsOpen(!isOpen)}>
          <SafeIcon icon={FiMenu} size={24} />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-[#F9F9F7]/95 backdrop-blur-xl z-[60] flex flex-col justify-center px-8 transition-all duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button aria-label="Close menu" className="absolute top-6 right-6 p-3 bg-white rounded-full shadow-md hover:scale-105 transition-transform" onClick={() => setIsOpen(false)}>
          <SafeIcon icon={FiX} size={24} />
        </button>
        <ul className="space-y-6 text-center">
          {links.map(link => (
            <li key={link.path}>
              <Link
                to={link.path}
                className="inline-block uppercase text-3xl hover:text-[#CCA866] transition-colors"
                style={{ fontFamily: "'Google Sans Flex', sans-serif", fontWeight: 900 }}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            </li>
          ))}
          <li className="pt-6 mt-6 border-t border-black/10">
            <a
              href={SITE.giveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block uppercase text-3xl text-[#CCA866] hover:text-black transition-colors"
              style={{ fontFamily: "'Google Sans Flex', sans-serif", fontWeight: 900 }}
            >
              Give Online
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}