import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { useSite } from '../settings';
import { Section, PageHeader, EndCta, Todo } from '../components/ui';
import FormBlock from '../components/FormBlock';

export default function Contact() {
  usePageMeta('contact');
  const SITE = useSite();
  return (
    <>
      <PageHeader
        kicker="Contact"
        title="Contact us"
        intro="Have a question, need prayer, or want to know how to get involved? Send us a message and someone will reply within 48 hours. You can also call or stop by."
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
            <p className="text-[#2b2f2d]">We believe in healthy relationships, and that starts with getting to know you.</p>
          </div>
          <div className="md:col-span-3"><FormBlock formKey="contact" /></div>
        </div>
        <div className="mt-12 rounded-2xl overflow-hidden border border-black/10 bg-white aspect-[16/9] md:aspect-[21/9]">
          <iframe title={`Map of ${SITE.addressLine}`} src={SITE.mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="w-full h-full border-0"></iframe>
        </div>
      </Section>
      <EndCta title="Planning a visit?" text="Let us know you are coming and our welcome team will be watching for you." to="/connect" label="Fill Out the Connect Card" />
    </>
  );
}
