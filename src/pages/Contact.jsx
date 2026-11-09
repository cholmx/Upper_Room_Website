import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { useSite } from '../settings';
import { Section, SectionHeader, PageHeader, PhotoBand, MapEmbed } from '../components/ui';
import FormBlock from '../components/FormBlock';

const P = 'text-[0.95rem] leading-relaxed text-black';

export default function Contact() {
  usePageMeta('contact');
  const SITE = useSite();
  return (
    <>
      <PageHeader
        kicker="Contact"
        title="Connect With Us"
        intro="We would love to hear from you. Whether you have a question about our church, need prayer, or want to get involved, our team is here to help."
      />
      <Section tone="white">
        <div className="grid md:grid-cols-5 gap-10">
          <div className="md:col-span-3">
            <SectionHeader title="Send us a message" intro="Share a question or prayer request below, and someone from our team will reply within 48 hours." className="!mb-6" />
            <FormBlock formKey="contact" />
          </div>
          <div className="md:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl mb-3">Visit or call</h2>
              <address className={`not-italic space-y-1 ${P}`}>
                <p>{SITE.address.street}<br />{SITE.address.city}, {SITE.address.region} {SITE.address.postalCode}</p>
                <p><a className="underline underline-offset-4 font-semibold text-[#1e2522]" href={SITE.phoneHref}>{SITE.phone}</a></p>
                <p><a className="underline underline-offset-4 font-semibold text-[#1e2522]" href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
                <p>Sundays at 10:30am</p>
              </address>
            </div>
            <MapEmbed />
          </div>
        </div>
      </Section>

      <PhotoBand slot="contact-values">
        <h2 className="text-3xl md:text-5xl mb-5">We value healthy relationships</h2>
        <p className="text-base leading-relaxed">At Upper Room Fellowship, we show up honestly, with kindness and honor. We look forward to connecting with you and journeying together in faith.</p>
      </PhotoBand>
    </>
  );
}
