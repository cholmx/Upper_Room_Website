import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import useFetch from '../hooks/useFetch';
import { useSite } from '../settings';
import { formatDate, isLive, messagePath, ytId } from '../utils';
import { Btn, Section, SectionHeader, Cards, Card, Photo } from '../components/ui';
import LiteYouTube from '../components/LiteYouTube';
import FormBlock from '../components/FormBlock';

export default function Home() {
  usePageMeta('home');
  const SITE = useSite();
  const { data } = useFetch('read/sermons?limit=10&sort=created_at:desc');
  const latest = useMemo(() => (data ?? []).filter(isLive)[0], [data]);
  const videoId = ytId(latest?.video_url || latest?.yt);

  return (
    <>
      {/* Hero and info strip: service time, address and the Plan Your Visit button show without scrolling on a phone */}
      <section aria-labelledby="home-h1" className="bg-[#F9F9F7]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-8 pb-6 md:pt-14 md:pb-10 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <h1 id="home-h1" className="text-[2.5rem] leading-[1.08] md:text-6xl">You are welcome here.</h1>
            <p className="mt-4 text-lg md:text-xl leading-relaxed text-[#2b2f2d]">
              The Upper Room Fellowship is a church family in Columbiana, Ohio. Join us {SITE.serviceTime}.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Btn to="/plan-your-visit" variant="primary">Plan Your Visit</Btn>
              <Btn to="/messages" variant="ghost">Watch the Latest Message</Btn>
            </div>
          </div>
          <Photo slot="home-hero" ratio="aspect-[4/3]" className="hidden md:flex" priority />
        </div>
      </section>

      <section aria-label="Service details" className="bg-[#0B1613] text-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-5 grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-4 items-center">
          <p className="font-semibold text-lg">{SITE.serviceTime}</p>
          <p>{SITE.addressLine}</p>
          <p>Service ends {SITE.serviceEnds}</p>
          <p>
            <a href={SITE.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center min-h-[44px] font-semibold text-[#FFC44F] underline underline-offset-4">
              Get Directions<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        </div>
      </section>
      <div className="md:hidden px-5 pt-6 bg-[#F9F9F7]">
        <Photo slot="home-hero" ratio="aspect-[4/3]" priority />
      </div>

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
        <div className="mt-8"><Btn to="/plan-your-visit" variant="ghost">See the full Sunday walkthrough</Btn></div>
      </Section>

      <Section tone="sand">
        <SectionHeader kicker="Our mission" title="Know God. Share Life. Serve Others." intro="These three things shape almost everything we do." />
        <Cards>
          <Card title="Know God"><p>We make room to meet God through worship, prayer, and the Bible, and we expect Him to show up.</p></Card>
          <Card title="Share Life"><p>Friendships grow in Table Groups, over coffee, and in the ordinary moments of the week.</p></Card>
          <Card title="Serve Others"><p>We put love to work around Columbiana and around the world.</p></Card>
        </Cards>
      </Section>

      <Section tone="white" className="">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <SectionHeader kicker="Our story" title="Our story" className="!mb-6" />
            <p className="text-lg leading-relaxed text-[#2b2f2d]">
              For more than fifty years, this church family has been gathering in Columbiana. We started in 1971 in an upper room above a veterinarian’s office, which is about as humble as church beginnings get. We still love this city, and we are glad to call it home.
            </p>
            <div className="mt-7"><Btn to="/about" variant="ghost">Read our story</Btn></div>
          </div>
          <Photo slot="about-columbiana" ratio="aspect-[4/3]" />
        </div>
      </Section>

      <Section tone="cream">
        <SectionHeader kicker="Latest message" title="Catch up on the latest message" intro="Missed a Sunday, or just curious what we teach? Watch it here before you ever walk through the door." />
        {latest ? (
          <div className="grid md:grid-cols-5 gap-8 items-center">
            <div className="md:col-span-3 aspect-video rounded-2xl overflow-hidden bg-[#0B1613]">
              {videoId ? <LiteYouTube id={videoId} title={latest.title} /> : (
                <div className="w-full h-full flex items-center justify-center text-white/80 p-6 text-center">Video coming soon</div>
              )}
            </div>
            <div className="md:col-span-2">
              <h3 className="text-2xl md:text-3xl"><Link to={messagePath(latest)} className="hover:text-[#8A6309]">{latest.title}</Link></h3>
              <p className="mt-2 text-[#2b2f2d]">{[latest.speaker, latest.date && formatDate(latest.date)].filter(Boolean).join(', ')}</p>
              <div className="mt-6"><Btn to="/messages" variant="primary">Browse all messages</Btn></div>
            </div>
          </div>
        ) : (
          <div><Btn to="/messages" variant="primary">Browse all messages</Btn></div>
        )}
      </Section>

      <Section tone="sand">
        <SectionHeader kicker="Next steps" title="Ready for a next step?" intro="Pick the one that fits." />
        <Cards cols={4}>
          <Card title="Join a Table Group" to="/table-groups" linkLabel="Find a group"><p>Meet with a small group in a home to study, pray, and share life.</p></Card>
          <Card title="Serve on a team" to="/serve" linkLabel="Find a team"><p>Everyone has something to offer. Find the team that fits you.</p></Card>
          <Card title="Get baptized" to="/next-steps#baptism" linkLabel="Tell us"><p>Tell us you are interested and we will walk you through it.</p></Card>
          <Card title="Join the Growth Track" to="/next-steps#growth-track" linkLabel="I am interested"><p>Get to know the church and find your place in it.</p></Card>
        </Cards>
      </Section>

      <Section tone="white">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <SectionHeader kicker="Serving Columbiana" title="Helping kids and families in our community" className="!mb-6" />
            <p className="text-lg leading-relaxed text-[#2b2f2d]">
              Through CarePortal, teachers, social workers, and other community workers share real needs of local children and families in crisis. Our church family responds with beds, appliances, rides, mentoring, and more. Over half of CarePortal requests get a response within 48 hours.
            </p>
            <div className="mt-7"><Btn to="/careportal" variant="ghost">See how CarePortal works</Btn></div>
          </div>
          <Photo slot="outreach-1" ratio="aspect-[4/3]" />
        </div>
      </Section>

      <Section tone="ink">
        <div className="max-w-3xl">
          <p className="u-kicker text-[#FFC44F]">Growth Campaign</p>
          <h2 className="text-3xl md:text-4xl">Transforming Together</h2>
          <p className="mt-4 text-lg md:text-xl text-white/90 leading-relaxed">Our sanctuary is full, and new people walk through our doors every week. We are raising money to make room for them.</p>
          <div className="mt-7"><Btn to="/transforming-together" variant="primary">Learn about the Growth Campaign</Btn></div>
        </div>
      </Section>

      <Section tone="cream">
        <div className="grid md:grid-cols-5 gap-10">
          <div className="md:col-span-2">
            <SectionHeader kicker="Contact" title="Questions? Say hello." className="!mb-4" />
            <p className="text-lg leading-relaxed text-[#2b2f2d]">
              Call <a className="underline underline-offset-4 font-semibold" href={SITE.phoneHref}>{SITE.phone}</a>, email <a className="underline underline-offset-4 font-semibold" href={`mailto:${SITE.email}`}>{SITE.email}</a>, or send a message here. We reply within 48 hours.
            </p>
            <address className="not-italic mt-5 text-[#2b2f2d]">{SITE.addressLine}</address>
          </div>
          <div className="md:col-span-3"><FormBlock formKey="contact" /></div>
        </div>
      </Section>
    </>
  );
}
