import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import Media from '../components/Media';
import HeroHeading from '../components/HeroHeading';
import useFetch from '../hooks/useFetch';
import { useSite } from '../settings';
import { usePhoto } from '../photos';
import { HERO_IMAGES } from '../content/photos';
import { formatDate, isLive, messagePath, newestFirst, safeUrl, ytId } from '../utils';
import { plainText } from '../lib/markdown';
import { parseCategories } from '../lib/categories';
import NewBadge from '../components/NewBadge';
import SafeIcon from '../common/SafeIcon';
import { FiCalendar, FiUsers, FiHeart } from 'react-icons/fi';
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
  const pod = useFetch('read/podcast_episodes_church?sort=published_at:desc&limit=1');
  const episode = (pod.data || [])[0];

  return (
    <>
      <section aria-labelledby="home-h1" className="max-w-[1312px] mx-auto px-3 md:px-4 pt-3 md:pt-4 pb-1.5 md:pb-2">
        <div className="photo-section nav-fade text-shade hero-photo rounded-[10px] bg-[#1e2522] min-h-[70vh] md:min-h-[85vh] flex items-end">
          {banner && <Media src={banner} width={1800} priority className="photo-bg" />}
          <div className="hero-text w-full max-w-[900px] px-6 md:px-10 pb-14 md:pb-20 pt-32 text-left text-white">
            <HeroHeading id="home-h1" lines={[SITE.hero.title, ...(SITE.hero.lines || [])]} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 leading-[1.1]" />
            {SITE.hero.subtitle && <p className="font-serif text-lg md:text-2xl mb-6 leading-[1.12] md:leading-[1.12] text-white">{SITE.hero.subtitle}</p>}
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
        <ul className="grid md:grid-cols-3 gap-6 md:gap-8">
          {[
            ['Know God', 'Draw close to Him through worship, prayer, and Scripture.'],
            ['Share Life', 'Build honest friendships and find a church family.'],
            ['Serve Others', 'Use your gifts to love your neighbors and your city.'],
          ].map(([t, d]) => (
            <li key={t} className="bg-white rounded-[10px] p-7 md:p-8">
              <h2 className="text-3xl md:text-4xl mb-3">{t}</h2>
              <p className="text-[0.95rem] leading-relaxed text-black">{d}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="white">
        <div className="text-center mb-8 md:mb-10">
          <p className="kicker text-[#1e2522]">This Week’s Sermon</p>
          <h2 className="text-3xl md:text-5xl">Our Latest Message</h2>
        </div>
        <div className="max-w-5xl mx-auto">
          {latest ? (
            <>
              <div className="aspect-video bg-[#1e2522] rounded-[10px] overflow-hidden">
                {videoId ? <LiteYouTube id={videoId} title={latest.title} /> : <div className="w-full h-full flex items-center justify-center text-white/80 p-6 text-center">Video coming soon</div>}
              </div>
              <div className="mt-7 text-center max-w-3xl mx-auto">
                <NewBadge date={latest.date} className="mb-2 justify-center" />
                <h3 className="text-2xl md:text-4xl"><Link to={messagePath(latest)} className="hover:text-[#c74f2f]">{latest.title}</Link></h3>
                <p className="mt-2 text-black">{[latest.speaker, latest.date && formatDate(latest.date), latest.scripture].filter(Boolean).join('  |  ')}</p>
                {parseCategories(latest.topic).length > 0 && (
                  <ul className="mt-3 flex flex-wrap justify-center gap-2" aria-label="Categories">
                    {parseCategories(latest.topic).slice(0, 3).map(c => <li key={c} className="text-xs font-display font-bold px-3 py-1 rounded-full bg-[#e8e7e3]">{c}</li>)}
                  </ul>
                )}
                {latest.description && <p className="mt-4 text-[0.95rem] leading-relaxed text-black line-clamp-3">{plainText(latest.description)}</p>}
                <div className="mt-6 flex flex-wrap justify-center items-center gap-4">
                  <Btn to={messagePath(latest)} variant="primary">Watch and read</Btn>
                  <Link to="/messages" className="inline-flex items-center min-h-[44px] font-display font-bold text-[0.95rem] underline underline-offset-4">All messages</Link>
                </div>
              </div>
            </>
          ) : data ? (
            <p className="text-center text-black">This week’s message will be posted soon.</p>
          ) : (
            <div role="status" aria-label="Loading the latest message">
              <div className="aspect-video rounded-[10px] bg-[#e8e7e3] animate-pulse" />
              <span className="sr-only">Loading the latest message.</span>
              <div className="h-7 w-2/3 mx-auto rounded bg-[#e8e7e3] animate-pulse mt-7" />
              <div className="h-3 w-1/3 mx-auto rounded bg-[#e8e7e3] animate-pulse mt-3" />
            </div>
          )}
        </div>
      </Section>

      {episode && safeUrl(episode.audio_url) && (
        <Section tone="gray">
          <div className="grid md:grid-cols-5 gap-8 md:gap-12 items-center">
            <div className="md:col-span-2">
              <p className="kicker text-[#1e2522]">The Shine Podcast</p>
              <h2 className="text-3xl md:text-5xl mb-5">Hear from our church family</h2>
              <Link to="/shine" className="inline-flex items-center min-h-[44px] font-display font-bold text-[0.95rem] underline underline-offset-4">All episodes</Link>
            </div>
            <div className="md:col-span-3 bg-white rounded-[10px] p-5 md:p-6">
              <div className="flex gap-4 md:gap-5 items-start">
                {safeUrl(episode.image_url) && <img src={safeUrl(episode.image_url)} alt="" loading="lazy" decoding="async" width="600" height="600" className="w-14 md:w-20 shrink-0 aspect-square object-cover rounded-[10px] bg-[#e8e7e3]" />}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-black">{[episode.published_at && formatDate(episode.published_at), 'Newest episode'].filter(Boolean).join('  |  ')}</p>
                  <h3 className="text-xl md:text-2xl mt-1">{episode.title}</h3>
                  {episode.description && <p className="mt-2 text-[0.95rem] leading-relaxed text-black line-clamp-2">{episode.description}</p>}
                </div>
              </div>
              <audio controls preload="none" src={safeUrl(episode.audio_url)} className="w-full mt-4" aria-label={`Play ${episode.title}`} />
            </div>
          </div>
        </Section>
      )}

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
        <h2 className="text-3xl md:text-5xl mb-8">Start here</h2>
        <Cards cols={3}>
          <Card title="Plan Your Visit" as="h3" to="/plan-your-visit" linkLabel="Plan your visit" icon={<SafeIcon icon={FiCalendar} size={32} aria-hidden="true" className="text-[#c74f2f]" />}><p>See what a Sunday looks like and tell us you are coming so we can greet you.</p></Card>
          <Card title="Grow With Us" as="h3" to="/discipleship" linkLabel="Grow with us" icon={<SafeIcon icon={FiUsers} size={32} aria-hidden="true" className="text-[#c74f2f]" />}><p>Join a Sunday morning adult class. Our welcome team can help you find a place.</p></Card>
          <Card title="Give Online" as="h3" to={SITE.giveUrl} linkLabel="Give online" icon={<SafeIcon icon={FiHeart} size={32} aria-hidden="true" className="text-[#c74f2f]" />}><p>Support the ministries and outreach of our church family.</p></Card>
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
