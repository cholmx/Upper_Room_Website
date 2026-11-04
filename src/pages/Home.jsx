import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import usePageMeta from '../hooks/usePageMeta';
import useFetch from '../hooks/useFetch';
import { useSite } from '../settings';
import { usePhoto } from '../photos';
import { formatDate, imgUrl, isLive, messagePath, ytId } from '../utils';
import { Btn, Section, SectionHeader, Cards, Card, EndCta } from '../components/ui';
import LightField from '../components/immersive/LightField';
import LiteYouTube from '../components/LiteYouTube';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiClock, FiMapPin, FiNavigation } = FiIcons;

export default function Home() {
  usePageMeta('home');
  const SITE = useSite();
  const { data } = useFetch('read/sermons?limit=10&sort=created_at:desc');
  const latest = useMemo(() => (data ?? []).filter(isLive)[0], [data]);
  const videoId = ytId(latest?.video_url || latest?.yt);
  const heroPhoto = usePhoto('home-hero').url;
  const banner = usePhoto('banner-home').url || heroPhoto;

  return (
    <>
      {/* Banner and service details: time, address and Plan Your Visit show without scrolling on a phone */}
      <section aria-labelledby="home-h1" className="photo-section bg-[#1e2522] py-8 md:py-44 px-6 relative" style={banner ? { backgroundImage: `url('${imgUrl(banner, 1600)}')` } : undefined}>
        <div className="scrim"></div>
        <LightField />
        <div className="max-w-[1145px] mx-auto relative z-10 text-white">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: 'easeOut' }}>
            <span className="kicker text-[#eaa235] !mb-2 md:!mb-4">{SITE.name}</span>
            <h1 id="home-h1" className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl max-w-[18ch] mb-3 md:mb-6 leading-[1.05]">You are welcome here.</h1>
            <p className="font-serif text-xl md:text-3xl max-w-[40ch] text-white/90 mb-7 md:mb-10 leading-snug">
              The Upper Room Fellowship is a church family in Columbiana, Ohio. Join us {SITE.serviceTime}.
            </p>
            <div className="flex gap-3 md:gap-4">
              <Btn to="/plan-your-visit" variant="primary" className="max-sm:flex-1 max-sm:!px-3 max-sm:!py-3 max-sm:!text-[0.9rem] max-sm:leading-tight">Plan Your Visit</Btn>
              <Btn to="/messages" variant="light" className="max-sm:flex-1 max-sm:!px-3 max-sm:!py-3 max-sm:!text-[0.9rem] max-sm:leading-tight">Watch the Latest Message</Btn>
            </div>
          </motion.div>
        </div>
      </section>

      <section aria-label="Service details" className="bg-[#d49e46] text-[#1e2522]">
        <div className="max-w-[1145px] mx-auto px-6 py-4 md:py-5 grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-4 items-center font-bold text-[0.95rem]">
          <p className="flex items-center gap-3"><SafeIcon icon={FiClock} className="text-xl flex-shrink-0" /> {SITE.serviceTime}</p>
          <p className="flex items-center gap-3"><SafeIcon icon={FiMapPin} className="text-xl flex-shrink-0" /> {SITE.addressLine}</p>
          <p>Service ends {SITE.serviceEnds}</p>
          <p>
            <a href={SITE.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 min-h-[44px] underline underline-offset-4 hover:no-underline">
              <SafeIcon icon={FiNavigation} /> Get Directions<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        </div>
      </section>

      <Section tone="white">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <SectionHeader kicker="Welcome" title="Welcome to the Upper Room Fellowship" className="!mb-6" />
            <div className="space-y-4 text-lg leading-relaxed text-black/80">
              <p>For more than 50 years, our congregation has gathered in Columbiana to worship, grow, and serve together. We love this city and are proud to call it home.</p>
              <p>Together, we are learning to live with more love, joy, and purpose. We support each other and reach out to make our community better. Whether you are just exploring faith or looking for a church family, we would love to meet you and welcome you into ours.</p>
            </div>
          </div>
          <div className="neu rounded-3xl p-8 md:p-10">
            <span className="kicker text-[#2b433e]">Our vision</span>
            <p className="text-lg leading-relaxed text-black/80">We exist to help people know God deeply, share life authentically, and serve others selflessly. Real change happens from the inside out as our hearts line up with God’s heart. Along the way we pursue healthy relationships, abundant wholeness, our God-given greatness, a supernatural lifestyle, God’s presence, and a life that lives out the Gospel in tangible ways.</p>
            <blockquote className="mt-5 border-l-4 border-[#d49e46] pl-5 font-serif text-lg">
              “By this everyone will know that you are my disciples, if you love one another.”
              <footer className="mt-1 text-base font-sans not-italic text-black/70">John 13:35</footer>
            </blockquote>
          </div>
        </div>
      </Section>

      <Section tone="cream">
        <SectionHeader kicker="What Sunday looks like" title="What to expect on Sunday" intro="Most first visits go better when you know what to expect." />
        <Cards>
          <Card title="We worship together">
            <p>Adults and kids start in the same room. The music is contemporary and the words are on the screen, so leave your Bible at home if you like.</p>
          </Card>
          <Card title="We take a coffee break">
            <p>After worship we grab coffee and say hello. Nobody asks visitors to stand up or introduce themselves.</p>
          </Card>
          <Card title="We learn together">
            <p>Adults and teens hear a practical, Bible-based message. Kids from birth through 5th grade have their own programs.</p>
          </Card>
        </Cards>
        <div className="mt-10"><Btn to="/plan-your-visit" variant="ghost">See the full Sunday walkthrough</Btn></div>
      </Section>

      <Section tone="white">
        <SectionHeader kicker="Latest message" title="Catch up on the latest message" intro="Missed a Sunday, or just curious what we teach? Watch it here before you ever walk through the door." />
        {latest ? (
          <div className="grid md:grid-cols-5 gap-10 items-center">
            <div className="md:col-span-3 aspect-video rounded-3xl overflow-hidden bg-[#1e2522] elev-1">
              {videoId ? <LiteYouTube id={videoId} title={latest.title} /> : (
                <div className="w-full h-full flex items-center justify-center text-white/80 p-6 text-center">Video coming soon</div>
              )}
            </div>
            <div className="md:col-span-2">
              <h3 className="text-3xl"><Link to={messagePath(latest)} className="hover:text-[#2b433e]">{latest.title}</Link></h3>
              <p className="mt-3 text-black/80">{[latest.speaker, latest.date && formatDate(latest.date)].filter(Boolean).join(', ')}</p>
              <div className="mt-8"><Btn to="/messages" variant="primary">Browse all messages</Btn></div>
            </div>
          </div>
        ) : (
          <Btn to="/messages" variant="primary">Browse all messages</Btn>
        )}
      </Section>

      <section className="bg-[#c74f2f] text-white px-6 py-8" aria-label="Growth campaign">
        <div className="max-w-[1145px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-lg"><span className="font-bold">Transforming Together.</span> Our sanctuary is full, and we are raising money to make room for the people still coming.</p>
          <Btn to="/transforming-together" variant="light" className="self-start md:self-auto">Learn about the Growth Campaign</Btn>
        </div>
      </section>

      <EndCta title="Ready for a next step?" text="Join a small group, serve on a team, get baptized, or just ask a question. We will help you find the one that fits." to="/next-steps" label="See your next steps" />
    </>
  );
}
