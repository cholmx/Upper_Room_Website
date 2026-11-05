import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { useSite } from '../settings';
import { Section, SectionHeader, PageHeader } from '../components/ui';
import FormBlock from '../components/FormBlock';

const P = 'text-[0.95rem] leading-relaxed text-[#1e2522]/80';

export default function Contact() {
  usePageMeta('contact');
  const SITE = useSite();
  return (
    <>
      <PageHeader
        kicker="Connect with us"
        title="Contact"
        intro="We would love to hear from you! Whether you have questions about our church, need prayer, or want to learn more about getting involved, our team is here to help."
      />
      <Section tone="cream">
        <div className="grid md:grid-cols-5 gap-10">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl mb-3">Find us</h2>
              <address className={`not-italic space-y-1 ${P}`}>
                <p>{SITE.address.street}<br />{SITE.address.city}, {SITE.address.region} {SITE.address.postalCode}</p>
                <p><a className="underline underline-offset-4 font-semibold text-[#1e2522]" href={SITE.phoneHref}>{SITE.phone}</a></p>
                <p><a className="underline underline-offset-4 font-semibold text-[#1e2522]" href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
                <p>Join us {SITE.serviceTime}</p>
              </address>
            </div>
            <div>
              <h2 className="text-2xl mb-3">We value healthy relationships</h2>
              <p className={P}>At Upper Room Fellowship, we believe in pursuing healthy relationships where we show up authentically, with kindness and honor. We look forward to connecting with you and journeying together in faith.</p>
            </div>
          </div>
          <div className="md:col-span-3">
            <SectionHeader title="Send us a message" intro="Have a question or prayer request? Fill out the form below, and someone from our team will get back to you within 48 hours." className="!mb-6" />
            <FormBlock formKey="contact" />
          </div>
        </div>
      </Section>
    </>
  );
}
