import React from 'react';
import { motion } from 'framer-motion';
import usePageMeta from '../hooks/usePageMeta';
import { useSite } from '../settings';
import { usePhoto } from '../photos';
import { imgUrl } from '../utils';
import { Btn, Section, Boxes, Box } from '../components/ui';
import LightField from '../components/immersive/LightField';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMapPin } = FiIcons;
const P = 'text-lg leading-relaxed text-black/80';

export default function Home() {
  usePageMeta('home');
  const SITE = useSite();
  const heroPhoto = usePhoto('home-hero').url;
  const banner = usePhoto('banner-home').url || heroPhoto;

  return (
    <>
      <section aria-labelledby="home-h1" className="photo-section bg-[#1e2522] py-8 md:py-44 px-6 relative" style={banner ? { backgroundImage: `url('${imgUrl(banner, 1600)}')` } : undefined}>
        <div className="scrim"></div>
        <LightField />
        <div className="max-w-[1145px] mx-auto relative z-10 text-white">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: 'easeOut' }}>
            <p className="kicker text-[#eaa235] !mb-3 md:!mb-5 !text-[1.05rem] md:!text-[1.3rem] uppercase tracking-widest !flex flex-wrap gap-x-3 md:gap-x-5">
              <span>Know God</span><span aria-hidden="true">&middot;</span><span>Share Life</span><span aria-hidden="true">&middot;</span><span>Serve Others</span>
            </p>
            <h1 id="home-h1" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl max-w-[22ch] mb-3 md:mb-6 leading-[1.08]">Transforming lives that transform communities</h1>
            <p className="font-serif italic text-xl md:text-3xl max-w-[40ch] text-white/90 mb-7 md:mb-10 leading-tight">
              Join us {SITE.serviceTime} in Columbiana, Ohio
              <span className="block text-lg md:text-xl mt-2 text-white/80">{SITE.addressLine}</span>
            </p>
            <div className="flex gap-3 md:gap-4">
              <Btn to="/plan-your-visit" variant="primary" className="max-sm:flex-1 max-sm:!px-3 max-sm:!py-3 max-sm:!text-[0.85rem] max-sm:leading-tight">Plan Your Visit</Btn>
              <Btn to="/messages" variant="light" className="max-sm:flex-1 max-sm:!px-3 max-sm:!py-3 max-sm:!text-[0.85rem] max-sm:leading-tight">Watch Latest Message</Btn>
            </div>
          </motion.div>
        </div>
      </section>

      <Section tone="cream">
        <Boxes>
          <Box tone="sage" title="Welcome to Upper Room Fellowship">
            <p className="font-serif text-[1.5rem] leading-snug">For over 50 years, our congregation has been gathering in Columbiana to worship, grow, and serve together. We love this city and are proud to call it home.</p>
            <p>Together, we are learning to live with more love, joy, and purpose. We support each other and reach out to make our community better. Whether you are just exploring faith or looking for a church family, we would love to meet you and welcome you into ours.</p>
          </Box>
          <Box tone="amber" title="Plan your visit">
            <p>Find service times, directions to our Columbiana location, and helpful information for your first Sunday with us.</p>
            <p className="font-semibold">Join us {SITE.serviceTime} at {SITE.addressLine}.</p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Btn to="/plan-your-visit" variant="dark">New here?</Btn>
              <Btn href={SITE.googleMapsUrl} variant="dark">Get directions</Btn>
            </div>
          </Box>
        </Boxes>
      </Section>

      <Section tone="white">
        <Boxes>
          <Box tone="gold" title="Watch latest message">
            <p>Missed a Sunday? Catch up on recent teachings that will help you grow in faith and apply biblical truths to your daily life.</p>
            <div className="pt-2"><Btn to="/messages" variant="dark">Watch now</Btn></div>
          </Box>
          <Box tone="ink" title="Give online">
            <p>Partner with us in transforming lives and communities through your generous support of our church’s mission and ministries.</p>
            <div className="pt-2"><Btn href={SITE.giveUrl} variant="primary">Give online</Btn></div>
          </Box>
        </Boxes>
      </Section>

      <Section tone="cream">
        <Boxes>
          <Box tone="terra" title="Where & when">
            <address className="not-italic text-xl leading-relaxed">
              <p className="flex items-start gap-3"><SafeIcon icon={FiMapPin} className="mt-1.5 flex-shrink-0" />
                <span>{SITE.address.street}<br />{SITE.address.city} {SITE.address.region} {SITE.address.postalCode}</span></p>
              <p className="mt-4">Join us {SITE.serviceTime}</p>
            </address>
            <div className="pt-2"><Btn href={SITE.googleMapsUrl} variant="light">Get directions</Btn></div>
          </Box>
          <Box tone="forest" title="Our vision statement">
            <p>At Upper Room Fellowship, we exist to help people know God deeply, share life authentically, and serve others selflessly. Real change happens from the inside out as we align our hearts with God’s heart. Join us as we pursue healthy relationships, access abundant wholeness, discover our greatness, live supernaturally, treasure God’s presence, and live out the Gospel in tangible ways.</p>
            <blockquote className="border-l-4 border-[#eaa235] pl-5 font-serif italic text-xl leading-snug">
              “By this everyone will know that you are my disciples, if you love one another.”
              <footer className="mt-1 text-base font-sans not-italic">John 13:35</footer>
            </blockquote>
          </Box>
        </Boxes>
      </Section>
    </>
  );
}
