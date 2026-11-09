import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { useSite } from '../settings';
import { Btn, Section, SectionHeader, PageHeader, Cards, Card, PhotoSplit, PhotoBand, SlotImage } from '../components/ui';

const P = 'text-[0.95rem] leading-relaxed text-black';

const WHY = [
  'Honor God with our finances',
  'Grow spiritually as we trust Him with our resources',
  'Invest in ministry that changes lives locally and globally',
  'Say thank you for His generosity toward us',
  'Partner with Him in building His Kingdom on earth',
];

export default function Give() {
  usePageMeta('give');
  const SITE = useSite();
  const t = SITE.textToGive;
  return (
    <>
      <PageHeader
        kicker="Give"
        title="Give"
        intro="Your generosity fuels our mission to transform lives and communities. When you give, you help create places where people meet God, build healthy relationships, and find purpose through serving others."
      >
        <Btn href={SITE.giveUrl} variant="primary">Give Now</Btn>
      </PageHeader>

      <Section tone="white">
        <div className="max-w-3xl">
        <p className="lead">We live the Gospel through generosity. Jesus gave everything for us and opened the way to complete salvation, healing, and deliverance. We give freely and joyfully in response, and in giving, we reflect God’s character and join His work of restoration.</p>
      </div>
      </Section>

      <Section tone="white">
        <SectionHeader title="Why we give" />
        <p className={`max-w-3xl ${P}`}>The Bible describes generous giving as worship, a sign that we trust God to provide and believe in His mission. Second Corinthians 9:6-7 encourages us to give cheerfully, since God loves a cheerful giver. Giving gives us the chance to:</p>
        <ol className="mt-6 grid md:grid-cols-2 gap-4 max-w-4xl">
          {WHY.map((w, i) => (
            <li key={w} className="fcard !p-5 flex items-start gap-4">
              <span aria-hidden="true" className="w-10 h-10 rounded-full bg-[#c74f2f] text-white font-semibold flex items-center justify-center flex-shrink-0">{i + 1}</span>
              <span className="text-[0.95rem] text-black leading-snug pt-1.5">{w}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="gray">
        <SectionHeader title="Ways to give" />
        <Cards>
          <Card title="Online" as="h3"><p>Make a secure one-time gift or set up recurring giving, and direct it to the general fund or a specific ministry.</p><div className="pt-2"><Btn href={SITE.giveUrl} variant="primary">Give Now</Btn></div></Card>
          <Card title="Text" as="h3"><p>Text <strong>{t.keyword} $50</strong> (or any amount) to <strong>{t.number}</strong>.</p></Card>
          <Card title="In person" as="h3"><p>Place your gift in the offering boxes at the Connection Center on Sundays, or stop by the church office during the week.</p></Card>
          <Card title="By mail" as="h3"><p>Send checks payable to Upper Room Fellowship to {SITE.address.street}, {SITE.address.city}, {SITE.address.region} {SITE.address.postalCode}.</p></Card>
          <Card title="Legacy giving" as="h3"><p>Consider including Upper Room Fellowship in your estate plans or giving stock. Contact our finance team to learn about these options.</p></Card>
        </Cards>
      </Section>

      <Section tone="white" narrow>
        <SectionHeader title="How we steward your gifts" />
        <p className={P}>We handle your gifts with integrity and transparency. Our finance team reviews finances monthly, our budget follows our mission and values, we give the congregation regular financial updates, and we meet all accounting standards and legal requirements. Your giving mainly supports our local ministries, facilities, staff, and outreach, with a portion set aside for missions.</p>
      </Section>

      <PhotoBand slot="give-story">
        <h2 className="text-3xl md:text-5xl mb-5">Share your story</h2>
        <p className="text-base leading-relaxed">Many of us have seen God’s faithfulness in remarkable ways through giving. If generosity has changed something in your life, we invite you to share a testimony.</p>
        <div className="mt-6"><Btn href={`mailto:${SITE.email}?subject=My%20generosity%20story`} variant="primary">Send Us Your Testimony</Btn></div>
      </PhotoBand>
    </>
  );
}
