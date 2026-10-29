import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { Section, SectionHeader, PageHeader, Cards, Card, Todo } from '../components/ui';
import FormBlock from '../components/FormBlock';

const TEAMS = [
  ['Welcome Team', 'Greet people at the door and help guests find their way.', 'serve-welcome'],
  ['Upper Room Kids', 'Help children learn and have fun on Sundays.'],
  ['Upper Room Youth', 'Walk with students on Wednesday nights.'],
  ['Worship and Production', 'Music, sound, lighting, and visuals.'],
  ['Creative and Media', 'Design, photography, and video.'],
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
        <p className="mt-6"><Todo id="serve-others">[ADD ANY OTHER TEAMS]</Todo></p>
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
