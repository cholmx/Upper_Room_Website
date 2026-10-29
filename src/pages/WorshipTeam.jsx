import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { Section, SectionHeader, PageHeader, Cards, Card } from '../components/ui';
import FormBlock from '../components/FormBlock';

export default function WorshipTeam() {
  usePageMeta('worship');
  return (
    <>
      <PageHeader
        kicker="Worship and creative"
        title="Worship and Creative Teams"
        intro="Worship is something we do together, so we choose songs that are rich in meaning and easy to sing. Our style is contemporary with a few traditional touches, and we want it to feel real and Spirit-led."
      />
      <Section tone="cream">
        <SectionHeader title="The teams" intro="We create space to meet God through music, art, and technology." />
        <Cards cols={2}>
          <Card title="Worship Team"><p>Singers and musicians who lead the church in song.</p></Card>
          <Card title="Production Team"><p>Sound, lighting, and visual technicians who shape the room.</p></Card>
          <Card title="Creative Team"><p>Artists, designers, and decorators who care for how our space looks and feels.</p></Card>
          <Card title="Media Team"><p>Photographers and videographers who capture and share what happens here.</p></Card>
        </Cards>
      </Section>
      <Section tone="sand">
        <div className="grid md:grid-cols-5 gap-10 items-start">
          <div className="md:col-span-2">
            <SectionHeader title="Join us" className="!mb-4" />
            <p className="text-lg leading-relaxed text-black/80">If you would like to serve with us, we will help you find the right fit. After completing the Growth Track, you can audition for the worship team or shadow one of our production volunteers to learn the ropes.</p>
          </div>
          <div className="md:col-span-3"><FormBlock formKey="worship" /></div>
        </div>
      </Section>
    </>
  );
}
