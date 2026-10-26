import React from 'react';
import { motion } from 'framer-motion';
import usePageMeta from '../hooks/usePageMeta';
import PageHero from '../components/PageHero';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiHeart, FiMusic, FiVideo, FiArrowRight } = FiIcons;

export default function Ministries() {
  usePageMeta('Ministries', 'Find where you belong and how you can serve at Upper Room Fellowship.');
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  return (
    <div className="bg-[#F9F9F7] min-h-screen text-black pt-20">
      {/* Hero */}
      <PageHero kicker={'Get Involved'} title={'Our Ministries'} subtitle={'Discover where you belong and how you can serve.'} image="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=2000" />

      {/* Content */}
      <div className="py-24 px-6 max-w-[1145px] mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="grid md:grid-cols-2 gap-8 lg:gap-12">
          
          <motion.div variants={fadeUp} className="fcard group cursor-pointer flex flex-col h-full relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFC44F]/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150"></div>
             <div className="flex items-center justify-between mb-8 relative z-10">
               <div className="w-16 h-16 bg-[#0B1613] text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:bg-[#FFC44F] group-hover:text-black transition-colors">
                 <SafeIcon icon={FiHeart} />
               </div>
               <div className="text-[#CCA866] font-bold text-5xl opacity-40 font-serif">01</div>
             </div>
             <h3 className="text-3xl font-bold mb-4 relative z-10 group-hover:text-[#A6790F] transition-colors">Kids Ministry</h3>
             <p className="text-lg opacity-70 leading-relaxed mb-8 flex-grow relative z-10">
               We provide a fun, safe, and engaging environment for children to learn about Jesus. From infants to elementary school, our dedicated team is passionate about raising the next generation.
             </p>
             <div className="mt-auto flex items-center text-sm font-bold uppercase tracking-wider text-[#A6790F] group-hover:text-black transition-colors relative z-10 border-t border-black/5 pt-6">
                Learn More <SafeIcon icon={FiArrowRight} className="ml-2 group-hover:translate-x-1 transition-transform" />
             </div>
          </motion.div>

          <motion.div variants={fadeUp} className="fcard group cursor-pointer flex flex-col h-full relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFC44F]/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150"></div>
             <div className="flex items-center justify-between mb-8 relative z-10">
               <div className="w-16 h-16 bg-[#0B1613] text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:bg-[#FFC44F] group-hover:text-black transition-colors">
                 <SafeIcon icon={FiUsers} />
               </div>
               <div className="text-[#CCA866] font-bold text-5xl opacity-40 font-serif">02</div>
             </div>
             <h3 className="text-3xl font-bold mb-4 relative z-10 group-hover:text-[#A6790F] transition-colors">Youth Ministry</h3>
             <p className="text-lg opacity-70 leading-relaxed mb-8 flex-grow relative z-10">
               Our youth ministry is designed to help teenagers navigate life with faith. We gather weekly for passionate worship, relevant teaching, and small group discussions to build a solid foundation.
             </p>
             <div className="mt-auto flex items-center text-sm font-bold uppercase tracking-wider text-[#A6790F] group-hover:text-black transition-colors relative z-10 border-t border-black/5 pt-6">
                Learn More <SafeIcon icon={FiArrowRight} className="ml-2 group-hover:translate-x-1 transition-transform" />
             </div>
          </motion.div>

          <motion.div variants={fadeUp} className="fcard group cursor-pointer flex flex-col h-full relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFC44F]/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150"></div>
             <div className="flex items-center justify-between mb-8 relative z-10">
               <div className="w-16 h-16 bg-[#0B1613] text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:bg-[#FFC44F] group-hover:text-black transition-colors">
                 <SafeIcon icon={FiUsers} />
               </div>
               <div className="text-[#CCA866] font-bold text-5xl opacity-40 font-serif">03</div>
             </div>
             <h3 className="text-3xl font-bold mb-4 relative z-10 group-hover:text-[#A6790F] transition-colors">Life Groups</h3>
             <p className="text-lg opacity-70 leading-relaxed mb-8 flex-grow relative z-10">
               We believe growth happens in circles, not rows. Life groups meet throughout the week in homes and at the church to study the Bible, pray together, and build genuine, lasting community.
             </p>
             <div className="mt-auto flex items-center text-sm font-bold uppercase tracking-wider text-[#A6790F] group-hover:text-black transition-colors relative z-10 border-t border-black/5 pt-6">
                Learn More <SafeIcon icon={FiArrowRight} className="ml-2 group-hover:translate-x-1 transition-transform" />
             </div>
          </motion.div>

          <motion.div variants={fadeUp} className="fcard group cursor-pointer flex flex-col h-full relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFC44F]/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150"></div>
             <div className="flex items-center justify-between mb-8 relative z-10">
               <div className="w-16 h-16 bg-[#0B1613] text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:bg-[#FFC44F] group-hover:text-black transition-colors">
                 <SafeIcon icon={FiVideo} />
               </div>
               <div className="text-[#CCA866] font-bold text-5xl opacity-40 font-serif">04</div>
             </div>
             <h3 className="text-3xl font-bold mb-4 relative z-10 group-hover:text-[#A6790F] transition-colors">Worship & Tech</h3>
             <p className="text-lg opacity-70 leading-relaxed mb-8 flex-grow relative z-10">
               If you have a passion for music, sound, cameras, or production, there's a place for you on our team. Help us create an atmosphere where people can seamlessly engage with God.
             </p>
             <div className="mt-auto flex items-center text-sm font-bold uppercase tracking-wider text-[#A6790F] group-hover:text-black transition-colors relative z-10 border-t border-black/5 pt-6">
                Learn More <SafeIcon icon={FiArrowRight} className="ml-2 group-hover:translate-x-1 transition-transform" />
             </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}