import React from 'react';
import { motion } from 'framer-motion';
import { imgUrl } from '../utils';

export default function PageHero({ kicker, title, subtitle, image }) {
  return (
    <div className="photo-section text-[#F9F9F7] py-32 px-6 text-center" style={{ backgroundImage: `url('${imgUrl(image, 1600)}')` }}>
      <div className="scrim"></div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-[800px] mx-auto relative z-10"
      >
        <span className="kicker text-[#FFC44F]">{kicker}</span>
        <h1 className="text-5xl md:text-7xl mb-6 drop-shadow-lg">{title}</h1>
        {subtitle && (
          <p className="font-serif italic text-2xl opacity-90 max-w-[50ch] mx-auto drop-shadow-md">{subtitle}</p>
        )}
      </motion.div>
    </div>
  );
}
