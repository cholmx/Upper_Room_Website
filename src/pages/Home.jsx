import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import useFetch from '../hooks/useFetch';
import { useSite } from '../settings';
import { usePhoto } from '../photos';
import { HERO_IMAGES } from '../content/photos';
import { formatDate, imgUrl, isLive, messagePath, ytId } from '../utils';
import { Btn, Section } from '../components/ui';
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
  const connectPhoto = usePhoto('home-connect').url || HERO_IMAGES.connect;
  const { data } = useFetch('read/sermons?limit=10&sort=created_at:desc');
  const latest = useMemo(() => (data ?? []).filter(isLive)[0], [data]);
  const videoId = ytId(latest?.video_url || latest?.yt);

  return (
    <>
      <section aria-labelledby="home-h1" className="px-3 md:px-4 pt-3 md:pt-4 pb-1.5 md:pb-2">
        <div className="photo-section hero-photo rounded-[10px] bg-[#1e2522] min-h-[70vh] md:min-h-[85vh] flex items-end justify-center" style={{ backgroundImage: `url('${imgUrl(banner, 1800)}')` }}>
          <div className="hero-text w-full max-w-[900px] px-6 pb-16 md:pb-24 pt-32 text-center text-white">
            <h1 id="home-h1" className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-8 md:mb-10 leading-[1.05]">You are welcome here</h1>
            <Btn to="/plan-your-visit" variant="primary">Plan Your Visit</Btn>
          </div>
        </div>
      </section>

      <Spotlights />

      <Section tone="cream">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="aspect-[4/5] md:aspect-[5/6]"><Picture slot="home-welcome" fallback={HERO_IMAGES.about} /></div>
          <div>
            <p className="kicker text-[#c74f2f]">Transforming lives that transform communities</p>
            <h2 className="text-3xl md:text-5xl mb-6">Welcome to Upper Room Fellowship</h2>
            <div className={`space-y-4 text-[#1e2522]/80 ${P}`}>
              <p>For over 50 years, our congregation has been gathering in Columbiana to worship, grow, and serve together. We love this city and are proud to call it home.</p>
              <p>Together, we are learning to live with more love, joy, and purpose. We support each other and reach out to make our community better. Whether you are just exploring faith or looking for a church family, we would love to meet you and welcome you into ours.</p>
              <p><strong>{SITE.serviceTime}</strong><br /><strong>Location:</strong> {SITE.addressLine}</p>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Btn to="/plan-your-visit" variant="primary">New here?</Btn>
              <Link to="/about" className="font-display font-bold text-[0.95rem] tracking-wide border-b-2 border-[#1e2522] pb-1 hover:border-[#c74f2f]">More about us &rarr;</Link>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="forest">
        <div className="max-w-3xl mx-auto text-center">
          <p className="kicker text-[#eaa235]">Our vision</p>
          <h2 className="text-3xl md:text-5xl mb-6">Our vision statement</h2>
          <p className="text-[0.95rem] md:text-base leading-relaxed text-white">At Upper Room Fellowship, we exist to help people know God deeply, share life authentically, and serve others selflessly. Real change happens from the inside out as we align our hearts with God’s heart. Join us as we pursue healthy relationships, access abundant wholeness, discover our greatness, live supernaturally, treasure God’s presence, and live out the Gospel in tangible ways.</p>
          <blockquote className="mt-8 font-serif italic text-xl md:text-2xl leading-snug">
            “By this everyone will know that you are my disciples, if you love one another.”
            <footer className="mt-2 text-base font-serif not-italic">John 13:35</footer>
          </blockquote>
        </div>
      </Section>

      <Section tone="white">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <p className="kicker text-[#c74f2f]">Support Upper Room Fellowship</p>
            <h2 className="text-3xl md:text-5xl mb-5">Give online</h2>
            <p className={`mb-8 ${P}`}>Partner with us in transforming lives and communities through your generous support of our church’s mission and ministries.</p>
            <div className="flex flex-wrap items-center gap-5">
              <Btn href={SITE.giveUrl} variant="dark">Give online</Btn>
              <Link to="/give" className="font-display font-bold text-[0.95rem] tracking-wide border-b-2 border-[#1e2522] pb-1">Ways to give</Link>
            </div>
          </div>
          <div className="aspect-[4/3]"><Picture slot="home-give" fallback={HERO_IMAGES.ministries} /></div>
        </div>
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center mt-16 md:mt-24">
          <div className="aspect-[4/3] md:order-first order-last"><Picture slot="home-watch" fallback={HERO_IMAGES.messages} /></div>
          <div>
            <p className="kicker text-[#c74f2f]">Missed a Sunday?</p>
            <h2 className="text-3xl md:text-5xl mb-5">Watch latest message</h2>
            <p className={`mb-8 ${P}`}>Catch up on recent teachings that will help you grow in faith and apply biblical truths to your daily life.</p>
            <Btn to="/messages" variant="dark">Watch now</Btn>
          </div>
        </div>
      </Section>

      <Section tone="cream">
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

      <section aria-labelledby="stay-h" className="px-3 md:px-4 py-1.5 md:py-2">
        <div data-image-band="true" className="photo-section rounded-[10px] bg-[#1e2522] py-20 md:py-28 px-6 text-center text-white" style={{ backgroundImage: `url('${imgUrl(connectPhoto, 1600)}')` }}>
          <div className="hero-text relative z-10 max-w-2xl mx-auto">
            <h2 id="stay-h" className="text-3xl md:text-5xl mb-4">We would love to meet you</h2>
            <p className="text-[0.95rem] md:text-base mb-8">Whether you are planning your first visit or have just been with us, fill out the Connect Card so we can welcome you properly and help you find your place in our church family.</p>
            <Btn to="/connect" variant="primary">Fill out the Connect Card</Btn>
          </div>
        </div>
      </section>
    </>
  );
}
