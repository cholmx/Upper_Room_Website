import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FOOTER_LINKS } from '../content/nav';
import { useSite } from '../settings';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowRight } = FiIcons;

const MORE = [
  { label: 'What We Believe', to: '/beliefs' },
  { label: 'Core Values', to: '/core-values' },
  { label: 'Leadership', to: '/leadership' },
  { label: 'Table Groups', to: '/table-groups' },
  { label: 'Give', href: true },
  { label: 'Accessibility', to: '/accessibility' },
  { label: 'Privacy', to: '/privacy' },
];

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };

function FooterLink({ to, external, children }) {
  const className = 'group flex items-center gap-2 opacity-80 hover:opacity-100 hover:text-[#FFC44F] transition-all duration-300 mb-3 text-[0.9rem]';
  const content = (
    <>
      <SafeIcon icon={FiArrowRight} className="text-[#FFC44F] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
      {children}
    </>
  );
  return external ? (
    <a href={to} target="_blank" rel="noopener noreferrer" className={className}>{content}</a>
  ) : (
    <Link to={to} className={className}>{content}</Link>
  );
}

const heading = 'font-serif italic uppercase text-[0.85rem] font-bold tracking-widest text-white/70 mb-6';

export default function Footer() {
  const SITE = useSite();
  return (
    <footer className="bg-[#0B1613] text-[#F9F9F7] relative overflow-hidden pb-20 md:pb-0">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FFC44F] rounded-full blur-[150px] opacity-5 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={container}
        className="max-w-[1145px] mx-auto px-6 py-20 md:py-24 flex flex-wrap gap-12 justify-between items-start relative z-10"
      >
        <motion.div variants={item} className="max-w-[26ch]">
          <h2 className="font-serif italic uppercase text-[1rem] tracking-widest text-[#FFC44F] mb-4" style={{ fontWeight: 700 }}>
            {SITE.name}
          </h2>
          <p className="opacity-80 text-[0.95rem] leading-relaxed mb-6">Transforming lives that transform communities since {SITE.founded}.</p>
          <ul className="flex flex-wrap gap-x-5" aria-label="Social media">
            {SITE.social.map(s => (
              <li key={s.label}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={`${s.label} (opens in a new tab)`} className="inline-flex items-center min-h-[44px] text-[0.9rem] opacity-80 hover:opacity-100 hover:text-[#FFC44F] underline-offset-4 hover:underline">{s.label}</a>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div variants={item}>
          <h2 className={heading}>Visit</h2>
          <address className="not-italic">
            <FooterLink external to={SITE.googleMapsUrl}>{SITE.address.street}, {SITE.address.city} {SITE.address.region} {SITE.address.postalCode}</FooterLink>
            <FooterLink external to={SITE.googleMapsUrl}>Get directions</FooterLink>
            <FooterLink external to={SITE.phoneHref}>{SITE.phone}</FooterLink>
            <FooterLink external to={`mailto:${SITE.email}`}>{SITE.email}</FooterLink>
            <p className="opacity-90 text-[0.9rem] font-bold mt-1">{SITE.serviceTime}</p>
          </address>
        </motion.div>

        <motion.nav variants={item} aria-label="Footer">
          <h2 className={heading}>Navigate</h2>
          {FOOTER_LINKS.map(l => <FooterLink key={l.to} to={l.to}>{l.label}</FooterLink>)}
        </motion.nav>

        <motion.div variants={item}>
          <h2 className={heading}>More</h2>
          {MORE.map(l => (l.href
            ? <FooterLink key={l.label} external to={SITE.giveUrl}>{l.label}</FooterLink>
            : <FooterLink key={l.to} to={l.to}>{l.label}</FooterLink>))}
        </motion.div>
      </motion.div>

      <div className="text-center text-[0.8rem] py-6 border-t border-white/10 flex flex-col items-center gap-2 relative z-10 bg-black/20">
        <p className="opacity-80">{SITE.serviceTime}. {SITE.addressLine}.</p>
        <p className="opacity-70">&copy; {new Date().getFullYear()} {SITE.name}. Columbiana, Ohio.</p>
        <Link to="/admin" className="hover:text-[#FFC44F] transition-colors uppercase tracking-widest font-bold mt-1 opacity-80">Content Studio Login</Link>
      </div>
    </footer>
  );
}
