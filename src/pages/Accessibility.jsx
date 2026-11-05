import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { useSite } from '../settings';
import { Section, PageHeader } from '../components/ui';

export default function Accessibility() {
  usePageMeta('accessibility');
  const SITE = useSite();
  return (
    <>
      <PageHeader kicker="Accessibility" title="Accessibility" intro="We want everyone to be able to use this website and our building." />
      <Section tone="cream" narrow>
        <div className="space-y-6 text-[0.95rem] leading-relaxed text-[#1e2522]/80">
          <p>We build this site to meet WCAG 2.1 Level AA. If something does not work for you, email <a className="underline underline-offset-4 font-semibold text-[#1e2522]" href={`mailto:${SITE.email}`}>{SITE.email}</a> or call <a className="underline underline-offset-4 font-semibold text-[#1e2522]" href={SITE.phoneHref}>{SITE.phone}</a> and we will fix it.</p>
          <p>Our building is fully wheelchair accessible, with designated seating areas. The free Listen Everywhere app streams our service audio to your smartphone or tablet. Bring your own headphones. It works on iOS and Android. If you have other needs, tell us so we can serve you better.</p>
          <p>
            <a className="underline underline-offset-4 font-semibold text-[#1e2522]" href={SITE.listenApps.apple} target="_blank" rel="noopener noreferrer">Listen Everywhere on the App Store<span className="sr-only"> (opens in a new tab)</span></a>
            <br />
            <a className="underline underline-offset-4 font-semibold text-[#1e2522]" href={SITE.listenApps.google} target="_blank" rel="noopener noreferrer">Listen Everywhere on Google Play<span className="sr-only"> (opens in a new tab)</span></a>
          </p>
        </div>
      </Section>
    </>
  );
}
