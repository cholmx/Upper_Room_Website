import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { Section, SectionHeader, PageHeader, PageNav, Accordion, Steps, Band, Panel, PhotoSplit, PhotoBand, SlotImage } from '../components/ui';
import { useSite } from '../settings';
import { SOZO_FAQ as FAQ } from '../content/faqs';

const P = 'text-[0.95rem] leading-relaxed text-black';

const TOOLS = [
  ['The Father Ladder', 'Our earliest relationships shape how we see God. This tool explores those connections and heals the places where past experiences have distorted your view of the Father, Jesus, or the Holy Spirit. Many people discover a Heavenly Father who is nothing like the human authorities who let them down.'],
  ['The Wall', 'Hurt, false beliefs, unforgiveness, and sin patterns can build barriers between us and God. As each brick comes to light, you invite Jesus into that area for healing. Many people feel real freedom as the wall comes down.'],
  ['Presenting Jesus', 'This tool invites Jesus into painful memories. Instead of analyzing the past, you experience His healing presence in it. Many people see an old event from a new angle as Jesus shows them what was true.'],
];

const READING = [
  'Healing the Wounded Heart by Dan Allender',
  'The Transformation of the Inner Man by John and Paula Sandford',
  'Healing for Damaged Emotions by David Seamands',
  'Restoration Year by John Eldredge',
  'Emotionally Healthy Spirituality by Peter Scazzero',
];

export default function Sozo() {
  usePageMeta('sozo');
  const SITE = useSite();
  return (
    <>
      <PageHeader kicker="Sozo" title="What is Sozo?" intro="Sozo is a Greek word that appears more than 100 times in the New Testament. It means to save, deliver, make whole, restore, and heal." />

      <PageNav items={[['session', 'What happens'], ['tools', 'The tools'], ['begin', 'How to begin'], ['faq', 'Questions'], ['reading', 'Reading']]} />

      <Section tone="white">
        <div className="max-w-3xl">
        <div className={`space-y-4 ${P}`}>
          <p className="lead">“Sozo” is a Greek word that appears more than 100 times in the New Testament. It means to save, deliver, make whole, restore, and heal. In Matthew 9:22, Jesus uses it when He tells a woman her faith has made her well.</p>
          <p>Do you feel stuck in some area of your life? Do you sense there is more to your relationship with God than you are experiencing? Sozo is gentle, Spirit-led prayer ministry that helps you find and remove the barriers between you and God, and step into the identity and purpose He has given you.</p>
        </div>
      </div>
      </Section>

      <Section tone="white" id="session">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16">
          <div>
            <SectionHeader title="What happens in a session" className="!mb-6" />
            <p className={P}>Two trained team members sit down with you and, with the help of the Holy Spirit, guide you through a series of questions and tools. The session opens with prayer, moves through the tools as the Spirit leads, and closes with prayer and a short conversation about next steps. A session lasts about two hours, and you decide what you share.</p>
          </div>
          <div>
            <SectionHeader title="Our approach" className="!mb-6" />
            <p className={P}>We aim to love people and offer a safe place where old wounds can heal, lies give way to truth, and doors opened to the enemy are closed. Through prayer, we help you find freedom from emotional pain, break unhealthy ties and thought patterns, uncover barriers between you and God, discover your identity in Christ, and walk in the destiny He has for you.</p>
          </div>
        </div>
      </Section>

      <PhotoBand slot="sozo-foundation">
        <h2 className="text-3xl md:text-5xl mb-5">Biblical foundation</h2>
        <ul className="list-disc pl-6 space-y-2 text-base">
          <li>God wants His children whole and free (John 10:10, Isaiah 61:1-3).</li>
          <li>Truth sets us free (John 8:32).</li>
          <li>We are transformed by the renewing of our minds (Romans 12:2).</li>
          <li>Healing comes through relationship with the Father, Son, and Holy Spirit (James 5:16, Psalm 147:3).</li>
        </ul>
      </PhotoBand>

      <Section tone="white" id="tools">
        <SectionHeader title="Our Sozo tools" />
        <div className="grid md:grid-cols-3 gap-6">
          {TOOLS.map(([t, d]) => (
            <div key={t} className="fcard !p-8">
              <h3 className="text-2xl mb-3">{t}</h3>
              <p className={P}>{d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Band>
        <Panel title="What Sozo is not">
          <p>Sozo is prayer ministry. It does not replace counseling, professional mental health care, or medical care. It is not fortune-telling, it is not a formula that works automatically, and it never forces healing or deliverance on anyone. If you are in crisis, call or text 988 right away.</p>
        </Panel>
        <Panel title="Our team">
          <p>Every Sozo team member has completed specialized training, committed to ongoing spiritual growth, agreed to strict confidentiality standards, and gone through a thorough application process. They serve under the covering and accountability of our church leadership, and they know that the Holy Spirit brings the healing.</p>
        </Panel>
      </Band>

      <Section tone="white" id="begin">
        <div className="max-w-3xl">
        <SectionHeader title="How to begin" className="!mb-6" />
        <Steps items={[
          { title: 'Prepare your heart', body: <p>Pray about receiving Sozo, think about the areas where you want more freedom, and come ready to meet with God.</p> },
          { title: 'Reach out', body: <p>Email <a className="underline underline-offset-4 font-semibold" href={`mailto:${SITE.email}`}>{SITE.email}</a> with your full name, phone number, and best times to reach you. A brief note about why you are seeking Sozo is optional. Your inquiry is confidential.</p> },
          { title: 'Schedule', body: <p>Our Sozo coordinator will contact you within 3 to 5 business days, answer your questions, match you with a ministry team, and find a time that works.</p> },
          { title: 'Partner with us', body: <p>We suggest a $40 donation to support the ministry, and financial help is available. Healing should be within reach of everyone. You can pay at your appointment by cash, check, or card.</p> },
        ]} />
      </div>
      </Section>

      <Section tone="white" narrow id="faq">
        <SectionHeader title="Frequently asked questions" />
        <Accordion group="sozo-faq" items={FAQ.map(([q, a]) => ({ id: q.toLowerCase().replace(/[^a-z]+/g, '-'), title: q, content: <p className={P}>{a}</p> }))} />
      </Section>

      <Section tone="white" narrow id="reading">
        <SectionHeader title="Recommended reading" />
        <ul className="list-disc pl-6 space-y-2 text-[0.95rem] text-black">
          {READING.map(r => <li key={r}>{r}</li>)}
        </ul>
      </Section>

      <PhotoBand slot="sozo-verse">
        <blockquote className="font-serif italic text-2xl md:text-3xl leading-snug">
          “The Spirit of the Lord GOD is upon me, because the LORD has anointed me to bring good news to the afflicted; He has sent me to bind up the brokenhearted, to proclaim liberty to captives and freedom to prisoners.”
          <footer className="mt-4 text-base font-serif not-italic">Isaiah 61:1</footer>
        </blockquote>
      </PhotoBand>
    </>
  );
}
