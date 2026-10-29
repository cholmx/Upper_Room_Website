import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import { useSite } from '../settings';
import { Section, PageHeader, EndCta, Todo } from '../components/ui';
import FormBlock from '../components/FormBlock';

// Prayer and story forms sit in collapsed panels so the page opens with one simple message form.
function Panel({ id, title, intro, formKey, note }) {
  const { hash } = useLocation();
  const [open, setOpen] = useState(hash === `#${id}`);
  useEffect(() => { if (hash === `#${id}`) setOpen(true); }, [hash, id]);
  return (
    <details id={id} open={open} onToggle={(e) => setOpen(e.currentTarget.open)} className="u-acc bg-white rounded-2xl border border-black/10">
      <summary className="cursor-pointer list-none min-h-[56px] px-6 py-4 flex items-center justify-between gap-4 text-xl font-bold">
        {title}
        <span aria-hidden="true" className="text-[#8A6309]">+</span>
      </summary>
      <div className="px-6 pb-6">
        <p className="text-lg leading-relaxed text-black/80 mb-5">{intro}</p>
        <FormBlock formKey={formKey} />
        {note}
      </div>
    </details>
  );
}

export default function Contact() {
  usePageMeta('contact');
  const SITE = useSite();
  return (
    <>
      <PageHeader
        kicker="Contact"
        title="Contact us"
        intro="Have a question or want to know how to get involved? Send us a message and someone will reply within 48 hours. You can also call or stop by."
      />
      <Section tone="cream">
        <div className="grid md:grid-cols-5 gap-10">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl mb-3">Find us</h2>
              <address className="not-italic text-lg leading-relaxed space-y-1">
                <p>{SITE.address.street}<br />{SITE.address.city}, {SITE.address.region} {SITE.address.postalCode}</p>
                <p><a className="underline underline-offset-4 font-semibold" href={SITE.phoneHref}>{SITE.phone}</a></p>
                <p><a className="underline underline-offset-4 font-semibold" href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
                <p>{SITE.serviceTime}</p>
                <p><Todo id="office-hours">[OFFICE HOURS]</Todo></p>
              </address>
              <p className="mt-3">
                <a href={SITE.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center min-h-[44px] font-semibold text-[#8A6309] underline underline-offset-4">Get directions<span className="sr-only"> (opens in a new tab)</span></a>
              </p>
            </div>
            <div>
              <h2 className="text-2xl mb-3">Follow along</h2>
              <ul className="flex flex-wrap gap-x-5">
                {SITE.social.map(s => (
                  <li key={s.label}><a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center min-h-[44px] font-semibold underline underline-offset-4">{s.label}<span className="sr-only"> (opens in a new tab)</span></a></li>
                ))}
              </ul>
            </div>
            <p className="text-black/80">We believe in healthy relationships, and that starts with getting to know you.</p>
          </div>
          <div className="md:col-span-3"><FormBlock formKey="contact" /></div>
        </div>
        <div className="mt-12 grid gap-4 max-w-3xl">
          <Panel id="prayer" title="Request prayer" intro="Whatever you are carrying, you do not have to carry it alone. Send us a request and our church family will pray." formKey="prayer" note={<p className="mt-5 text-sm text-black/80"><Todo id="prayer-who">[CONFIRM WHO RECEIVES REQUESTS AND WHETHER FOLLOW-UP HAPPENS]</Todo></p>} />
          <Panel id="story" title="Share your story" intro="If God has done something in your life, we would love to hear it. It might encourage someone else." formKey="story" />
        </div>
        <div className="mt-12 rounded-2xl overflow-hidden border border-black/10 bg-white aspect-[16/9] md:aspect-[21/9]">
          <iframe title={`Map of ${SITE.addressLine}`} src={SITE.mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="w-full h-full border-0"></iframe>
        </div>
      </Section>
      <EndCta title="Planning a visit?" text="Let us know you are coming and our welcome team will be watching for you." to="/plan-your-visit#connect-card" label="Fill Out the Connect Card" />
    </>
  );
}
