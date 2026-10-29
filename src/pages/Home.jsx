import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import usePageMeta from '../hooks/usePageMeta';
import useFetch from '../hooks/useFetch';
import { useSite } from '../settings';
import { usePhoto } from '../photos';
import { HERO_IMAGES } from '../content/photos';
import { formatDate, imgUrl, isLive, messagePath, ytId } from '../utils';
import { Btn, Section, SectionHeader, Cards, Card, Photo } from '../components/ui';
import LiteYouTube from '../components/LiteYouTube';
import FormBlock from '../components/FormBlock';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiClock, FiMapPin, FiNavigation } = FiIcons;

export default function Home() {
  usePageMeta('home');
  const SITE = useSite();
  const { data } = useFetch('read/sermons?limit=10&sort=created_at:desc');
  const latest = useMemo(() => (data ?? []).filter(isLive)[0], [data]);
  const videoId = ytId(latest?.video_url || latest?.yt);
  const banner = usePhoto('banner-home').url;
  const story = usePhoto('about-story').url || HERO_IMAGES.home;
  const outreach = usePhoto('outreach-1').url;

  return (
    <>
      {/* Banner and service details: time, address and Plan Your Visit show without scrolling on a phone */}
      <section aria-labelledby="home-h1" className="photo-section bg-[#0B1613] py-8 md:py-44 px-6 relative" style={banner ? { backgroundImage: `url('${imgUrl(banner, 1600)}')` } : undefined}>
        <div className="scrim"></div>
        <div className="max-w-[1145px] mx-auto relative z-10 text-white">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: 'easeOut' }}>
            <span className="kicker text-[#FFC44F] tracking-widest drop-shadow-md !mb-2 md:!mb-4">{SITE.name}</span>
            <h1 id="home-h1" className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl max-w-[18ch] mb-3 md:mb-6 leading-[1.05] drop-shadow-lg">You are welcome here.</h1>
            <p className="font-serif italic text-xl md:text-3xl max-w-[40ch] text-white/90 mb-7 md:mb-10 drop-shadow-md leading-snug">
              The Upper Room Fellowship is a church family in Columbiana, Ohio. Join us {SITE.serviceTime}.
            </p>
            <div className="flex gap-3 md:gap-4">
              <Btn to="/plan-your-visit" variant="primary" className="max-sm:flex-1 max-sm:!px-3 max-sm:!py-3 max-sm:!text-[0.78rem] max-sm:leading-tight">Plan Your Visit</Btn>
              <Btn to="/messages" variant="light" className="max-sm:flex-1 max-sm:!px-3 max-sm:!py-3 max-sm:!text-[0.78rem] max-sm:leading-tight">Watch the Latest Message</Btn>
            </div>
          </motion.div>
        </div>
      </section>

      <section aria-label="Service details" className="bg-[#FFC44F] text-black">
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

      <Section tone="cream">
        <SectionHeader kicker="What Sunday looks like" title="What to expect on Sunday" intro="Most first visits go better when you know what to expect." />
        <Cards>
          <Card title="We worship together">
            <p>Adults and kids start the morning in the same room. The music is contemporary, and the lyrics and Scripture are on the screen, so you can leave your Bible at home. Stand, sit, or raise your hands. Anything works.</p>
          </Card>
          <Card title="We take a coffee break">
            <p>After worship we pause to grab coffee and say hello. Nobody asks visitors to stand up or introduce themselves. We would not do that to you.</p>
          </Card>
          <Card title="We learn together">
            <p>Adults and teens stay for a practical, Bible-based message. Kids from birth through 5th grade head to their own programs, and the nursery stays open the whole service.</p>
          </Card>
        </Cards>
        <div className="mt-10"><Btn to="/plan-your-visit" variant="ghost">See the full Sunday walkthrough</Btn></div>
      </Section>

      <section className="text-center py-24 md:py-32 px-6 bg-[#CCA866] text-black relative overflow-hidden" aria-labelledby="mission-h">
        <div className="max-w-[1145px] mx-auto">
          <h2 id="mission-h" className="text-4xl md:text-6xl lg:text-7xl max-w-[20ch] mx-auto leading-none">Know God.<br />Share Life.<br />Serve Others.</h2>
          <p className="mt-8 text-lg font-bold">These three things shape almost everything we do.</p>
          <div className="mt-12 grid md:grid-cols-3 gap-8 text-left">
            <div><h3 className="text-2xl mb-2">Know God</h3><p className="font-medium leading-relaxed">We make room to meet God through worship, prayer, and the Bible, and we expect Him to show up.</p></div>
            <div><h3 className="text-2xl mb-2">Share Life</h3><p className="font-medium leading-relaxed">Friendships grow in Table Groups, over coffee, and in the ordinary moments of the week.</p></div>
            <div><h3 className="text-2xl mb-2">Serve Others</h3><p className="font-medium leading-relaxed">We put love to work around Columbiana and around the world.</p></div>
          </div>
        </div>
      </section>

      <Section tone="ink">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="kicker text-[#FFC44F]">Our story</span>
            <h2 className="text-4xl md:text-5xl mb-6 leading-tight">Our story</h2>
            <p className="text-lg mb-10 text-white/85 leading-relaxed">
              For more than fifty years, this church family has been gathering in Columbiana. We started in 1971 in an upper room above a veterinarian’s office, which is about as humble as church beginnings get. We still love this city, and we are glad to call it home.
            </p>
            <Btn to="/about" variant="light">Read our story</Btn>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] md:aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative z-10">
              <img src={imgUrl(story, 1200)} alt="Upper Room Fellowship congregation gathering for worship" loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" />
            </div>
            <div className="absolute -bottom-6 -left-6 w-full h-full border-2 border-[#CCA866]/30 rounded-3xl z-0"></div>
          </div>
        </div>
      </Section>

      <Section tone="white">
        <SectionHeader kicker="Latest message" title="Catch up on the latest message" intro="Missed a Sunday, or just curious what we teach? Watch it here before you ever walk through the door." />
        {latest ? (
          <div className="grid md:grid-cols-5 gap-10 items-center">
            <div className="md:col-span-3 aspect-video rounded-3xl overflow-hidden bg-[#0B1613] shadow-xl">
              {videoId ? <LiteYouTube id={videoId} title={latest.title} /> : (
                <div className="w-full h-full flex items-center justify-center text-white/80 p-6 text-center">Video coming soon</div>
              )}
            </div>
            <div className="md:col-span-2">
              <h3 className="text-3xl"><Link to={messagePath(latest)} className="hover:text-[#8A6309]">{latest.title}</Link></h3>
              <p className="mt-3 text-black/80">{[latest.speaker, latest.date && formatDate(latest.date)].filter(Boolean).join(', ')}</p>
              <div className="mt-8"><Btn to="/messages" variant="primary">Browse all messages</Btn></div>
            </div>
          </div>
        ) : (
          <Btn to="/messages" variant="primary">Browse all messages</Btn>
        )}
      </Section>

      <Section tone="cream">
        <SectionHeader kicker="Next steps" title="Ready for a next step?" intro="Pick the one that fits." />
        <Cards cols={4}>
          <Card title="Join a Table Group" to="/table-groups" linkLabel="Find a group"><p>Meet with a small group in a home to study, pray, and share life.</p></Card>
          <Card title="Serve on a team" to="/serve" linkLabel="Find a team"><p>Everyone has something to offer. Find the team that fits you.</p></Card>
          <Card title="Get baptized" to="/next-steps#baptism" linkLabel="Tell us"><p>Tell us you are interested and we will walk you through it.</p></Card>
          <Card title="Join the Growth Track" to="/next-steps#growth-track" linkLabel="I am interested"><p>Get to know the church and find your place in it.</p></Card>
        </Cards>
      </Section>

      <Section tone="white">
        <div className={`grid gap-12 items-center ${outreach ? 'md:grid-cols-2' : ''}`}>
          <div>
            <SectionHeader kicker="Serving Columbiana" title="Helping kids and families in our community" className="!mb-6" />
            <p className="text-lg leading-relaxed text-black/80">
              Through CarePortal, teachers, social workers, and other community workers share real needs of local children and families in crisis. Our church family responds with beds, appliances, rides, mentoring, and more. Over half of CarePortal requests get a response within 48 hours.
            </p>
            <div className="mt-8"><Btn to="/careportal" variant="ghost">See how CarePortal works</Btn></div>
          </div>
          <Photo slot="outreach-1" />
        </div>
      </Section>

      <section className="text-center py-24 px-6 bg-gradient-to-b from-[#F9F9F7] to-white text-black border-y border-black/5 overflow-hidden" aria-labelledby="campaign-h">
        <div className="max-w-[1145px] mx-auto">
          <span className="kicker text-[#8A6309]">Growth Campaign</span>
          <h2 id="campaign-h" className="text-4xl md:text-6xl max-w-[20ch] mx-auto mb-6">Transforming Together</h2>
          <p className="text-lg max-w-[50ch] mx-auto text-black/80 leading-relaxed">Our sanctuary is full, and new people walk through our doors every week. We are raising money to make room for them.</p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Btn to="/transforming-together" variant="primary">Learn about the Growth Campaign</Btn>
          </div>
        </div>
      </section>

      <Section tone="cream">
        <div className="grid md:grid-cols-5 gap-12">
          <div className="md:col-span-2">
            <SectionHeader kicker="Contact" title="Questions? Say hello." className="!mb-4" />
            <p className="text-lg leading-relaxed text-black/80">
              Call <a className="underline underline-offset-4 font-bold" href={SITE.phoneHref}>{SITE.phone}</a>, email <a className="underline underline-offset-4 font-bold" href={`mailto:${SITE.email}`}>{SITE.email}</a>, or send a message here. We reply within 48 hours.
            </p>
            <address className="not-italic mt-5 text-black/80">{SITE.addressLine}</address>
          </div>
          <div className="md:col-span-3"><FormBlock formKey="contact" /></div>
        </div>
      </Section>
    </>
  );
}
