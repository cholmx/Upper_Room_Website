import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import Media from '../components/Media';
import useFetch from '../hooks/useFetch';
import { useSite } from '../settings';
import { usePhoto } from '../photos';
import { HERO_IMAGES } from '../content/photos';
import { formatDate, isLive, messagePath, newestFirst, ytId } from '../utils';
import { Btn, Section, Cards, Card, SlotImage, PhotoSplit, PhotoBand, MapEmbed } from '../components/ui';
import LiteYouTube from '../components/LiteYouTube';
import Spotlights from '../components/Spotlights';
import { worshipLine } from '../lib/worship';

const P = 'text-[0.95rem] leading-relaxed';

export default function Home() {
  usePageMeta('home');
  // Worked out in the browser, so the static copy of the page never shows a stale day.
  const [worship, setWorship] = useState('');
  useEffect(() => { setWorship(worshipLine()); }, []);
  const SITE = useSite();
  const heroPhoto = usePhoto('home-hero').url;
  const bannerSlot = usePhoto('banner-home');
  // Nothing is drawn until the saved photos arrive, so the stock picture never flashes before the real one.
  const banner = !bannerSlot.loaded ? '' : bannerSlot.url || heroPhoto || HERO_IMAGES.home;
  const { data } = useFetch('read/sermons?sort=date:desc');
  const latest = useMemo(() => newestFirst(data).filter(isLive)[0], [data]);
  const videoId = ytId(latest?.video_url || latest?.yt);

  return (
    <>
      <section aria-labelledby="home-h1" className="max-w-[1312px] mx-auto px-3 md:px-4 pt-3 md:pt-4 pb-1.5 md:pb-2">
        <div className="photo-section nav-fade text-shade hero-photo rounded-[10px] bg-[#1e2522] min-h-[70vh] md:min-h-[85vh] flex items-end">
          {banner && <Media src={banner} width={1800} priority className="photo-bg" />}
          <div className="hero-text w-full max-w-[900px] px-6 md:px-10 pb-14 md:pb-20 pt-32 text-left text-white">
            <h1 id="home-h1" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 leading-[1.1]">{SITE.hero.title}</h1>
            {SITE.hero.subtitle && <p className="font-serif text-lg md:text-2xl mb-6 leading-snug">{SITE.hero.subtitle}</p>}
            <div className="mt-4">{SITE.hero.buttonLabel && SITE.hero.buttonUrl && <Btn to={SITE.hero.buttonUrl} variant="primary">{SITE.hero.buttonLabel}</Btn>}</div>
            {worship && <p className="mt-5 text-sm md:text-base">{worship}</p>}
          </div>
        </div>
      </section>

      <Spotlights />

      <Section tone="white">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <SlotImage slot="home-welcome" ratio="aspect-[4/5] md:aspect-[5/6]" />
          <div>
            <p className="kicker text-[#c74f2f]">Transforming lives that transform communities</p>
            <h2 className="text-3xl md:text-5xl mb-6">Welcome to Upper Room Fellowship</h2>
            <p className={`mb-4 font-semibold ${P}`}>Join us Sundays at 10:30am at 500 Sponseller Road in Columbiana, Ohio.</p>
            <div className={`space-y-4 text-black ${P}`}>
              <p>We started in 1971 with a handful of believers meeting in a room above a veterinarian’s office in Columbiana. Fifty-five years later, we are still gathering here, still learning, and still looking for ways to serve the city we love.</p>
              <p>On Sundays, adult and kids classes begin at 9:30am. Worship follows at 10:30am with live music, clear Bible teaching, and time for coffee and conversation. Kids from birth through 5th grade have their own programs, and Wednesday evenings bring adult classes, youth groups, and childcare. Whether you are new to faith, returning after a long absence, or looking for a church home, we would be glad to meet you.</p>
            </div>
            <div className="mt-8"><Btn to="/plan-your-visit" variant="primary">Plan Your Visit</Btn></div>
          </div>
        </div>
      </Section>

      <Section tone="gray">
        <div className="grid md:grid-cols-3 gap-10">
          {[
            ['Know God', 'Draw close to Him through worship, prayer, and Scripture.', 'home-know'],
            ['Share Life', 'Build honest friendships and find a church family.', 'home-share'],
            ['Serve Others', 'Use your gifts to love your neighbors and your city.', 'home-serve'],
          ].map(([t, d, slot]) => (
            <div key={t}>
              <h2 className="text-3xl md:text-4xl mb-3">{t}</h2>
              <p className="text-[0.95rem] leading-relaxed text-black">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="white">
        <div className="text-center mb-8">
          <p className="kicker text-[#1e2522]">This Week’s Sermon</p>
          <h2 className="text-3xl md:text-5xl">Our Latest Message</h2>
        </div>
        <div className="max-w-4xl mx-auto">
          {latest ? (
            <>
              <div className="aspect-video bg-[#1e2522] rounded-[10px] overflow-hidden elev-1">
                {videoId ? <LiteYouTube id={videoId} title={latest.title} /> : <div className="w-full h-full flex items-center justify-center text-white/80 p-6 text-center">Video coming soon</div>}
              </div>
              <p className="mt-5 text-center text-xl"><Link to={messagePath(latest)} className="font-semibold hover:text-[#c74f2f]">{latest.title}</Link></p>
              <p className="mt-1 text-center text-black">{[latest.speaker, latest.date && formatDate(latest.date)].filter(Boolean).join(', ')}</p>
            </>
          ) : (
            data ? <p className="text-center text-black">This week’s message will be posted soon.</p> : (
              <div role="status" aria-label="Loading the latest message">
                <div className="aspect-video rounded-[10px] bg-[#e8e7e3] animate-pulse" />
                <div className="h-5 w-2/3 mx-auto rounded bg-[#e8e7e3] animate-pulse mt-5" />
                <div className="h-3 w-1/3 mx-auto rounded bg-[#e8e7e3] animate-pulse mt-3" />
              </div>
            )
          )}
          <p className="mt-6 text-center"><Link to="/messages" className="font-display font-bold text-[0.95rem] border-b-2 border-[#1e2522] pb-1">All messages</Link></p>
        </div>
      </Section>

      <PhotoBand slot="home-where" wide>
        <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl mb-5">Where and When</h2>
            <p>500 Sponseller Road,<br />Columbiana, Ohio 44408</p>
            <p>Sunday classes at 9:30am.<br />Worship at 10:30am.</p>
          </div>
          <MapEmbed />
        </div>
      </PhotoBand>

      <Section tone="white">
        <Cards cols={4}>
          <Card title="Plan Your Visit" as="h3" to="/plan-your-visit" linkLabel="Plan your visit"><p>See what a Sunday looks like and tell us you are coming so we can greet you.</p></Card>
          <Card title="Hear the Latest Message" as="h3" to="/messages" linkLabel="Hear the latest message"><p>Catch up on recent teaching or browse the full library.</p></Card>
          <Card title="Grow With Us" as="h3" to="/discipleship" linkLabel="Grow with us"><p>Join a Sunday morning adult class. Our welcome team can help you find a place.</p></Card>
          <Card title="Give Online" as="h3" to={SITE.giveUrl} linkLabel="Give online"><p>Support the ministries and outreach of our church family.</p></Card>
        </Cards>
      </Section>

      <PhotoSplit tone="gray" slot="home-columbiana" side="left">
        <h2 className="text-3xl md:text-5xl mb-5">We love Columbiana</h2>
        <div className={`space-y-4 ${P}`}>
          <p>Columbiana has been our home since 1971, and we love this city and the people in it.</p>
          <p>As you look around this site, you will see photos from Columbiana, the places and the people of the community we are proud to call home.</p>
        </div>
      </PhotoSplit>

      <Section tone="white">
        <div className="max-w-3xl">
        <h2 className="text-3xl md:text-5xl mb-6">Our Vision</h2>
        <p className="text-xl md:text-2xl leading-snug mb-5 font-serif">We exist to help people know God deeply, share life authentically, and serve others selflessly.</p>
        <p className="text-[0.95rem] leading-relaxed text-black">Lasting change starts on the inside, as our hearts line up with God’s heart. That conviction shapes how we build relationships, how we pray, and how we serve.</p>
        <div className="mt-6"><Btn to="/core-values" variant="primary">Read Our Core Values</Btn></div>
        <blockquote className="mt-8 font-serif italic text-xl leading-snug">
          “By this everyone will know that you are my disciples, if you love one another.”
          <footer className="mt-2 text-base font-serif not-italic">John 13:35</footer>
        </blockquote>
      </div>
      </Section>

      <PhotoBand slot="home-contact">
        <h2 className="text-3xl md:text-5xl mb-5">Contact Us</h2>
        <p className="text-base leading-relaxed mb-4">Have a question or a prayer request? Send us a message, and someone from our church family will reply within 48 hours.</p>
        <p className="text-base leading-relaxed">500 Sponseller Road, Columbiana, Ohio 44408</p>
        <p className="text-base leading-relaxed"><a className="underline underline-offset-4 font-semibold" href="mailto:Info@urfellowship.com">Info@urfellowship.com</a></p>
        <p className="text-base leading-relaxed"><a className="underline underline-offset-4 font-semibold" href={SITE.phoneHref}>330.482.9058</a></p>
        <div className="mt-6"><Btn to="/contact" variant="primary">Send a Message</Btn></div>
      </PhotoBand>
    </>
  );
}
