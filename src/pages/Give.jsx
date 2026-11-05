import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { useSite } from '../settings';
import { Btn, Section, SectionHeader, PageHeader, Cards, Card, Boxes, Box } from '../components/ui';
import FormBlock from '../components/FormBlock';

const P = 'text-lg leading-relaxed text-black/80';

const WHY = [
  'Worship God by honoring Him with our finances',
  'Grow spiritually as we trust God with our resources',
  'Invest in ministry that transforms lives locally and globally',
  'Express gratitude for God’s overwhelming generosity toward us',
  'Partner with God in building His kingdom on earth',
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
        intro="Your generosity fuels our mission to transform lives and communities. Through your faithful giving, you are partnering with us to create spaces where people can treasure God’s presence, build healthy relationships, and find purpose through serving others."
      >
        <Btn href={SITE.giveUrl} variant="primary">Give online</Btn>
      </PageHeader>

      <Section tone="cream" narrow>
        <p className="lead">At Upper Room Fellowship, we believe in living the Gospel through overwhelming generosity. Just as Jesus gave everything for us, opening the way for our complete salvation, healing, and deliverance, we are called to give freely and joyfully to further His kingdom on earth. When we give, we reflect God’s character and participate in His work of restoration.</p>
      </Section>

      <Section tone="white">
        <SectionHeader kicker="Why we give" title="Why we give" />
        <div className={`max-w-3xl space-y-4 ${P}`}>
          <p>The Bible teaches that generous giving is an act of worship that reflects our trust in God’s provision and our commitment to His mission. In 2 Corinthians 9:6 to 7, we are encouraged to give cheerfully, and not reluctantly or under compulsion, because God loves a cheerful giver.</p>
          <p>Giving is an opportunity far more than an obligation, the opportunity to:</p>
        </div>
        <ol className="mt-6 grid md:grid-cols-2 gap-4 max-w-4xl">
          {WHY.map((w, i) => (
            <li key={w} className="rounded-2xl p-5 neu flex items-start gap-4">
              <span aria-hidden="true" className="w-10 h-10 rounded-full bg-[#c74f2f] text-white font-semibold flex items-center justify-center flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-lg text-black/80 leading-snug pt-1.5">{w}</span>
            </li>
          ))}
        </ol>
        <p className={`mt-8 max-w-3xl ${P}`}>When we give generously, we are living out our core value of overwhelming generosity, modeling the life of Christ through servanthood and generous giving so that our friends, families, and communities can know the amazing love and salvation of Jesus.</p>
      </Section>

      <Section tone="cream">
        <SectionHeader kicker="Ways to give" title="Ways to give" />
        <Cards>
          <Card title="Online giving" as="h3" to={SITE.giveUrl} linkLabel="Give"><p>Make a secure one-time gift or set up recurring donations through our online giving platform. You can designate your gift to the general fund or specific ministries.</p></Card>
          <Card title="Text to give" as="h3"><p>Text <strong>{t.keyword} $50</strong> (or any amount) to <strong>{t.number}</strong> to give instantly.</p></Card>
          <Card title="In-person giving" as="h3"><p>Place your gift in the offering boxes located at the Connection Center during Sunday services, or drop by the church office during the week.</p></Card>
          <Card title="Mail" as="h3"><p>Send checks payable to Upper Room Fellowship to:</p><address className="not-italic">{SITE.address.street}<br />{SITE.address.city}, {SITE.address.region} {SITE.address.postalCode}</address></Card>
          <Card title="Legacy giving" as="h3"><p>Consider including Upper Room Fellowship in your estate planning, stock donations, or other planned giving. Contact our finance team for more information about these options.</p></Card>
        </Cards>
      </Section>

      <Section tone="white">
        <Boxes on="white">
          <Box tone="forest" title="Financial accountability">
            <p>We are committed to stewarding your gifts with integrity and transparency. Upper Room Fellowship follows strict financial protocols including:</p>
            <ul>
              <li>Monthly financial reviews by our finance team</li>
              <li>Clear budgeting processes aligned with our mission and values</li>
              <li>Regular financial updates to the congregation</li>
              <li>Adherence to all accounting standards and legal requirements</li>
            </ul>
            <p>Your contributions primarily support our local church ministries, facilities, staff, and outreach efforts, with a portion designated to missions.</p>
          </Box>
          <Box tone="sage" light title="Generosity testimony">
            <p>Living by our values is not always easy, but we have found it incredibly rewarding. There is a real sense of purpose and joy that comes from aligning our lives with what God values. As the Psalms put it, “There truly is a reward for those who live for God” (Psalm 58:11b NLT).</p>
            <p>We have found this to be true in our own lives, especially in the area of generosity. When we give freely as God has given to us, we experience His faithfulness in remarkable ways. Your story of generosity can inspire others as well. Consider sharing how giving has impacted your life by submitting a testimony.</p>
          </Box>
        </Boxes>
      </Section>

      <Section tone="cream" narrow>
        <FormBlock formKey="generosity" heading="Drop us a testimony" />
      </Section>
    </>
  );
}
