import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { useSite } from '../settings';
import { Btn, Section, SectionHeader, PageHeader, Cards, Card, PhotoGrid, Todo, AdminOnly } from '../components/ui';

export default function Give() {
  usePageMeta('give');
  const SITE = useSite();
  const t = SITE.textToGive;
  return (
    <>
      <PageHeader
        kicker="Give"
        title="Give"
        intro="Your generosity helps change lives in Columbiana and beyond. We give because God gave first, and Scripture says God loves a cheerful giver (2 Corinthians 9:7)."
      />

      <Section tone="cream">
        <div className="bg-white rounded-3xl border border-black/10 p-8 md:p-12 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl">Give online</h2>
          <p className="mt-4 text-lg md:text-xl text-black/80 leading-relaxed">Make a secure one-time gift or set up a recurring gift. You can direct it to the general fund or to a specific ministry.</p>
          <div className="mt-8"><Btn href={SITE.giveUrl} variant="primary" className="!min-h-[56px] !px-10 !text-lg">Give Online</Btn></div>
        </div>
      </Section>

      <Section tone="sand">
        <SectionHeader kicker="Other ways" title="Other ways to give" />
        <Cards cols={4}>
          <Card title="Text to give"><p>Text <strong>{t.keyword} $50</strong> (or any amount) to <strong>{t.number}</strong>.</p></Card>
          <Card title="In person"><p>Place your gift in the offering boxes at the Connection Center on Sundays, or stop by the church office during the week. <Todo id="office-hours">[OFFICE HOURS]</Todo></p></Card>
          <Card title="By mail"><p>Send checks payable to Upper Room Fellowship to {SITE.addressLine}.</p></Card>
          <Card title="Legacy giving"><p>If you would like to include Upper Room Fellowship in your estate planning, or give stock or other assets, email the finance team at <a className="underline underline-offset-4 font-semibold" href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p></Card>
        </Cards>
      </Section>

      <Section tone="cream">
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <SectionHeader kicker="Why we give" title="Why we give" className="!mb-4" />
            <p className="text-lg leading-relaxed text-black/80">Giving is an act of worship and a way of saying we trust God to provide. It gives us a chance to</p>
            <ul className="mt-3 list-disc pl-6 space-y-2 text-lg text-black/80">
              <li>Worship God with our money</li>
              <li>Grow in trust as we place our resources in His hands</li>
              <li>Invest in ministry that changes lives here and around the world</li>
              <li>Say thank you for how generous God has been to us</li>
              <li>Partner with God in building His kingdom</li>
            </ul>
            <blockquote className="mt-6 border-l-4 border-[#8A6309] pl-5 text-xl">
              Read 2 Corinthians 9:6-7 for the heart behind it.
            </blockquote>
          </div>
          <div>
            <SectionHeader kicker="Accountability" title="Financial accountability" className="!mb-4" />
            <p className="text-lg leading-relaxed text-black/80">We take care of what you give.</p>
            <ul className="mt-3 list-disc pl-6 space-y-2 text-lg text-black/80">
              <li>Our finance team reviews the finances every month</li>
              <li>Our budget follows our mission and values</li>
              <li>We give regular financial updates to the congregation</li>
              <li>We follow accounting standards and the law</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="sand">
        <SectionHeader kicker="Impact" title="Where your gift goes" intro="Your gifts mostly fund our local ministries, our building, our staff, and our outreach, with a portion going to missions." />
        <AdminOnly>
          <ul className="space-y-3 text-lg">
            <li><Todo id="impact-stories">[SHORT IMPACT STORY]</Todo></li>
            <li><Todo id="impact-stories">[SHORT IMPACT STORY]</Todo></li>
            <li><Todo id="impact-stories">[SHORT IMPACT STORY]</Todo></li>
          </ul>
        </AdminOnly>
        <PhotoGrid slots={['give-impact-1', 'give-impact-2', 'give-impact-3']} className="mt-8 md:!grid-cols-3" />
      </Section>

      <Section tone="ink" narrow>
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl">Ready to give?</h2>
          <p className="mt-4 text-lg md:text-xl text-white/90">It takes about a minute, and every gift is put to work.</p>
          <div className="mt-8"><Btn href={SITE.giveUrl} variant="primary">Give Online</Btn></div>
        </div>
      </Section>
    </>
  );
}
