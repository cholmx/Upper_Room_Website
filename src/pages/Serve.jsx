import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { Section, SectionHeader, PageHeader, Cards, Card, Todo, AdminOnly } from '../components/ui';
import FormBlock from '../components/FormBlock';

const TEAMS = [
  ['Welcome Team', 'Greet people at the door and help guests find their way.', 'serve-welcome'],
  ['Upper Room Kids', 'Help children learn and have fun on Sundays.'],
  ['Upper Room Youth', 'Walk with students on Wednesday nights.'],
  ['Worship and Creative', 'Music, sound, lighting, design, and video. See the details below.'],
  ['Table Groups', 'Host or lead a small group.'],
  ['Sozo Team', 'Offer prayer ministry after specialized training.'],
  ['CarePortal Response Team', 'Help meet real needs for local children and families.'],
  ['Outreach and Missions', 'Serve in our community and around the world.'],
];

export default function Serve() {
  usePageMeta('serve');
  return (
    <>
      <PageHeader
        kicker="Serve"
        title="Find your place to serve"
        intro="Everybody here has something to give, and the church works better when they give it. These are a few places to start."
      />
      <Section tone="cream">
        <Cards>
          {TEAMS.map(([title, text, todo]) => (
            <Card key={title} as="h2" title={title}>
              <p>{text}{todo && <> <Todo id={todo}>[CONFIRM]</Todo></>}</p>
            </Card>
          ))}
        </Cards>
        <AdminOnly><p className="mt-6"><Todo id="serve-others">[ADD ANY OTHER TEAMS]</Todo></p></AdminOnly>
      </Section>
      <Section tone="white" id="worship">
        <SectionHeader kicker="Worship and creative" title="Worship and creative teams" intro="Worship is something we do together, so we choose songs that are rich in meaning and easy to sing. Our style is contemporary with a few traditional touches, and we want it to feel real and Spirit-led." />
        <Cards cols={2}>
          <Card title="Worship Team"><p>Singers and musicians who lead the church in song.</p></Card>
          <Card title="Production Team"><p>Sound, lighting, and visual technicians who shape the room.</p></Card>
          <Card title="Creative Team"><p>Artists, designers, and decorators who care for how our space looks and feels.</p></Card>
          <Card title="Media Team"><p>Photographers and videographers who capture and share what happens here.</p></Card>
        </Cards>
        <p className="mt-8 text-lg leading-relaxed text-black/80 max-w-3xl">After completing the Growth Track, you can audition for the worship team or shadow one of our production volunteers to learn the ropes.</p>
        <div className="mt-10 max-w-3xl"><FormBlock formKey="worship" /></div>
      </Section>
      <Section tone="sand">
        <div className="grid md:grid-cols-5 gap-10 items-start">
          <div className="md:col-span-2">
            <SectionHeader title="Tell us what interests you" className="!mb-4" />
            <p className="text-lg leading-relaxed text-black/80">Pick the teams that sound like you, and someone will reach out to talk about the next step.</p>
          </div>
          <div className="md:col-span-3"><FormBlock formKey="serve" /></div>
        </div>
      </Section>
    </>
  );
}
