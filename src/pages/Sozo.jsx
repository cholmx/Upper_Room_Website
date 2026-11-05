import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { Btn, Section, SectionHeader, PageHeader, Accordion, Steps, QuickFacts, Cards, Card, Boxes, Box } from '../components/ui';
import FormBlock from '../components/FormBlock';
import { useSite } from '../settings';

export default function Sozo() {
  usePageMeta('sozo');
  const SITE = useSite();
  return (
    <>
      <PageHeader
        kicker="Sozo"
        title="Sozo ministry"
        intro="Sozo is a Greek word that appears over a hundred times in the New Testament. It means to save, deliver, make whole, restore, and heal. Sozo ministry is a gentle, prayer-based time to ask the Father, Son, and Holy Spirit about the places where you feel stuck. If you sense there is more to your relationship with God than you are experiencing now, this is a good place to start."
      >
        <Btn href="#sozo-form" variant="primary">Request a Sozo session</Btn>
      </PageHeader>

      <Section tone="white">
        <QuickFacts items={[
          { label: 'Length', value: 'About two hours' },
          { label: 'Arrive', value: '10 to 15 minutes early' },
          { label: 'Suggested donation', value: '$40. Financial assistance is available.' },
          { label: 'Who can come', value: 'Members and non-members' },
        ]} />
      </Section>

      <Section tone="cream">
        <Boxes>
          <Box tone="forest" title="What is Sozo">
            <p className="font-serif text-[1.5rem] leading-snug">Sozo is a Greek word used more than 100 times in the New Testament. It means to save, deliver, make whole, restore, and heal, and it reflects God’s desire for our complete wholeness: spiritually, emotionally, and relationally.</p>
            <blockquote className="border-l-4 border-[#eaa235] pl-5 font-serif italic leading-snug">
              “But Jesus turning and seeing her said, ‘Daughter, take courage; your faith has made you well (sozo).’ And at once the woman was made well (sozo).”
              <footer className="mt-1 text-base font-sans not-italic">Matthew 9:22</footer>
            </blockquote>
            <p>Are there areas of your life where you feel stuck? Do you sense there is more to your relationship with God than you are experiencing now? Sozo ministry is a gentle, Spirit-led way to find and remove whatever may be getting in the way of knowing God closely and walking in the identity and purpose He gave you.</p>
            <p>A Sozo session is a time of interacting with Father, Son, and Holy Spirit to seek wholeness and pursue your destiny, and it is separate from counseling. During a session, trained Sozo team members sit down with you and, with the help of the Holy Spirit, walk you through the process of freedom and wholeness.</p>
          </Box>
          <Box tone="sage" light title="Biblical foundation and our approach">
            <p>Sozo ministry is built on these biblical truths:</p>
            <ul>
              <li>God desires wholeness and freedom for His children (John 10:10, Isaiah 61:1 to 3)</li>
              <li>Truth sets us free from bondage (John 8:32)</li>
              <li>We are transformed by the renewing of our minds (Romans 12:2)</li>
              <li>Healing comes through our relationship with the Father, Son, and Holy Spirit (James 5:16, Psalm 147:3)</li>
            </ul>
            <p>We aim to love people and give them a safe place where the healing of past wounds can break strongholds, replace lies with truth, and close doors to the enemy. Through gentle, Spirit-led prayer ministry, we help you:</p>
            <ul>
              <li>Find freedom from emotional wounds and pain</li>
              <li>Break unhealthy ties and thought patterns</li>
              <li>Identify and remove barriers to your relationship with God</li>
              <li>Replace lies with God’s truth</li>
              <li>Discover your true identity in Christ</li>
              <li>Walk in the destiny God has called you to</li>
            </ul>
          </Box>
        </Boxes>
      </Section>

      <Section tone="white">
        <SectionHeader title="Our Sozo tools" intro="Three tools help connect you with the Father, Son, and Holy Spirit during a session." />
        <Cards>
          <Card title="The Father Ladder" as="h3">
            <p><strong>Restoring divine connections.</strong> The Father Ladder helps you see how early relationships shaped the way you see God. By exploring those connections, we can identify and heal places where past experiences may have bent your view of the Father, Jesus, or the Holy Spirit.</p>
            <p>Many people discover the love of a heavenly Father who is nothing like the human authorities who disappointed them. As those connections are restored, many experience God’s love in deeply transforming ways.</p>
          </Card>
          <Card title="The Wall" as="h3">
            <p><strong>Breaking through barriers.</strong> The Wall helps identify what may be blocking your closeness with God. These obstacles often grow out of past hurts, false beliefs, unforgiveness, or patterns of sin that create separation.</p>
            <p>As each brick in the wall is named, you can invite Jesus into that place for healing and change. Many people find real freedom as these walls come down, and they experience God’s presence in new ways.</p>
          </Card>
          <Card title="Presenting Jesus" as="h3">
            <p><strong>Healing in His presence.</strong> This tool invites Jesus into painful memories to bring His healing perspective and presence. Instead of only analyzing old hurts, Presenting Jesus focuses on experiencing Christ’s healing presence inside those memories.</p>
            <p>Many people see past events from a completely new angle as Jesus shows His truth about what happened. That often brings deep healing to wounds that have affected them for years.</p>
          </Card>
        </Cards>
      </Section>

      <Section tone="cream">
        <SectionHeader title="How to begin" intro="Taking the first step toward inner healing is a courageous decision. Here is how to start." />
        <div className="max-w-3xl">
          <Steps items={[
            { title: 'Prepare your heart', body: <ul className="list-disc pl-6 space-y-1"><li>Ask God in prayer about receiving Sozo ministry</li><li>Think about the areas where you want more freedom and healing</li><li>Come with an open heart, ready to meet God in a fresh way</li></ul> },
            { title: 'Reach out', body: <p>Fill out the form below, or email <a className="underline underline-offset-4 font-semibold" href={`mailto:${SITE.email}`}>{SITE.email}</a> with your full name, phone number, best times to reach you, and, if you like, a short note about why you are seeking Sozo. Your inquiry is confidential and handled with care.</p> },
            { title: 'Connect and schedule', body: <ul className="list-disc pl-6 space-y-1"><li>Our Sozo coordinator will contact you within 3 to 5 business days</li><li>We will answer your questions about the process</li><li>You will be matched with a trained ministry team that fits your needs</li><li>We will find a time that works for you (sessions last about 2 hours)</li></ul> },
            { title: 'Partner in ministry', body: <ul className="list-disc pl-6 space-y-1"><li>A suggested donation of $40 supports our Sozo ministry</li><li>Financial assistance is available, because healing should be open to everyone</li><li>Your gift helps others receive the same ministry</li><li>Payment can be made at your appointment by cash, check, or card</li></ul> },
          ]} />
        </div>
      </Section>

      <Section tone="white">
        <SectionHeader title="Common questions" />
        <Accordion items={[
          { id: 'q-heal', title: 'Can one Sozo session heal a lie that has been believed for many years?', content: <p>Yes. Once the Lord heals the lie that settled into your spirit, the rest of your life experiences built on that lie realign to His truth. Many people report significant breakthroughs in a single session, though some benefit from more sessions.</p> },
          { id: 'q-counsel', title: 'Is Sozo counseling?', content: <p>No. Sozo sessions do not include psychological counseling, Bible study, or teaching. Sozo is prayer ministry that helps heal your relationship with God so you can fulfill your destiny. It should not replace professional counseling or medical treatment when needed.</p> },
          { id: 'q-length', title: 'How long is a session?', content: <p>A typical session lasts about two hours. Please arrive 10 to 15 minutes early to complete any necessary paperwork.</p> },
          { id: 'q-many', title: 'How many sessions will I need?', content: <p>Many people find significant breakthrough in one session. Some benefit from follow-up sessions, especially when several areas need healing or the issues are complex and deeply rooted. Our team will tell you whether more sessions might help.</p> },
          { id: 'q-happens', title: 'What happens during a session?', content: <p>You meet with two trained team members who guide you through a series of questions and tools designed to find root issues and connect you with the Father, Son, and Holy Spirit. The session begins with prayer, then uses the Sozo tools as the Holy Spirit leads. It ends with prayer and a short conversation about any follow-up steps.</p> },
          { id: 'q-personal', title: 'Will I have to share deeply personal information?', content: <p>Some personal sharing is part of the process, and you stay in control of what you share. Our team is trained to be sensitive and to follow the Holy Spirit without pressing you to share more than you are comfortable with. The focus is on connecting with God, with no detailed analysis of your past.</p> },
          { id: 'q-private', title: 'Is what I share confidential?', content: <p>Yes. Confidentiality is a core value of our Sozo ministry. What you share stays among the ministry team, except where we are legally required to report, such as intent to harm yourself or others, or cases of abuse.</p> },
          { id: 'q-who', title: 'Do I need to be a member of this church?', content: <p>No. Sozo is open to members and non-members. We welcome anyone who wants greater freedom and a deeper connection with God.</p> },
          { id: 'q-prepare', title: 'How should I prepare for my session?', content: <><p>We recommend that you:</p><ul className="list-disc pl-6 space-y-1"><li>Spend time in prayer before your session</li><li>Get enough rest the night before</li><li>Eat a meal before you come</li><li>Come with an open heart and a willingness to hear from God</li><li>Be honest with yourself and with God</li></ul></> },
          { id: 'q-nothing', title: 'What if I do not experience anything during my session?', content: <p>Not everyone has a dramatic emotional experience. Healing can be quiet and subtle. Even if you do not feel an immediate change, trust that God is working. Many people notice positive changes in the days and weeks after their session.</p> },
          { id: 'q-deliverance', title: 'Is Sozo deliverance ministry?', content: <p>Sozo may include elements of deliverance, which means addressing places where the enemy has gained influence, but its main focus is inner healing through connection with God. Sozo approaches deliverance by removing the lies that gave the enemy access, and it does not focus on confronting demonic influence.</p> },
          { id: 'q-different', title: 'What makes Sozo different from other prayer ministries?', content: <p>Sozo focuses on connecting you directly with each member of the Trinity for healing, so the ministry team is not the source of healing. The tools make that connection practical and go after root issues and not only symptoms.</p> },
          { id: 'q-cost', title: 'What does it cost?', content: <p>We suggest a donation of $40. Financial assistance is available.</p> },
          { id: 'q-reply', title: 'How soon will I hear back?', content: <p>Our Sozo coordinator will contact you within 3 to 5 business days.</p> },
        ]} />
      </Section>

      <Section tone="cream">
        <Boxes>
          <Box tone="terra" light title="What Sozo is not">
            <ul>
              <li>Sozo is not psychotherapy or psychological counseling</li>
              <li>Sozo is not a substitute for professional mental health services or medical care</li>
              <li>Sozo is not fortune-telling or predictive prophecy</li>
              <li>Sozo is not a formula or technique that works automatically</li>
              <li>Sozo is not a ministry that forces healing or deliverance on anyone</li>
            </ul>
          </Box>
          <Box tone="ink" title="Our team">
            <p>Our Sozo team is made up of dedicated believers who have:</p>
            <ul>
              <li>Received specialized Sozo training</li>
              <li>Committed to ongoing spiritual growth</li>
              <li>A heart for seeing people walk in freedom and wholeness</li>
              <li>A strong prayer life and relationship with the Lord</li>
              <li>Agreed to strict confidentiality standards</li>
            </ul>
            <p>Each team member goes through a thorough application process, receives training, and serves under the covering and accountability of our church leadership. Our team approaches every session with humility, knowing that the Holy Spirit brings healing and the team members do not.</p>
          </Box>
        </Boxes>
      </Section>

      <Section tone="white">
        <Boxes on="white">
          <Box tone="amber" title="Recommended resources">
            <p>To go deeper into inner healing and Sozo ministry, these books are a good start.</p>
            <ul>
              <li><em>Healing the Wounded Heart</em> by Dan Allender</li>
              <li><em>The Transformation of the Inner Man</em> by John and Paula Sandford</li>
              <li><em>Healing for Damaged Emotions</em> by David Seamands</li>
              <li><em>Restoration Year</em> by John Eldredge</li>
              <li><em>Emotionally Healthy Spirituality</em> by Peter Scazzero</li>
            </ul>
          </Box>
          <Box tone="forest" title="A word from Isaiah">
            <blockquote className="font-serif italic text-xl leading-snug">
              “The Spirit of the Lord GOD is upon me, because the LORD has anointed me to bring good news to the afflicted; He has sent me to bind up the brokenhearted, to proclaim liberty to captives and freedom to prisoners.”
              <footer className="mt-2 text-base font-sans not-italic">Isaiah 61:1</footer>
            </blockquote>
          </Box>
        </Boxes>
      </Section>

      <Section tone="cream" id="sozo-form">
        <div className="grid md:grid-cols-5 gap-10 items-start">
          <div className="md:col-span-2">
            <SectionHeader title="Request a Sozo session" className="!mb-4" />
            <p className="text-lg leading-relaxed text-black/80">Your inquiry is confidential. Prefer email? Write to <a className="underline underline-offset-4 font-semibold" href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
          </div>
          <div className="md:col-span-3"><FormBlock formKey="sozo" /></div>
        </div>
      </Section>
    </>
  );
}
