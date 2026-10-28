import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiHome, FiUsers, FiHeart, FiGift, FiArrowRight } = FiIcons;

export function nextSteps(site) {
  return [
    { title: 'Visit', text: 'Come this Sunday. We will save you a seat and show you around.', to: '/visit', label: 'Plan your visit', icon: FiHome },
    { title: 'Connect', text: 'Meet people, ask questions, or send us a prayer request.', to: '/contact', label: 'Say hello', icon: FiUsers },
    { title: 'Serve', text: 'Find a ministry where your gifts can make a difference.', to: '/ministries', label: 'See ministries', icon: FiHeart },
    { title: 'Give', text: 'Partner with the mission of transforming our community.', to: site.giveUrl, label: 'Give online', icon: FiGift, external: true },
  ];
}

export default function NextSteps({ site }) {
  const steps = nextSteps(site);
  return (
    <div key="nextsteps" className="py-24 px-6 bg-ink text-white relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-[420px] h-[420px] bg-gold rounded-full blur-[160px] opacity-10 pointer-events-none"></div>
      <div className="max-w-[1145px] mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="kicker text-gold">Next Steps</span>
          <h2 className="text-4xl md:text-5xl">Find Your Place Here</h2>
          <p className="font-serif italic text-xl opacity-70 mt-4 max-w-[40ch] mx-auto">Wherever you are, there is a next step to take.</p>
        </motion.div>

        <ol className="grid md:grid-cols-4 gap-10 md:gap-6 relative">
          <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" aria-hidden="true"></div>
          {steps.map((step, i) => {
            const body = (
              <>
                <span className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-sm text-gold group-hover:text-white transition-colors">
                  {step.label} <SafeIcon icon={FiArrowRight} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </>
            );
            return (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className="relative text-center md:px-2"
              >
                <div className="relative mx-auto w-16 h-16 rounded-full bg-gold text-black flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,196,79,0.25)]">
                  <SafeIcon icon={step.icon} className="text-2xl" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-ink border border-gold text-gold text-xs font-bold flex items-center justify-center">{i + 1}</span>
                </div>
                <h3 className="text-2xl mb-3">{step.title}</h3>
                <p className="opacity-70 leading-relaxed mb-5">{step.text}</p>
                {step.external ? (
                  <a href={step.to} target="_blank" rel="noopener noreferrer" className="group inline-block">{body}</a>
                ) : (
                  <Link to={step.to} className="group inline-block">{body}</Link>
                )}
              </motion.li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
