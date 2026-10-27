import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import usePageMeta from '../hooks/usePageMeta';
import { publicDataFetch } from '../api';
import { formatDate, isLive, expandEvents, mergeSectionOrder } from '../utils';
import ThisWeek from '../components/home/ThisWeek';
import NextSteps from '../components/home/NextSteps';
import { Spinner } from '../components/StateViews';
import { plainText } from '../lib/markdown';
import { useSite } from '../settings';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowRight, FiPlay, FiCalendar, FiClock, FiMapPin, FiCopy, FiCheck, FiNavigation, FiSmartphone, FiCompass } = FiIcons;

export default function Home() {
  const SITE = useSite();
  usePageMeta('Home', `Upper Room Fellowship in ${SITE.address.city}, Ohio. Transforming lives that transform communities. Join us ${SITE.serviceTime}.`);
  const [hero, setHero] = useState(null);
  const [photoSections, setPhotoSections] = useState([]);
  const [sectionOrder, setSectionOrder] = useState([]);
  const [latestSermon, setLatestSermon] = useState(null);
  const [nextEvent, setNextEvent] = useState(null);
  const [latestPosts, setLatestPosts] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      setError(false);
      try {
        const [h, ps, so, s, e, b, g] = await Promise.all([
          publicDataFetch('read/hero_config'),
          publicDataFetch('read/photo_sections_church?sort=sort_order_num'),
          publicDataFetch('read/home_section_order_church?sort=sort_order_num_val'),
          publicDataFetch('read/sermons?limit=10&sort=created_at:desc'),
          publicDataFetch('read/events_church?sort=date:asc'),
          publicDataFetch('read/posts?limit=10&sort=created_at:desc'),
          publicDataFetch('read/gallery_church?sort=sort_order_num')
        ]);

        if (cancelled) return;
        if (h.status === 'success') setHero(h.data?.[0]);
        if (ps.status === 'success') setPhotoSections(ps.data ?? []);
        if (so.status === 'success') setSectionOrder(so.data ?? []);
        if (s.status === 'success') setLatestSermon((s.data ?? []).filter(isLive)[0]);
        if (e.status === 'success') setNextEvent(expandEvents((e.data ?? []).filter(isLive), undefined, 60)[0]);
        if (b.status === 'success') setLatestPosts((b.data ?? []).filter(isLive).slice(0, 3));
        if (g.status === 'success') setGallery(g.data ?? []);

        const failed = [h, ps, so, s, e, b, g].some(r => r.status === 'error');
        if (failed) setError(true);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [reloadKey]);

  const retry = () => setReloadKey(k => k + 1);

  const handleCopy = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(SITE.addressLine);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  const sections = {
    campaign: (
      <div key="campaign" className="text-center py-24 px-6 bg-gradient-to-b from-[#F9F9F7] to-white text-black border-b border-black/5 overflow-hidden">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}>
          <motion.span variants={slideInLeft} className="kicker text-[#8A6309]">Transforming Together</motion.span>
          <motion.h2 variants={slideInRight} className="text-4xl md:text-6xl max-w-[20ch] mx-auto mb-6">Growth Campaign</motion.h2>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <a className="btn btn-solid group" href="https://www.urfellowship.com/transforming-together" target="_blank" rel="noopener noreferrer">
              Learn More <SafeIcon icon={FiArrowRight} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a className="btn btn-outline border-black/20 hover:border-black" href={SITE.giveUrl} target="_blank" rel="noopener noreferrer">Give to Campaign</a>
          </div>
        </motion.div>
      </div>
    ),
    story: (
      <div key="story" className="py-24 px-6 bg-[#0B1613] text-[#F9F9F7] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#CCA866] rounded-full blur-[150px] opacity-10 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        
        <div className="max-w-[1145px] mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{
            visible: { transition: { staggerChildren: 0.1 } }
          }}>
            <motion.span variants={slideInLeft} className="kicker text-[#FFC44F]">Welcome</motion.span>
            <motion.h2 variants={slideInLeft} className="text-4xl md:text-5xl mb-6 leading-tight">Welcome to the Upper Room Fellowship</motion.h2>
            <motion.p variants={slideInLeft} className="text-lg mb-6 opacity-80 leading-relaxed">For over 50 years, our congregation has been gathering in Columbiana to worship, grow, and serve together.</motion.p>
            <motion.p variants={slideInLeft} className="text-lg mb-10 opacity-80 leading-relaxed">Together, we're learning to live with more love, joy, and purpose. We support each other and reach out to make our community better.</motion.p>
            <motion.div variants={slideInLeft}>
              <Link to="/about" className="btn btn-outline border-white/30 hover:border-white group">
                Read Our Story <SafeIcon icon={FiArrowRight} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
            <div className="aspect-[4/5] md:aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative z-10">
              <img src="https://images.pexels.com/photos/38274945/pexels-photo-38274945.jpeg?auto=compress&cs=tinysrgb&h=1200" alt="Upper Room Fellowship congregation gathering for worship" loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" />
            </div>
            <div className="absolute -bottom-6 -left-6 w-full h-full border-2 border-[#CCA866]/30 rounded-3xl z-0"></div>
          </motion.div>
        </div>
      </div>
    ),
    statement: (
      <div key="statement" className="text-center py-32 px-6 bg-[#CCA866] text-black relative overflow-hidden">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <motion.h2 variants={slideInLeft} className="text-4xl md:text-6xl lg:text-7xl max-w-[20ch] mx-auto leading-none">Know God.<br/>Share Life.<br/>Serve Others.</motion.h2>
        </motion.div>
      </div>
    ),
    wherewhen: (
      <div key="wherewhen" className="py-24 px-6 bg-[#0B1613] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1613] via-transparent to-[#0B1613] pointer-events-none"></div>

        <div className="max-w-[1300px] mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{
            visible: { transition: { staggerChildren: 0.1 } }
          }} className="text-center md:text-left mb-12">
            <motion.span variants={slideInLeft} className="kicker text-[#FFC44F]">Location Hub</motion.span>
            <motion.h2 variants={slideInLeft} className="text-4xl md:text-5xl lg:text-6xl">Where & When</motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="lg:col-span-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 md:p-12 flex flex-col justify-between group hover:bg-white/10 transition-colors duration-500">
              <div>
                <h3 className="text-3xl md:text-5xl mb-4 font-bold leading-tight">{SITE.address.street}<br/><span className="text-white/50">{SITE.address.city}, {SITE.address.region}</span></h3>
                <div className="flex flex-wrap items-center gap-4 mt-8">
                  <div className="flex items-center gap-3 bg-[#FFC44F] text-black px-6 py-3 rounded-full font-bold">
                    <SafeIcon icon={FiClock} className="text-xl" /> {SITE.serviceTime}
                  </div>
                  <button onClick={handleCopy} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-bold transition-colors">
                    {copied ? <><SafeIcon icon={FiCheck} className="text-[#FFC44F]" /> Copied!</> : <><SafeIcon icon={FiCopy} /> Copy Address</>}
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="lg:col-span-4 bg-[#FFC44F] rounded-[2rem] p-8 text-black flex flex-col justify-end relative overflow-hidden min-h-[300px] group">
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <iframe 
                  src={SITE.mapEmbedUrl}
                  className="w-full h-[150%] -translate-y-1/4 border-0 grayscale" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Church Location Map"
                ></iframe>
                <div className="absolute inset-0 bg-[#FFC44F] mix-blend-color z-10 pointer-events-none"></div>
                <div className="absolute inset-0 bg-[#FFC44F] opacity-40 mix-blend-multiply z-10 pointer-events-none"></div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-[#FFC44F] shadow-2xl scale-100 group-hover:scale-110 transition-transform duration-500">
                  <SafeIcon icon={FiMapPin} className="text-3xl" />
                </div>
              </div>
              
              <div className="relative z-20 mt-auto w-full pt-32">
                <a href={SITE.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="bg-black text-[#FFC44F] w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black/90 transition-colors shadow-xl">
                  <SafeIcon icon={FiCompass} className="text-xl" /> Explore Area
                </a>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="lg:col-span-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 flex flex-col justify-center">
              <h4 className="text-xl font-bold mb-6 flex items-center gap-2"><SafeIcon icon={FiNavigation} className="text-[#FFC44F]" /> Get Directions</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <a href={SITE.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group">
                  <span className="font-bold">Google Maps</span>
                  <SafeIcon icon={FiArrowRight} className="text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </a>
                <a href={SITE.appleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group">
                  <span className="font-bold">Apple Maps</span>
                  <SafeIcon icon={FiSmartphone} className="text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </a>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="lg:col-span-6 bg-gradient-to-br from-[#CCA866] to-[#A6790F] rounded-[2rem] p-8 text-black flex flex-col justify-center">
              <h4 className="text-xl font-bold mb-3">Plenty of Parking</h4>
              <p className="opacity-90 leading-relaxed font-medium">When you arrive on campus, feel free to park anywhere in the main lot. Our welcome team will be at the front doors ready to greet you and help you find your way.</p>
            </motion.div>
          </div>
        </div>
      </div>
    ),
    features: <ThisWeek key="features" site={SITE} sermon={latestSermon} event={nextEvent} />,
    nextsteps: <NextSteps key="nextsteps" site={SITE} />,
    latestposts: (
      <div key="latestposts" className="py-24 px-6 bg-white text-black border-t border-black/5">
        <div className="max-w-[1145px] mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{
            visible: { transition: { staggerChildren: 0.1 } }
          }} className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <motion.span variants={slideInLeft} className="kicker text-[#8A6309]">Insights & Updates</motion.span>
              <motion.h2 variants={slideInLeft} className="text-4xl md:text-5xl">Latest Articles</motion.h2>
            </div>
            <Link to="/blog" className="btn btn-outline border-black/20 hover:border-black text-black hidden md:inline-flex group">
              View All <SafeIcon icon={FiArrowRight} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          
          {latestPosts.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {latestPosts.map((post, i) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Link to={`/blog/${post.id}`} className="bg-[#F9F9F7] border border-black/5 rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group flex flex-col h-full">
                    <div className="aspect-video bg-[#0B1613] relative overflow-hidden">
                      {post.image_url ? (
                        <img src={post.image_url} alt={post.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white/50 bg-gradient-to-br from-[#0B1613] to-[#1A2E28]">
                          <span className="font-serif text-2xl">Upper Room</span>
                        </div>
                      )}
                      {post.category && (
                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur text-black text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm">
                          {post.category}
                        </div>
                      )}
                    </div>
                    <div className="p-8 flex flex-col flex-grow">
                      <div className="text-[10px] font-bold text-[#8A6309] uppercase tracking-wider mb-3">
                        {post.date ? formatDate(post.date) : formatDate(post.created_at)}
                      </div>
                      <h3 className="text-2xl font-bold mb-3 group-hover:text-[#8A6309] transition-colors leading-tight">{post.title}</h3>
                      <p className="opacity-70 text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">{plainText(post.body)}</p>
                      <div className="text-xs font-bold uppercase tracking-wider text-[#8A6309] group-hover:text-black transition-colors mt-auto pt-4 border-t border-black/5 flex items-center">
                        Read Article <SafeIcon icon={FiArrowRight} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#F9F9F7] rounded-3xl border border-black/5 opacity-60">More articles coming soon.</div>
          )}
          
          <div className="mt-10 text-center md:hidden">
             <Link to="/blog" className="btn btn-outline border-black text-black w-full justify-center">View All Articles</Link>
          </div>
        </div>
      </div>
    ),
    gallery: gallery.length === 0 ? null : (
      <div key="gallery" className="py-24 px-6 bg-[#F9F9F7] text-black">
        <div className="max-w-[1145px] mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{
            visible: { transition: { staggerChildren: 0.1 } }
          }} className="text-center mb-16">
            <motion.span variants={slideInLeft} className="kicker">Life at Upper Room</motion.span>
            <motion.h2 variants={slideInRight} className="text-4xl md:text-5xl">Community in Pictures</motion.h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gallery.map((photo, idx) => (
              <motion.div 
                key={photo.id ?? idx} 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="aspect-square bg-[#0B1613] overflow-hidden rounded-2xl border border-black/5 group"
              >
                <img src={photo.image_url} alt={photo.caption || 'Upper Room Fellowship community photo'} loading="lazy" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    ),
    photosections: (
      <div key="photosections">
        {photoSections.map(s => (
          <div key={s.id} className="photo-section py-40 px-6 text-center" style={{ backgroundImage: s.image_url ? `url('${s.image_url}')` : 'none' }}>
            <div className="scrim"></div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }} className="relative z-10 text-[#F9F9F7] max-w-[800px] mx-auto">
              <motion.h2 variants={slideInLeft} className="text-4xl md:text-6xl lg:text-7xl mb-6">{s.heading}</motion.h2>
              {s.subtext && <motion.p variants={slideInRight} className="font-serif italic text-2xl mb-10 opacity-90 leading-relaxed">{s.subtext}</motion.p>}
              {s.button_text && (
                <motion.div variants={fadeUp}>
                  <Link to={s.button_page_slug ? `/p/${s.button_page_slug}` : '/visit'} className="btn btn-solid group">
                    {s.button_text} <SafeIcon icon={FiArrowRight} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </div>
        ))}
        {photoSections.length === 0 && (
          <div className="py-32 px-6 text-center bg-[#FFC44F] text-black">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }} className="relative z-10">
              <motion.h2 variants={slideInLeft} className="text-4xl md:text-6xl mb-8">Join Us {SITE.serviceTime}</motion.h2>
              <motion.div variants={slideInRight}>
                <Link to="/visit" className="btn btn-outline border-black text-black hover:bg-black hover:text-[#FFC44F] group">
                  Plan Your Visit <SafeIcon icon={FiArrowRight} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        )}
      </div>
    )
  };

  const order = mergeSectionOrder(sectionOrder.map(s => s.section_key_name));

  return (
    <div className="pt-20">
      <div className="photo-section bg-[#0B1613] py-32 md:py-56 px-6 relative" style={{ backgroundImage: hero?.image_url ? `url('${hero.image_url}')` : 'none' }}>
        <div className="scrim"></div>
        <div className="max-w-[1145px] mx-auto relative z-10 text-white">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }}>
            <span className="kicker text-[#FFC44F] tracking-widest drop-shadow-md">Upper Room Fellowship</span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl max-w-[18ch] mb-6 leading-[1.05] drop-shadow-lg">
              {hero?.heading || 'Transforming lives that transform communities'}
            </h1>
            <p className="font-serif italic text-2xl md:text-3xl max-w-[40ch] opacity-90 mb-10 drop-shadow-md">
              {hero?.subtext || `Join us ${SITE.serviceTime} in ${SITE.address.city}, Ohio`}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/visit" className="btn btn-solid group">
                New Here? <SafeIcon icon={FiArrowRight} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/sermons" className="btn btn-outline border-white/50 text-white hover:border-white group">
                Watch a Message <SafeIcon icon={FiPlay} className="group-hover:scale-110 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
      {loading && <Spinner label="Loading the home page" />}
      {error && !loading && (
        <div className="bg-[#FFC44F]/20 border-y border-black/10 px-6 py-4 text-center">
          <p className="text-sm font-medium text-black/70 mb-2">Some sections didn't load.</p>
          <button onClick={retry} className="btn btn-solid text-sm py-2">Try Again</button>
        </div>
      )}
      {!loading && order.map(key => sections[key])}
    </div>
  );
}