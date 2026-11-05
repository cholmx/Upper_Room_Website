import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import useFetch from '../hooks/useFetch';
import { useSite } from '../settings';
import { usePhoto } from '../photos';
import { HERO_IMAGES } from '../content/photos';
import { formatDate, imgUrl, isLive, messagePath, ytId } from '../utils';
import { Btn, Section, Cards, Card } from '../components/ui';
import LiteYouTube from '../components/LiteYouTube';
import Spotlights from '../components/Spotlights';

const P = 'text-[0.95rem] leading-relaxed';

// A rounded photo that falls back to a default picture until one is uploaded in Site Photos.
function Picture({ slot, fallback, className = '' }) {
  const { url, alt } = usePhoto(slot);
  return <img src={imgUrl(url || fallback, 1000)} alt={url ? alt : ''} loading="lazy" className={`w-full h-full object-cover rounded-[10px] ${className}`} />;
}

export default function Home() {
  usePageMeta('home');
  const SITE = useSite();
  const heroPhoto = usePhoto('home-hero').url;
  const banner = usePhoto('banner-home').url || heroPhoto || HERO_IMAGES.home;
  const { data } = useFetch('read/sermons?limit=10&sort=created_at:desc');
  const latest = useMemo(() => (data ?? []).filter(isLive)[0], [data]);
  const videoId = ytId(latest?.video_url || latest?.yt);

  return (
    <>
      <section aria-labelledby="home-h1" className="px-3 md:px-4 pt-3 md:pt-4 pb-1.5 md:pb-2">
        <div className="photo-section hero-photo rounded-[10px] bg-[#1e2522] min-h-[70vh] md:min-h-[85vh] flex items-end justify-center" style={{ backgroundImage: `url('${imgUrl(banner, 1800)}')` }}>
          <div className="hero-text w-full max-w-[900px] px-6 pb-16 md:pb-24 pt-32 text-center text-white">
            <h1 id="home-h1" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 md:mb-8 leading-[1.1]">You are welcome here</h1>
            <Btn to="/plan-your-visit" variant="primary">Plan Your Visit</Btn>
          </div>
        </div>
      </section>

      <Spotlights />

      <Section tone="white">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="aspect-[4/5] md:aspect-[5/6]"><Picture slot="home-welcome" fallback={HERO_IMAGES.about} /></div>
          <div>
            <p className="kicker text-[#c74f2f]">Transforming lives that transform communities</p>
            <h2 className="text-3xl md:text-5xl mb-6">Welcome to Upper Room Fellowship</h2>
            <p className={`mb-4 font-semibold ${P}`}>Join us Sundays at 10:30am at 500 Sponseller Road in Columbiana, Ohio.</p>
            <div className={`space-y-4 text-[#1e2522]/80 ${P}`}>
              <p>We started in 1971 with a handful of believers meeting in a room above a veterinarian’s office in Columbiana. Fifty-five years later, we are still gathering here, still learning, and still looking for ways to serve the city we love.</p>
              <p>On Sundays, adult and kids classes begin at 9:30am. Worship follows at 10:30am with live music, clear Bible teaching, and time for coffee and conversation. Kids from birth through 5th grade have their own programs, and Wednesday evenings bring adult classes, youth groups, and childcare. Whether you are new to faith, returning after a long absence, or looking for a church home, we would be glad to meet you.</p>
            </div>
            <div className="mt-8"><Btn to="/plan-your-visit" variant="primary">Plan Your Visit</Btn></div>
          </div>
        </div>
      </Section>

      <Section tone="ink">
        <div className="grid md:grid-cols-3 gap-10 text-center md:text-left">
          {[
            ['Know God', 'Draw close to Him through worship, prayer, and Scripture.'],
            ['Share Life', 'Build honest friendships and find a church family.'],
            ['Serve Others', 'Use your gifts to love your neighbors and your city.'],
          ].map(([t, d]) => (
            <div key={t}>
              <h2 className="text-3xl md:text-4xl mb-3 text-[#eaa235]">{t}</h2>
              <p className="text-[0.95rem] leading-relaxed text-white">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="white">
        <Cards cols={4}>
          <Card title="Plan Your Visit" as="h3" to="/plan-your-visit" linkLabel="Plan your visit"><p>See what a Sunday looks like and tell us you are coming so we can greet you.</p></Card>
          <Card title="Hear the Latest Message" as="h3" to="/messages" linkLabel="Hear the latest message"><p>Catch up on recent teaching or browse the full library.</p></Card>
          <Card title="Grow With Us" as="h3" to="/discipleship" linkLabel="Grow with us"><p>Join a Sunday or Wednesday adult class at any time. Nothing to sign up for.</p></Card>
          <Card title="Give Online" as="h3" to={SITE.giveUrl} linkLabel="Give online"><p>Support the ministries and outreach of our church family.</p></Card>
        </Cards>
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
              <p className="mt-1 text-center text-[#1e2522]/70">{[latest.speaker, latest.date && formatDate(latest.date)].filter(Boolean).join(', ')}</p>
            </>
          ) : (
            <p className="text-center text-[#1e2522]/70">{data ? 'This week’s message will be posted soon.' : 'Loading the latest message.'}</p>
          )}
          <p className="mt-6 text-center"><Link to="/messages" className="font-display font-bold text-[0.95rem] border-b-2 border-[#1e2522] pb-1">All messages</Link></p>
        </div>
      </Section>

      <Section tone="gold">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl mb-5">Where and When</h2>
          <p className="text-[0.95rem] leading-relaxed">500 Sponseller Road, Columbiana, Ohio 44408</p>
          <p className="text-[0.95rem] leading-relaxed">Sunday classes at 9:30am. Worship at 10:30am.</p>
          <div className="mt-6"><Btn href={SITE.googleMapsUrl} variant="dark">Get Directions</Btn></div>
        </div>
      </Section>

      <Section tone="ink">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl mb-6">Our Vision</h2>
          <p className="text-xl md:text-2xl leading-snug mb-5 font-serif">We exist to help people know God deeply, share life authentically, and serve others selflessly.</p>
          <p className="text-[0.95rem] leading-relaxed text-white">Lasting change starts on the inside, as our hearts line up with God’s heart. That conviction shapes how we build relationships, how we pray, and how we serve.</p>
          <div className="mt-6"><Btn to="/core-values" variant="primary">Read Our Core Values</Btn></div>
          <blockquote className="mt-10 font-serif italic text-xl md:text-2xl leading-snug">
            “By this everyone will know that you are my disciples, if you love one another.”
            <footer className="mt-2 text-base font-serif not-italic">John 13:35</footer>
          </blockquote>
        </div>
      </Section>

      <Section tone="white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl mb-5">Contact Us</h2>
          <p className={`${P} mb-4`}>Have a question or a prayer request? Send us a message, and someone from our church family will reply within 48 hours.</p>
          <p className={P}>500 Sponseller Road, Columbiana, Ohio 44408</p>
          <p className={P}><a className="underline underline-offset-4 font-semibold" href="mailto:Info@urfellowship.com">Info@urfellowship.com</a></p>
          <p className={P}><a className="underline underline-offset-4 font-semibold" href={SITE.phoneHref}>330.482.9058</a></p>
          <div className="mt-6"><Btn to="/contact" variant="primary">Send a Message</Btn></div>
        </div>
      </Section>
    </>
  );
}
