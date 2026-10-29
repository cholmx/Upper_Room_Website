import React from 'react';
import { Link } from 'react-router-dom';
import { FOOTER_LINKS } from '../content/nav';
import { useSite } from '../settings';
import Logo from './Logo';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiFacebook, FiInstagram, FiYoutube } = FiIcons;
const SOCIAL_ICON = { Facebook: FiFacebook, Instagram: FiInstagram, YouTube: FiYoutube };

const link = 'inline-flex items-center min-h-[40px] text-white/90 hover:text-[#FFC44F] underline-offset-4 hover:underline';

export default function Footer() {
  const SITE = useSite();
  return (
    <footer className="bg-[#0B1613] text-white pb-20 md:pb-0">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-14 pb-10 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo tone="light" />
          <p className="mt-5 text-white/85 leading-relaxed">{SITE.tagline}</p>
          <ul className="mt-5 flex gap-2" aria-label="Social media">
            {SITE.social.map(s => (
              <li key={s.label}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={`${SITE.shortName} on ${s.label} (opens in a new tab)`} className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-white/30 hover:bg-[#FFC44F] hover:text-[#080c0b] hover:border-[#FFC44F]">
                  <SafeIcon icon={SOCIAL_ICON[s.label]} className="text-xl" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-4">
          <h2 className="text-xl mb-4 text-[#FFC44F]">Visit us</h2>
          <address className="not-italic space-y-1 text-white/90 leading-relaxed">
            <p>{SITE.address.street}<br />{SITE.address.city}, {SITE.address.region} {SITE.address.postalCode}</p>
            <p>
              <a href={SITE.googleMapsUrl} target="_blank" rel="noopener noreferrer" className={link}>Get directions<span className="sr-only"> (opens in a new tab)</span></a>
            </p>
            <p><a href={SITE.phoneHref} className={link}>{SITE.phone}</a></p>
            <p><a href={`mailto:${SITE.email}`} className={link}>{SITE.email}</a></p>
            <p className="pt-2 font-semibold">{SITE.serviceTime}</p>
          </address>
        </div>

        <nav aria-label="Footer" className="md:col-span-4">
          <h2 className="text-xl mb-4 text-[#FFC44F]">Explore</h2>
          <ul className="grid grid-cols-2 gap-x-4">
            {FOOTER_LINKS.map(l => (
              <li key={l.to}><Link to={l.to} className={link}>{l.label}</Link></li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/15">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6 text-[0.95rem] text-white/85 space-y-4">
          <p>{SITE.serviceTime}. {SITE.addressLine}.</p>
          <ul className="flex flex-wrap gap-x-6">
            <li><a href={SITE.giveUrl} target="_blank" rel="noopener noreferrer" className={link}>Give<span className="sr-only"> (opens in a new tab)</span></a></li>
            <li><Link to="/accessibility" className={link}>Accessibility</Link></li>
            <li><Link to="/privacy" className={link}>Privacy</Link></li>
            <li><Link to="/admin" className={link}>Staff login</Link></li>
          </ul>
          <p className="text-white/70">&copy; {new Date().getFullYear()} {SITE.name}. Columbiana, Ohio.</p>
        </div>
      </div>
    </footer>
  );
}
