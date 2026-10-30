import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { useSite } from '../settings';
import { Btn, Section, SectionHeader, PageHeader, QuickFacts, Photo, PhotoGrid, Gloss, Todo, Accordion } from '../components/ui';
import FormBlock from '../components/FormBlock';
import ScrollStory, { Stage } from '../components/immersive/ScrollStory';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { FAQ_PREVIEW } from '../content/faq';

const { FiMapPin, FiMusic, FiCoffee, FiBookOpen, FiHeart } = FiIcons;

export default function PlanYourVisit() {
  usePageMeta('plan');
  const SITE = useSite();

  return (
    <>
      <PageHeader
        kicker="Plan your visit"
        title="Planning your first visit?"
        intro="We are glad you are here. Walking into a new church can feel intimidating, so this page covers a Sunday from the front door to the coffee line."
      >
        <Btn href={SITE.googleMapsUrl} variant="primary">Get Directions</Btn>
        <Btn to="#connect-card" variant="light">Fill Out the Connect Card</Btn>
      </PageHeader>

      <Section tone="cream" className="!pb-0 md:!pb-0">
        <QuickFacts
          items={[
            { label: 'When', value: SITE.serviceTime },
            { label: 'Where', value: SITE.addressLine },
            { label: 'How long', value: `The service usually ends ${SITE.serviceEnds}` },
            { label: 'What to wear', value: 'Whatever you are comfortable in' },
          ]}
        />
      </Section>

      <Section tone="cream">
        <SectionHeader kicker="Sunday" title="Your Sunday, step by step" />
        <Todo id="visit-times">[CONFIRM TIMES FOR EACH STEP]</Todo>
        <div className="mt-8">
          <ScrollStory
            label="Your Sunday, step by step"
            beats={[
              { title: 'When you arrive', visual: <Stage big="Arrive" small="Greeters at the door" icon={<SafeIcon icon={FiMapPin} size={34} />} />, body: <p>Friendly greeters will meet you at the doors, say hello, and help you find your way. If you have kids, they will point you to our secure check-in area.</p> },
              { title: 'We worship together', visual: <Stage big="Worship" small="Lyrics on the screen" icon={<SafeIcon icon={FiMusic} size={34} />} />, body: <p>Everyone starts in the same room, adults and children together. We sing contemporary songs with the lyrics on screen, and Scripture is on screen too, so you do not need a Bible. Stand, sit, or raise your hands.</p> },
              { title: 'Coffee and connection', visual: <Stage big="Coffee" small="Say hello, no spotlight" icon={<SafeIcon icon={FiCoffee} size={34} />} />, body: <p>After worship we take a short break for coffee and conversation. We never single out visitors or ask anyone to stand up and introduce themselves.</p> },
              { title: 'The message', visual: <Stage big="Message" small="Practical and Bible-based" icon={<SafeIcon icon={FiBookOpen} size={34} />} />, body: <p>Adults and teens stay for a practical, Bible-based message. Kids from birth through 5th grade go to their own programs right before it starts.</p> },
              { title: 'After the service', visual: <Stage big="Stay" small="Ask us anything" icon={<SafeIcon icon={FiHeart} size={34} />} />, body: <p>The service usually ends {SITE.serviceEnds}. Our team is happy to talk, answer questions, or pray with you. Stop by the <Gloss k="connectionCenter" /> to meet some of us.</p> },
            ]}
          />
        </div>
        <PhotoGrid slots={['plan-greeter', 'plan-coffee']} className="mt-12" />
      </Section>

      <Section tone="sand">
        <SectionHeader kicker="Getting here" title="Parking and getting here" />
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="space-y-5 text-lg leading-relaxed text-black/80">
            <p><Todo id="parking">[PARKING DETAILS: where to park, which door to use, where greeters stand]</Todo></p>
            <p>{SITE.addressLine}</p>
            <Btn href={SITE.googleMapsUrl} variant="primary">Get Directions</Btn>
            <Photo slot="plan-entrance" />
          </div>
          <div className="rounded-2xl overflow-hidden border border-black/10 bg-white aspect-[4/3]">
            <iframe title={`Map of ${SITE.addressLine}`} src={SITE.mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="w-full h-full border-0"></iframe>
          </div>
        </div>
      </Section>

      <Section tone="white">
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <SectionHeader kicker="Bringing kids" title="Your kids" className="!mb-5" />
            <div className="space-y-4 text-lg leading-relaxed text-black/80">
              <p>Upper Room Kids welcomes children from birth through 5th grade. The nursery is open for the whole service.</p>
              <p>Every volunteer is background-checked, and check-in makes sure only authorized adults can pick up your child.</p>
            </div>
            <div className="mt-6"><Btn to="/kids" variant="ghost">More about Upper Room Kids</Btn></div>
          </div>
          <div>
            <SectionHeader kicker="Accessibility" title="Everyone can take part" className="!mb-5" />
            <div className="space-y-4 text-lg leading-relaxed text-black/80">
              <p>Our building is fully wheelchair accessible. If you have trouble hearing, the free Listen Everywhere app streams the service audio to your phone. Tell us ahead of time about any other needs.</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Btn href={SITE.listenApps.apple} variant="ghost">Download on the App Store</Btn>
              <Btn href={SITE.listenApps.google} variant="ghost">Get it on Google Play</Btn>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="cream">
        <SectionHeader kicker="Quick answers" title="Quick answers" />
        <Accordion items={FAQ_PREVIEW} />
        <div className="mt-8"><Btn to="/faq" variant="ghost">See all questions</Btn></div>
      </Section>

      <Section tone="sand" id="connect-card">
        <div className="grid md:grid-cols-5 gap-10 items-start">
          <div className="md:col-span-2">
            <SectionHeader kicker="Let us know" title="Let us know you are coming" className="!mb-4" />
            <p className="text-lg leading-relaxed text-black/80">Fill out the Connect Card and our welcome team will be watching for you. It takes about a minute. We only use your information to help with your visit.</p>
          </div>
          <div className="md:col-span-3"><FormBlock formKey="connect" /></div>
        </div>
      </Section>

    </>
  );
}
