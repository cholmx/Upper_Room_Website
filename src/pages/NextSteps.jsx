import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import { useSite } from '../settings';
import { Btn, Section, PageHeader, Gloss, Todo, EndCta } from '../components/ui';
import FormBlock from '../components/FormBlock';

function StepCard({ id, n, title, children, action }) {
  return (
    <li id={id} className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col scroll-mt-24">
      <span className="w-10 h-10 rounded-full bg-[#FFC44F] text-[#080c0b] font-bold flex items-center justify-center mb-4" aria-hidden="true">{n}</span>
      <h2 className="text-2xl mb-2">{title}</h2>
      <div className="text-black/80 leading-relaxed space-y-2 flex-grow">{children}</div>
      <div className="mt-5">{action}</div>
    </li>
  );
}

// A step with its own short form that opens in place.
function FormStep({ id, n, title, children, formKey, button }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const check = () => { if (window.location.hash === `#${id}`) setOpen(true); };
    check();
    window.addEventListener('hashchange', check);
    return () => window.removeEventListener('hashchange', check);
  }, [id]);
  return (
    <StepCard
      id={id}
      n={n}
      title={title}
      action={
        <>
          <button type="button" aria-expanded={open} aria-controls={`${id}-form`} onClick={() => setOpen(o => !o)} className="btn btn-outline">
            {open ? 'Close' : button}
          </button>
          {open && <div id={`${id}-form`} className="mt-5"><FormBlock formKey={formKey} heading="Tell us a little about you" className="!p-5" /></div>}
        </>
      }
    >
      {children}
    </StepCard>
  );
}

export default function NextSteps() {
  usePageMeta('nextSteps');
  const SITE = useSite();
  return (
    <>
      <PageHeader
        kicker="Next steps"
        title="Your next step"
        intro="Following Jesus is a journey, and nobody takes it at the same speed. Pick the step that fits where you are."
      />
      <Section tone="cream">
        <ol className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StepCard n={1} title="Visit us" action={<Btn to="/plan-your-visit" variant="ghost">Plan Your Visit</Btn>}>
            <p>Let us know you are coming and our welcome team will be watching for you.</p>
          </StepCard>
          <StepCard n={2} title="Join a Table Group" action={<Btn to="/table-groups" variant="ghost">Find a Group</Btn>}>
            <p><Gloss k="tableGroups" /> Most run in seasons of 8 to 12 weeks.</p>
          </StepCard>
          <FormStep id="growth-track" n={3} title="Join the Growth Track" formKey="growthtrack" button="I am interested">
            <p>The <Gloss k="growthTrack" /> Tell us you are interested and we will send the details.</p>
          </FormStep>
          <FormStep id="baptism" n={4} title="Get baptized" formKey="baptism" button="I am interested">
            <p>Baptism is a public celebration of following Jesus. If you would like to be baptized, let us know and a pastor will be in touch.</p>
            <p><Todo id="baptism">[BAPTISM PROCESS: who, when, how to sign up]</Todo></p>
          </FormStep>
          <StepCard n={5} title="Serve on a team" action={<Btn to="/serve" variant="ghost">Find a team</Btn>}>
            <p>Everyone has a gift to give. Find a team that fits yours.</p>
          </StepCard>
        </ol>
        <p className="mt-10 text-lg leading-relaxed text-black/80 max-w-3xl">
          There are other ways in, too. You can <Link className="underline underline-offset-4 font-semibold text-[#8A6309]" to="/sozo">ask about Sozo</Link>, <Link className="underline underline-offset-4 font-semibold text-[#8A6309]" to="/contact">talk with a pastor</Link>, or <a className="underline underline-offset-4 font-semibold text-[#8A6309]" href={SITE.giveUrl}>give online</a>.
        </p>
      </Section>
      <EndCta title="Not sure where to start?" text="Start with a Sunday. Everything else gets easier once you know a few faces." to="/plan-your-visit" label="Plan Your Visit" />
    </>
  );
}
