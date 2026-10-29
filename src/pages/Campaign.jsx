import React from 'react';
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import { useSite } from '../settings';
import { CAMPAIGN_FAQ } from '../content/campaign';
import { Btn, Section, SectionHeader, PageHeader, Accordion, Photo, Todo, AdminOnly } from '../components/ui';

export default function Campaign() {
  usePageMeta('growth');
  const SITE = useSite();
  const faq = CAMPAIGN_FAQ.map((it, i) => ({
    id: `c-${i + 1}`,
    title: it.q,
    content: <p>{it.a}{it.todo && <> <Todo id={it.todo.id}>{it.todo.text}</Todo></>}</p>,
  }));

  return (
    <>
      <PageHeader kicker="Growth Campaign" title="Transforming Together" photo="campaign-hero">
        <Btn href={SITE.growthGiveUrl} variant="primary">Give to the Growth Campaign</Btn>
        <Btn href={SITE.pledgeUrl} variant="light">Submit Your Commitment Card</Btn>
      </PageHeader>

      <Section tone="cream" narrow>
        <div className="space-y-6 text-lg leading-relaxed text-black/80">
          <p>In 1971, a handful of believers met in an upper room above a vet’s office in Columbiana. They had no building fund and no plan, only a willingness to obey. They prayed, worshiped, and invited friends who needed Jesus. God showed up.</p>
          <p>Fifty years later, that simple yes has changed lives, healed marriages, broken addictions, and brought generations back to God.</p>
          <p>Every so often since then, we have faced the same choice. We could stay comfortable, or we could make room. Each time we chose faith, and each time God provided. The generations before us gave sacrificially and put up with construction mess because they believed more people needed Jesus. Now it is our turn.</p>
          <p>We call this campaign Transforming Together because that is what happens when we move forward as one. We are adding space for more people to meet Jesus, and we are making room in our budgets and in our lives for what God does next. Fifty years from now, people we will never meet will gather in the space we are building today. They will find the same Jesus and the same real community.</p>
          <p className="font-semibold">Our sanctuary is full, and new people walk through our doors every week. We can stay comfortable, or we can make room.</p>
        </div>
      </Section>

      <Section tone="sand">
        <SectionHeader kicker="Give" title="Three ways to take part" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col">
            <h3 className="text-xl mb-2">Give to the Building Fund</h3>
            <p className="text-black/80 flex-grow">Choose “Building Donation” from the dropdown on the giving form.</p>
            <div className="mt-4"><Btn href={SITE.giveUrl} variant="ghost">Give to the Building Fund</Btn></div>
          </div>
          <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col">
            <h3 className="text-xl mb-2">Give to the Growth Campaign</h3>
            <p className="text-black/80 flex-grow">Give toward the campaign directly.</p>
            <div className="mt-4"><Btn href={SITE.growthGiveUrl} variant="ghost">Give to the Growth Campaign</Btn></div>
          </div>
          <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col">
            <h3 className="text-xl mb-2">Submit your commitment</h3>
            <p className="text-black/80 flex-grow">Tell us what you plan to give over the three years.</p>
            <div className="mt-4"><Btn href={SITE.pledgeUrl} variant="ghost">Submit Your Commitment Card</Btn></div>
          </div>
        </div>
        <p className="mt-6"><Todo id="campaign-links">[CONFIRM WHICH GIVING LINK IS CORRECT FOR EACH BUTTON]</Todo></p>
      </Section>

      <AdminOnly>
      <Section tone="cream">
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <SectionHeader kicker="Timeline" title="Campaign timeline" className="!mb-4" />
            <p><Todo id="campaign-timeline">[UPDATE THE CAMPAIGN TIMELINE AND YEAR. The previous timeline listed March 1 through April 12 and appears to be from 2026, so replace it with current dates and milestones]</Todo></p>
          </div>
          <div>
            <SectionHeader kicker="Progress" title="Where we are" className="!mb-4" />
            <p><Todo id="campaign-progress">[CURRENT PROGRESS, OPTIONAL PROGRESS BAR]</Todo></p>
          </div>
        </div>
      </Section>
      </AdminOnly>

      <Section tone="sand" narrow>
        <SectionHeader title="Questions and answers" />
        <Accordion items={faq} />
        <p className="mt-8 text-lg">More questions? <Link to="/contact" className="underline underline-offset-4 font-semibold text-[#8A6309]">Send us a message</Link>.</p>
      </Section>

      <Section tone="ink" narrow>
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl">Help us make room</h2>
          <p className="mt-4 text-lg md:text-xl text-white/90">Pray about what God would have you give, then take the next step.</p>
          <div className="mt-8"><Btn href={SITE.growthGiveUrl} variant="primary">Give to the Growth Campaign</Btn></div>
        </div>
      </Section>
    </>
  );
}
