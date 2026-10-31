import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import usePageMeta from '../hooks/usePageMeta';
import useFetch from '../hooks/useFetch';
import { useSite } from '../settings';
import { usePhoto } from '../photos';
import { formatDate, imgUrl, isLive, messagePath, ytId } from '../utils';
import { Section, SectionHeader, EndCta } from '../components/ui';
import LiteYouTube from '../components/LiteYouTube';
import FormBlock from '../components/FormBlock';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowRight, FiClock, FiMapPin, FiNavigation, FiPlay, FiHeart, FiUsers, FiGift, FiCheckCircle, FiLock, FiMail, FiPhone } = FiIcons;

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, ease: 'easeOut' },
};

const PILLARS = [
  { n: '01', icon: FiHeart, title: 'Know God', body: 'Pursuing deep, authentic relationship and God\'s living presence. We prioritize expectant worship, sound biblical teaching, and learning to hear His voice every day.', to: '/messages', cta: 'Explore worship gatherings' },
  { n: '02', icon: FiUsers, title: 'Share Life', body: 'Cultivating genuine biblical community, fellowship, and healthy relationships. Church is a spiritual family walking through celebrations and trials together.', to: '/ministries', cta: 'Connect in community groups' },
  { n: '03', icon: FiGift, title: 'Serve Others', body: 'Tangible Gospel demonstration through selfless service, CarePortal collaboration, and local outreach that meets real needs with compassion.', to: '/careportal', cta: 'Local and CarePortal outreach' },
];

const PRAYER_TABS = [
  { key: 'contact', label: 'General Inquiry' },
  { key: 'prayer', label: 'Confidential Prayer' },
  { key: 'connect', label: 'New Visitor Host' },
];

