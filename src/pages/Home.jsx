import React from 'react';
import { motion } from 'framer-motion';
import usePageMeta from '../hooks/usePageMeta';
import { useSite } from '../settings';
import { usePhoto } from '../photos';
import { imgUrl } from '../utils';
import { Btn, Section, SectionHeader, Cards, Card } from '../components/ui';
import FormBlock from '../components/FormBlock';
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
            <h1 id="home-h1" className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl max-w-[18ch] mb-3 md:mb-6 leading-[1.05]">Transforming lives that transform communities</h1>
            <p className="font-serif italic text-xl md:text-3xl max-w-[40ch] text-white/90 mb-7 md:mb-10 leading-snug">
              Join us {SITE.serviceTime} in Columbiana, Ohio
              <span className="block text-lg md:text-xl mt-2 text-white/80">{SITE.addressLine}</span>
            </p>
            <div className="flex gap-3 md:gap-4">
              <Btn to="/plan-your-visit" variant="primary" className="max-sm:flex-1 max-sm:!px-3 max-sm:!py-3 max-sm:!text-[1rem] max-sm:leading-tight">Plan Your Visit</Btn>
              <Btn to="/messages" variant="light" className="max-sm:flex-1 max-sm:!px-3 max-sm:!py-3 max-sm:!text-[1rem] max-sm:leading-tight">Watch Latest Message</Btn>
            </div>
          </motion.div>
        </div>
      </section>

      <Section tone="cream">
        <div className="max-w-3xl">
          <SectionHeader title="Welcome to Upper Room Fellowship" className="!mb-6" />
          <div className={`space-y-4 ${P}`}>
            <p>For over 50 years, our congregation has been gathering in Columbiana to worship, grow, and serve together. We love this city and are proud to call it home.</p>
            <p>Together, we are learning to live with more love, joy, and purpose. We support each other and reach out to make our community better. Whether you are just exploring faith or looking for a church family, we would love to meet you and welcome you into ours.</p>
          </div>
        </div>
      </Section>

      <Section tone="white">
        <SectionHeader kicker="Quick links" title="Quick links" />
        <Cards>
          <Card title="Plan your visit" to="/plan-your-visit" linkLabel="Plan your visit"><p>Find service times, directions to our Columbiana location, and helpful information for your first Sunday with us.</p></Card>
          <Card title="Watch latest message" to="/messages" linkLabel="Watch now"><p>Missed a Sunday? Catch up on recent teachings that will help you grow in faith and apply biblical truths to your daily life.</p></Card>
          <Card title="Give online" to={SITE.giveUrl} linkLabel="Give online"><p>Partner with us in transforming lives and communities through your generous support of our church’s mission and ministries.</p></Card>
        </Cards>
      </Section>

      <Section tone="forest">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <SectionHeader kicker="Where and when" title="Where & when" tone="dark" className="!mb-6" />
            <address className="not-italic text-xl leading-relaxed text-white/90">
              <p className="flex items-start gap-3"><SafeIcon icon={FiMapPin} className="mt-1.5 flex-shrink-0 text-[#eaa235]" />
                <span>{SITE.address.street}<br />{SITE.address.city} {SITE.address.region} {SITE.address.postalCode}</span></p>
              <p className="mt-4">Join us {SITE.serviceTime}</p>
            </address>
            <div className="mt-6"><Btn href={SITE.googleMapsUrl} variant="light">Get directions</Btn></div>
          </div>
          <div>
            <SectionHeader kicker="Our vision statement" title="Our vision statement" tone="dark" className="!mb-6" />
            <p className="text-lg leading-relaxed text-white/90">At Upper Room Fellowship, we exist to help people know God deeply, share life authentically, and serve others selflessly. Real change happens from the inside out as we align our hearts with God’s heart. Join us as we pursue healthy relationships, access abundant wholeness, discover our greatness, live supernaturally, treasure God’s presence, and live out the Gospel in tangible ways.</p>
            <blockquote className="mt-6 border-l-4 border-[#eaa235] pl-5 font-serif italic text-xl text-white">
              “By this everyone will know that you are my disciples, if you love one another.”
              <footer className="mt-1 text-base font-sans not-italic text-white/80">John 13:35</footer>
            </blockquote>
          </div>
        </div>
      </Section>

      <Section tone="cream">
        <div className="grid md:grid-cols-5 gap-12">
          <div className="md:col-span-2">
            <SectionHeader kicker="Contact us" title="Contact us" className="!mb-4" />
            <p className={P}>Reach out anytime. Have a question or need prayer? Fill out the form, and a member of our church family will connect with you soon.</p>
            <address className={`not-italic mt-5 space-y-1 ${P}`}>
              <p>{SITE.address.street}<br />{SITE.address.city} {SITE.address.region} {SITE.address.postalCode}</p>
              <p><a className="underline underline-offset-4 font-semibold text-[#2b433e]" href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
              <p><a className="underline underline-offset-4 font-semibold text-[#2b433e]" href={SITE.phoneHref}>{SITE.phone}</a></p>
            </address>
          </div>
          <div className="md:col-span-3"><FormBlock formKey="contact" /></div>
        </div>
      </Section>
    </>
  );
}
