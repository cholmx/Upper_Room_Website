import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSite } from '../settings';
import usePageMeta from '../hooks/usePageMeta';
import PageHero from '../components/PageHero';
import SafeIcon from '../common/SafeIcon';
import { slideInLeft, slideInRight, fadeUp, staggerSlow } from '../lib/motion';
import * as FiIcons from 'react-icons/fi';

const { FiClock, FiMapPin, FiSmile, FiHelpCircle, FiCoffee, FiCar, FiCopy, FiCheck, FiNavigation, FiSmartphone } = FiIcons;

export default function Visit() {
  const SITE = useSite();
  usePageMeta('Plan Your Visit', 'Service times, directions and what to expect when you visit Upper Room Fellowship.');
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(SITE.addressLine);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#F9F9F7] min-h-screen text-black pt-20">
      <PageHero kicker={'Welcome Home'} title={'Plan Your Visit'} subtitle={"We can't wait to meet you this Sunday."} image="https://images.pexels.com/photos/8250816/pexels-photo-8250816.jpeg?auto=compress&cs=tinysrgb&h=1200" />

      <div className="py-24 px-6 max-w-[1300px] mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-24 relative rounded-[3rem] overflow-hidden shadow-2xl border border-black/10 min-h-[600px] flex items-center bg-[#0B1613]">
          <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity" style={{ backgroundImage: "url('https://images.pexels.com/photos/17508755/pexels-photo-17508755.jpeg?auto=compress&cs=tinysrgb&h=1200')" }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1613] via-[#0B1613]/80 to-transparent"></div>
          
          <div className="relative z-10 p-8 md:p-16 max-w-[600px] w-full">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-8 md:p-10 text-white shadow-2xl">
              <motion.span variants={slideInLeft} className="kicker text-[#FFC44F] flex items-center gap-2"><SafeIcon icon={FiMapPin} /> Location Hub</motion.span>
              <motion.h2 variants={slideInLeft} className="text-4xl md:text-5xl mb-2 font-bold leading-tight">{SITE.address.street}</motion.h2>
              <motion.p variants={slideInLeft} className="text-xl opacity-70 mb-8 font-serif italic">{SITE.address.city}, {SITE.address.region} {SITE.address.postalCode}</motion.p>
              
              <motion.div variants={fadeUp} className="flex items-center gap-4 text-lg font-bold bg-black/30 p-4 rounded-2xl mb-8 border border-white/5 w-fit">
                 <SafeIcon icon={FiClock} className="text-[#FFC44F] text-2xl" />
                 {SITE.serviceTime}
              </motion.div>

              <div className="space-y-4">
                <button onClick={handleCopy} className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group">
                  <span className="font-bold flex items-center gap-3">
                    {copied ? <SafeIcon icon={FiCheck} className="text-[#FFC44F]" /> : <SafeIcon icon={FiCopy} className="text-white/50" />}
                    {copied ? 'Address Copied!' : 'Copy Address'}
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <a href={SITE.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#FFC44F] text-black hover:bg-white transition-colors group text-center gap-2 font-bold">
                    <SafeIcon icon={FiNavigation} className="text-2xl" />
                    Google Maps
                  </a>
                  <a href={SITE.appleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/10 text-white hover:bg-white/20 border border-white/10 transition-colors group text-center gap-2 font-bold">
                    <SafeIcon icon={FiSmartphone} className="text-2xl" />
                    Apple Maps
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="absolute right-[15%] top-[40%] hidden lg:flex items-center justify-center">
             <div className="w-48 h-48 border border-[#FFC44F]/30 rounded-full absolute animate-ping opacity-50 duration-3000"></div>
             <div className="w-24 h-24 border border-[#FFC44F]/50 rounded-full absolute"></div>
             <div className="w-12 h-12 bg-[#FFC44F] rounded-full flex items-center justify-center text-black shadow-[0_0_40px_rgba(255,196,79,0.8)] relative z-10">
               <SafeIcon icon={FiMapPin} className="text-2xl" />
             </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start max-w-[1145px] mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerSlow} className="space-y-8">
            <motion.div variants={fadeUp} className="fcard bg-[#FFC44F] text-black">
              <motion.span variants={slideInLeft} className="kicker text-[#8A6309]">Kids Ministry</motion.span>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-white/40 rounded-full flex items-center justify-center text-[#8A6309] text-3xl shadow-sm">
                  <SafeIcon icon={FiSmile} />
                </div>
                <motion.h2 variants={slideInRight} className="text-3xl m-0">Bring the Family</motion.h2>
              </div>
              <motion.p variants={fadeUp} className="opacity-90 text-lg leading-relaxed font-medium">
                We have a dedicated, safe, and fun environment for your kids during the Sunday service. Our trained volunteers are passionate about teaching children about Jesus in a way they can understand.
              </motion.p>
            </motion.div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="fcard sticky top-32">
            <motion.div variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }} className="flex items-center gap-3 mb-10 border-b border-black/10 pb-6">
              <SafeIcon icon={FiHelpCircle} className="text-3xl text-[#8A6309]" />
              <motion.h2 variants={slideInLeft} className="text-3xl m-0">What to Expect</motion.h2>
            </motion.div>
            
            <div className="space-y-10">
              <div className="group">
                <div className="flex items-start gap-4">
                  <SafeIcon icon={FiClock} className="text-2xl text-gray-400 group-hover:text-[#8A6309] transition-colors mt-1" />
                  <div>
                    <h4 className="font-bold text-xl mb-2">How long is the service?</h4>
                    <p className="opacity-70 text-lg leading-relaxed">Our services typically last about 75 to 90 minutes. We start with a time of musical worship, followed by announcements, and a biblical, engaging message.</p>
                  </div>
                </div>
              </div>
              
              <div className="group">
                <div className="flex items-start gap-4">
                  <SafeIcon icon={FiCoffee} className="text-2xl text-gray-400 group-hover:text-[#8A6309] transition-colors mt-1" />
                  <div>
                    <h4 className="font-bold text-xl mb-2">What should I wear?</h4>
                    <p className="opacity-70 text-lg leading-relaxed">Come as you are! You'll see people in everything from jeans and t-shirts to business casual. We care more about you being here than what you wear.</p>
                  </div>
                </div>
              </div>
              
              <div className="group">
                <div className="flex items-start gap-4">
                  <SafeIcon icon={FiCar} className="text-2xl text-gray-400 group-hover:text-[#8A6309] transition-colors mt-1" />
                  <div>
                    <h4 className="font-bold text-xl mb-2">Where do I park?</h4>
                    <p className="opacity-70 text-lg leading-relaxed">We have ample parking right on our campus. When you pull in off Sponseller Road, feel free to park anywhere in the main lot. Our welcome team will be at the doors to greet you!</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}