import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { Section, SectionHeader, PageHeader, Accordion, Steps, Band, Panel, PhotoSplit, SlotImage } from '../components/ui';
import { useSite } from '../settings';

const P = 'text-[0.95rem] leading-relaxed text-[#1e2522]/80';

const TOOLS = [
  ['The Father Ladder', 'Our earliest relationships shape how we see God. This tool explores those connections and heals the places where past experiences have distorted your view of the Father, Jesus, or the Holy Spirit. Many people discover a Heavenly Father who is nothing like the human authorities who let them down.'],
  ['The Wall', 'Hurt, false beliefs, unforgiveness, and sin patterns can build barriers between us and God. As each brick comes to light, you invite Jesus into that area for healing. Many people feel real freedom as the wall comes down.'],
  ['Presenting Jesus', 'This tool invites Jesus into painful memories. Instead of analyzing the past, you experience His healing presence in it. Many people see an old event from a new angle as Jesus shows them what was true.'],
];

const FAQ = [
  ['How many sessions will I need?', 'Many people experience significant breakthrough in one session. Others benefit from follow-up sessions, especially when several areas need healing or the roots run deep. Your team will guide you.'],
  ['Will I have to share deeply personal information?', 'Some sharing is part of the process, and you decide what to share. Our team follows the Holy Spirit’s leading and will not pressure you. The focus stays on connecting with God.'],
  ['Is what I share confidential?', 'Yes. What you share stays with the ministry team, except where the law requires us to report, such as intent to harm yourself or others or cases of abuse.'],
  ['Do I have to be a member of this church?', 'No. Sozo is open to members and non-members alike.'],
  ['How should I prepare?', 'Pray beforehand, get a good night’s rest, eat a meal, and come with an open heart, honest with yourself and with God.'],
  ['What if I do not feel anything during my session?', 'Healing can be quiet and subtle. Many people notice positive changes in the days and weeks that follow.'],
  ['Is Sozo deliverance ministry?', 'Sozo can include elements of deliverance, but its main focus is inner healing through connection with God. It approaches deliverance by removing the lies that gave the enemy access.'],
  ['What makes Sozo different from other prayer ministry?', 'Sozo connects you directly with each member of the Trinity. The team serves as guides, and God Himself is the source of healing. The tools make that connection practical and reach root issues as well as symptoms.'],
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

      <PhotoSplit tone="white" slot="sozo-intro" side="right">
        <div className={`space-y-4 ${P}`}>
          <p className="lead">“Sozo” is a Greek word that appears more than 100 times in the New Testament. It means to save, deliver, make whole, restore, and heal. In Matthew 9:22, Jesus uses it when He tells a woman her faith has made her well.</p>
          <p>Do you feel stuck in some area of your life? Do you sense there is more to your relationship with God than you are experiencing? Sozo is gentle, Spirit-led prayer ministry that helps you find and remove the barriers between you and God, and step into the identity and purpose He has given you.</p>
        </div>
      </PhotoSplit>

      <Section tone="white">
        <SlotImage slot="sozo-session" ratio="aspect-[21/9]" className="mb-10" />
        <div className="grid md:grid-cols-2 gap-10 md:gap-16">
          <div>
            <SectionHeader title="What happens in a session" className="!mb-4" />
            <p className={P}>Two trained team members sit down with you and, with the help of the Holy Spirit, guide you through a series of questions and tools. The session opens with prayer, moves through the tools as the Spirit leads, and closes with prayer and a short conversation about next steps. A session lasts about two hours, and you decide what you share.</p>
          </div>
          <div>
            <SectionHeader title="Our approach" className="!mb-4" />
            <p className={P}>We aim to love people and offer a safe place where old wounds can heal, lies give way to truth, and doors opened to the enemy are closed. Through prayer, we help you find freedom from emotional pain, break unhealthy ties and thought patterns, uncover barriers between you and God, discover your identity in Christ, and walk in the destiny He has for you.</p>
          </div>
        </div>
      </Section>

      <Section tone="gold">
        <SectionHeader title="Biblical foundation" />
        <ul className="list-disc pl-6 space-y-2 text-[0.95rem] max-w-3xl">
          <li>God wants His children whole and free (John 10:10, Isaiah 61:1-3).</li>
          <li>Truth sets us free (John 8:32).</li>
          <li>We are transformed by the renewing of our minds (Romans 12:2).</li>
          <li>Healing comes through relationship with the Father, Son, and Holy Spirit (James 5:16, Psalm 147:3).</li>
        </ul>
      </Section>

      <Section tone="white">
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
        <Panel tone="terra" title="What Sozo is not">
          <p>Sozo is prayer ministry. It does not replace counseling, professional mental health care, or medical care. It is not fortune-telling, it is not a formula that works automatically, and it never forces healing or deliverance on anyone. If you are in crisis, call or text 988 right away.</p>
        </Panel>
        <Panel tone="forest" title="Our team">
          <p>Every Sozo team member has completed specialized training, committed to ongoing spiritual growth, agreed to strict confidentiality standards, and gone through a thorough application process. They serve under the covering and accountability of our church leadership, and they know that the Holy Spirit brings the healing.</p>
        </Panel>
      </Band>

      <PhotoSplit tone="white" slot="sozo-begin" side="left" id="begin">
        <SectionHeader title="How to begin" className="!mb-6" />
        <Steps items={[
          { title: 'Prepare your heart', body: <p>Pray about receiving Sozo, think about the areas where you want more freedom, and come ready to meet with God.</p> },
          { title: 'Reach out', body: <p>Email <a className="underline underline-offset-4 font-semibold" href={`mailto:${SITE.email}`}>{SITE.email}</a> with your full name, phone number, and best times to reach you. A brief note about why you are seeking Sozo is optional. Your inquiry is confidential.</p> },
          { title: 'Schedule', body: <p>Our Sozo coordinator will contact you within 3 to 5 business days, answer your questions, match you with a ministry team, and find a time that works.</p> },
          { title: 'Partner with us', body: <p>We suggest a $40 donation to support the ministry, and financial help is available. Healing should be within reach of everyone. You can pay at your appointment by cash, check, or card.</p> },
        ]} />
      </PhotoSplit>

      <Section tone="white" narrow>
        <SectionHeader title="Frequently asked questions" />
        <Accordion items={FAQ.map(([q, a]) => ({ id: q.toLowerCase().replace(/[^a-z]+/g, '-'), title: q, content: <p className={P}>{a}</p> }))} />
      </Section>

      <Section tone="white" narrow>
        <SectionHeader title="Recommended reading" />
        <ul className="list-disc pl-6 space-y-2 text-[0.95rem] text-[#1e2522]/80">
          {READING.map(r => <li key={r}>{r}</li>)}
        </ul>
        <blockquote className="mt-10 font-serif italic text-xl leading-snug">
          “The Spirit of the Lord GOD is upon me, because the LORD has anointed me to bring good news to the afflicted; He has sent me to bind up the brokenhearted, to proclaim liberty to captives and freedom to prisoners.”
          <footer className="mt-2 text-base font-serif not-italic text-[#1e2522]/70">Isaiah 61:1</footer>
        </blockquote>
      </Section>
    </>
  );
}
