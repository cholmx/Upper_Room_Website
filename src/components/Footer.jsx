import { useSite } from '../settings';
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowRight } = FiIcons;

export default function Footer() {
  const SITE = useSite();
  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const FooterLink = ({ to, external, children }) => {
    const className = "group flex items-center gap-2 opacity-70 hover:opacity-100 hover:text-[#FFC44F] transition-all duration-300 mb-3 text-[0.9rem]";
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
  };

  return (
    <footer className="bg-[#0B1613] text-[#F9F9F7] relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FFC44F] rounded-full blur-[150px] opacity-5 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>

      <motion.div 
        initial="hidden" 
        whileInView="visible" 
        viewport={{ once: true, margin: "-50px" }} 
        variants={container} 
        className="max-w-[1145px] mx-auto px-6 py-24 flex flex-wrap gap-12 justify-between items-start relative z-10"
      >
        <motion.div variants={item} className="max-w-[24ch]">
          <h5 className="font-serif italic uppercase text-[1rem] tracking-widest text-[#FFC44F] mb-4">
            Upper Room Fellowship
          </h5>
          <p className="opacity-70 text-[0.95rem] leading-relaxed mb-8">
            Transforming lives that transform communities since 1971.
          </p>
        </motion.div>

        <motion.div variants={item}>
          <h5 className="font-serif italic uppercase text-[0.85rem] font-bold tracking-widest text-white/50 mb-6">
            Contact
          </h5>
          <FooterLink external to={`mailto:${SITE.email}`}>{SITE.email}</FooterLink>
          <FooterLink external to={SITE.phoneHref}>{SITE.phone}</FooterLink>
          <FooterLink external to={SITE.googleMapsUrl}>{SITE.address.street}, {SITE.address.city} {SITE.address.region}</FooterLink>
        </motion.div>

        <motion.div variants={item}>
          <h5 className="font-serif italic uppercase text-[0.85rem] font-bold tracking-widest text-white/50 mb-6">
            Navigate
          </h5>
          <FooterLink to="/about">About Us</FooterLink>
          <FooterLink to="/sermons">Messages</FooterLink>
          <FooterLink to="/events">Events</FooterLink>
          <FooterLink to="/blog">Blog</FooterLink>
          <FooterLink to="/contact">Contact Us</FooterLink>
        </motion.div>

        <motion.div variants={item}>
          <h5 className="font-serif italic uppercase text-[0.85rem] font-bold tracking-widest text-white/50 mb-6">
            More
          </h5>
          <FooterLink to="/p/beliefs">Our Beliefs</FooterLink>
          <FooterLink to="/about">Core Values</FooterLink>
          <FooterLink to="/ministries">Ministries</FooterLink>
          <FooterLink to="/p/leadership">Leadership</FooterLink>
        </motion.div>

        {SITE.social.length > 0 && (
          <motion.div variants={item}>
            <h5 className="font-serif italic uppercase text-[0.85rem] font-bold tracking-widest text-white/50 mb-6">
              Follow
            </h5>
            {SITE.social.map(link => (
              <FooterLink key={link.label} external to={link.url}>{link.label}</FooterLink>
            ))}
          </motion.div>
        )}
      </motion.div>
      
      <div className="text-center text-[0.75rem] opacity-40 py-6 border-t border-white/10 flex flex-col items-center gap-2 relative z-10 bg-black/20">
        <div>&copy; {new Date().getFullYear()} Upper Room Fellowship. All rights reserved.</div>
        <Link to="/admin" className="hover:text-[#FFC44F] transition-colors uppercase tracking-widest font-bold mt-2">Content Studio Login</Link>
      </div>
    </footer>
  );
}