function PrayerTabs() {
  const [active, setActive] = useState(PRAYER_TABS[0].key);
  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" aria-label="Choose a form" className="flex flex-wrap gap-1 p-1 rounded-xl bg-white/70 border border-charcoal/10">
        {PRAYER_TABS.map(tab => {
          const on = tab.key === active;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActive(tab.key)}
              className={`flex-1 min-h-[44px] px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${on ? 'bg-charcoal text-linen shadow-md' : 'text-stone hover:text-charcoal'}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <FormBlock key={active} formKey={active} />
    </div>
  );
}

export default function Home() {
  usePageMeta('home');
  const SITE = useSite();
  const { data } = useFetch('read/sermons?limit=10&sort=created_at:desc');
  const latest = useMemo(() => (data ?? []).filter(isLive)[0], [data]);
  const videoId = ytId(latest?.video_url || latest?.yt);
  const banner = usePhoto('banner-home').url;

  return (
    <>
      <section aria-labelledby="home-h1" className="bg-linen pt-16 pb-20 md:pt-24 md:pb-28 px-6">
        <div className="max-w-[1240px] mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <motion.div {...reveal} className="lg:col-span-7 flex flex-col gap-6">
            <span className="inline-flex items-center gap-2 w-fit px-4 py-1.5 rounded-full bg-sandstone text-charcoal text-xs font-bold uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-harvest animate-pulse" aria-hidden="true"></span>
              {SITE.name}, {SITE.address.city} {SITE.address.region}
            </span>
            <h1 id="home-h1" className="font-headline text-4xl sm:text-5xl lg:text-6xl text-charcoal font-semibold leading-[1.15] max-w-2xl">
              You are welcome here.
            </h1>
            <p className="font-body text-lg text-stone max-w-xl leading-relaxed">
              The Upper Room Fellowship is a church family in Columbiana, Ohio. An authentic fellowship pursuing deeper intimacy with God, warm community, and purposeful outreach. Join us {SITE.serviceTime}.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/plan-your-visit" className="group inline-flex items-center gap-2 min-h-[48px] px-8 py-3 rounded-lg bg-harvest hover:bg-harvest-hover text-charcoal font-bold shadow-md hover:shadow-lg transition-all duration-300">
                Plan Your Visit
                <SafeIcon icon={FiArrowRight} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link to="/messages" className="inline-flex items-center gap-2 min-h-[48px] px-6 py-3 rounded-lg bg-sandstone hover:bg-[#e4dfcc] text-charcoal font-semibold transition-colors duration-300">
                <SafeIcon icon={FiPlay} className="text-harvest" />
                Watch Latest Teaching
              </Link>
            </div>
          </motion.div>

          <motion.div {...reveal} transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }} className="lg:col-span-5">
            <div className="relative p-8 rounded-xl bg-white shadow-xl overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-sandstone/60 pointer-events-none" aria-hidden="true"></div>
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-charcoal/10">
                <span className="text-xs uppercase tracking-widest text-harvest font-bold">Sunday Worship Gathering</span>
                <span className="text-xs font-semibold text-moss bg-moss/10 px-2.5 py-0.5 rounded-full">Weekly</span>
              </div>
              <ul className="flex flex-col gap-5">
                <li className="flex items-start gap-3">
                  <SafeIcon icon={FiClock} className="text-harvest text-xl mt-0.5 shrink-0" />
                  <div>
                    <p className="font-headline text-xl text-charcoal font-semibold">{SITE.serviceTime}</p>
                    <p className="text-sm text-stone">Service ends {SITE.serviceEnds}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <SafeIcon icon={FiMapPin} className="text-harvest text-xl mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-charcoal">{SITE.address.street}</p>
                    <p className="text-sm text-stone">{SITE.address.city}, {SITE.address.region} {SITE.address.postalCode}</p>
                  </div>
                </li>
              </ul>
              <a href={SITE.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="mt-7 w-full inline-flex items-center justify-center gap-2 min-h-[48px] rounded-lg bg-charcoal hover:bg-moss text-linen font-semibold transition-colors duration-300">
                <SafeIcon icon={FiNavigation} />
                Get Directions<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section aria-label="Our church" className="bg-linen py-20 md:py-28 px-6">
        <div className="max-w-[1240px] mx-auto">
          <motion.div {...reveal} className="flex flex-col items-center text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-widest text-harvest font-bold mb-3">Our Pillars</span>
            <h2 className="font-headline text-3xl md:text-4xl text-charcoal font-semibold leading-tight">Know God. Share Life. Serve Others.</h2>
            <p className="font-body text-base text-stone mt-4 leading-relaxed">Everything we do stems from three timeless callings that shape our gatherings, our growth, and our everyday relationships.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {PILLARS.map((p, i) => (
              <motion.div key={p.title} {...reveal} transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.1 }}>
                <Link to={p.to} className="group h-full flex flex-col justify-between p-8 rounded-xl bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-headline text-4xl font-bold text-harvest/60 group-hover:text-harvest transition-colors duration-300">{p.n}</span>
                      <span className="w-12 h-12 rounded-full bg-sandstone flex items-center justify-center text-moss">
                        <SafeIcon icon={p.icon} className="text-xl" />
                      </span>
                    </div>
                    <h3 className="font-headline text-2xl text-charcoal font-semibold mb-3">{p.title}</h3>
                    <p className="text-base text-stone leading-relaxed">{p.body}</p>
                  </div>
                  <div className="mt-8 pt-5 border-t border-charcoal/10 flex items-center gap-1 text-sm font-semibold text-moss group-hover:text-harvest transition-colors duration-300">
                    {p.cta}
                    <SafeIcon icon={FiArrowRight} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Section tone="white">
        <SectionHeader kicker="Latest message" title="Catch up on the latest message" intro="Missed a Sunday, or just curious what we teach? Watch it here before you ever walk through the door." />
        {latest ? (
          <div className="grid md:grid-cols-5 gap-10 items-center">
            <div className="md:col-span-3 aspect-video rounded-3xl overflow-hidden bg-charcoal shadow-xl">
              {videoId ? <LiteYouTube id={videoId} title={latest.title} /> : (
                <div className="w-full h-full flex items-center justify-center text-linen/80 p-6 text-center">Video coming soon</div>
              )}
            </div>
            <div className="md:col-span-2">
              <h3 className="font-headline text-3xl text-charcoal"><Link to={messagePath(latest)} className="hover:text-harvest-hover transition-colors">{latest.title}</Link></h3>
              <p className="mt-3 text-stone">{[latest.speaker, latest.date && formatDate(latest.date)].filter(Boolean).join(', ')}</p>
              <div className="mt-8"><Link to="/messages" className="inline-flex items-center gap-2 min-h-[48px] px-6 py-3 rounded-lg bg-charcoal hover:bg-moss text-linen font-semibold transition-colors duration-300">Browse all messages</Link></div>
            </div>
          </div>
        ) : (
          <Link to="/messages" className="inline-flex items-center gap-2 min-h-[48px] px-6 py-3 rounded-lg bg-charcoal hover:bg-moss text-linen font-semibold transition-colors duration-300">Browse all messages</Link>
        )}
      </Section>

      <section aria-label="Growth campaign" className="bg-charcoal text-linen py-16 md:py-20 px-6 relative overflow-hidden">
        <motion.div {...reveal} className="max-w-[1240px] mx-auto grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-8 flex flex-col gap-4">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-harvest font-bold">
              <SafeIcon icon={FiGift} className="text-base" /> Vision 2025 and beyond
            </span>
            <h2 className="font-headline text-3xl md:text-4xl font-semibold leading-tight">Transforming Together Growth Campaign</h2>
            <p className="text-base text-sandstone leading-relaxed">Our sanctuary is full, and we are raising funds to make room for the people still coming. Partner with what God is multiplying in our church and our community.</p>
          </div>
          <div className="lg:col-span-4 flex flex-col gap-3">
            <Link to="/transforming-together" className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 rounded-lg bg-harvest hover:bg-harvest-hover text-charcoal font-bold shadow-md transition-colors duration-300">
              Learn about the campaign
              <SafeIcon icon={FiArrowRight} />
            </Link>
            <a href={SITE.giveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center min-h-[48px] px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-linen font-semibold transition-colors duration-300">Give to the campaign<span className="sr-only"> (opens in a new tab)</span></a>
          </div>
        </motion.div>
      </section>

      <section aria-label="Where and when" className="bg-sandstone/50 py-20 md:py-28 px-6">
        <div className="max-w-[1240px] mx-auto grid lg:grid-cols-12 gap-10 items-stretch">
          <motion.div {...reveal} className="lg:col-span-5 flex flex-col justify-between gap-8 p-8 lg:p-10 rounded-2xl bg-white shadow-md">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <span className="w-12 h-12 rounded-full bg-harvest/15 text-harvest flex items-center justify-center">
                  <SafeIcon icon={FiMapPin} className="text-2xl" />
                </span>
                <div>
                  <span className="text-xs uppercase tracking-widest text-harvest font-bold">Directions and time</span>
                  <h2 className="font-headline text-3xl text-charcoal font-semibold">Where and When</h2>
                </div>
              </div>
              <div className="p-5 rounded-xl bg-sandstone/40">
                <span className="text-xs uppercase tracking-wider text-moss font-bold">Location</span>
                <p className="font-headline text-xl text-charcoal font-semibold mt-1">{SITE.address.street}</p>
                <p className="text-stone">{SITE.address.city}, {SITE.address.region} {SITE.address.postalCode}</p>
              </div>
              <div className="p-5 rounded-xl bg-sandstone/40">
                <span className="text-xs uppercase tracking-wider text-moss font-bold">Worship service</span>
                <p className="font-headline text-xl text-charcoal font-semibold mt-1">{SITE.serviceTime}</p>
                <p className="text-stone">{SITE.serviceEnds ? `Service ends ${SITE.serviceEnds}` : 'In person and online'}</p>
              </div>
              <ul className="flex flex-col gap-3 text-sm text-charcoal">
                <li className="flex items-center gap-3"><SafeIcon icon={FiCheckCircle} className="text-harvest text-lg shrink-0" /><span><strong>Dress code:</strong> Come as you are.</span></li>
                <li className="flex items-center gap-3"><SafeIcon icon={FiCheckCircle} className="text-harvest text-lg shrink-0" /><span><strong>Hospitality:</strong> Coffee and tea in the foyer.</span></li>
                <li className="flex items-center gap-3"><SafeIcon icon={FiCheckCircle} className="text-harvest text-lg shrink-0" /><span><strong>Kids check-in:</strong> Safe, fun classes for every age.</span></li>
              </ul>
            </div>
            <a href={SITE.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 min-h-[48px] rounded-lg bg-charcoal hover:bg-moss text-linen font-semibold transition-colors duration-300">
              <SafeIcon icon={FiNavigation} />
              Open in Google Maps<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </motion.div>

          <motion.div {...reveal} transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }} className="lg:col-span-7 relative min-h-[360px] rounded-2xl overflow-hidden shadow-md group">
            {banner && <img src={imgUrl(banner, 1200)} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" aria-hidden="true"></div>
            <div className="absolute top-6 left-6 max-w-xs p-5 rounded-xl bg-white/95 backdrop-blur-md shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <SafeIcon icon={FiMapPin} className="text-harvest text-lg" />
                <span className="font-headline text-base text-charcoal font-bold">{SITE.name}</span>
              </div>
              <p className="text-sm text-stone">Ample on-site guest parking</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section aria-labelledby="prayer-h2" className="bg-linen py-20 md:py-28 px-6">
        <div className="max-w-[1240px] mx-auto grid lg:grid-cols-12 gap-12 items-start">
          <motion.div {...reveal} className="lg:col-span-5 flex flex-col gap-5">
            <span className="text-xs uppercase tracking-widest text-harvest font-bold">We are here for you</span>
            <h2 id="prayer-h2" className="font-headline text-3xl md:text-4xl text-charcoal font-semibold leading-tight">Contact us and prayer requests</h2>
            <p className="text-base text-stone leading-relaxed">Have a question or need prayer? Choose the option below and a member of our church family will connect with you.</p>
            <div className="mt-4 flex flex-col gap-4">
              <a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-3 text-charcoal font-semibold hover:text-harvest-hover transition-colors"><span className="w-10 h-10 rounded-full bg-sandstone flex items-center justify-center text-harvest"><SafeIcon icon={FiMail} /></span>{SITE.email}</a>
              <a href={`tel:${SITE.phone}`} className="inline-flex items-center gap-3 text-charcoal font-semibold hover:text-harvest-hover transition-colors"><span className="w-10 h-10 rounded-full bg-sandstone flex items-center justify-center text-harvest"><SafeIcon icon={FiPhone} /></span>{SITE.phone}</a>
            </div>
            <p className="mt-2 flex items-center gap-2 text-sm text-stone p-4 rounded-lg bg-white/70 border border-charcoal/10">
              <SafeIcon icon={FiLock} className="text-moss shrink-0" />
              Prayer requests can be kept strictly confidential with our pastoral team.
            </p>
          </motion.div>
          <motion.div {...reveal} transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }} className="lg:col-span-7 p-6 md:p-10 rounded-2xl bg-sandstone/40 shadow-sm">
            <PrayerTabs />
          </motion.div>
        </div>
      </section>

      <EndCta title="Ready for a next step?" text="Join a small group, serve on a team, get baptized, or just ask a question. We will help you find the one that fits." to="/next-steps" label="See your next steps" />
    </>
  );
}
