import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { useSite } from '../settings';
import { Section, PageHeader, EndCta } from '../components/ui';

export default function Accessibility() {
  usePageMeta('accessibility');
  const SITE = useSite();
  return (
    <>
      <PageHeader kicker="Accessibility" title="Accessibility" intro="We want everyone to be able to use this website and our building." />
      <Section tone="cream" narrow>
        <div className="space-y-6 text-lg leading-relaxed text-[#2b2f2d]">
          <p>We build this site to meet WCAG 2.1 Level AA. If something does not work for you, email <a className="underline underline-offset-4 font-semibold text-[#8A6309]" href={`mailto:${SITE.email}`}>{SITE.email}</a> or call <a className="underline underline-offset-4 font-semibold text-[#8A6309]" href={SITE.phoneHref}>{SITE.phone}</a> and we will fix it.</p>
          <p>Our building is fully wheelchair accessible, with designated seating areas. The free Listen Everywhere app streams our service audio to your smartphone or tablet. Bring your own headphones. It works on iOS and Android. If you have other needs, tell us so we can serve you better.</p>
          <p>
            <a className="underline underline-offset-4 font-semibold text-[#8A6309]" href={SITE.listenApps.apple} target="_blank" rel="noopener noreferrer">Listen Everywhere on the App Store<span className="sr-only"> (opens in a new tab)</span></a>
            <br />
            <a className="underline underline-offset-4 font-semibold text-[#8A6309]" href={SITE.listenApps.google} target="_blank" rel="noopener noreferrer">Listen Everywhere on Google Play<span className="sr-only"> (opens in a new tab)</span></a>
          </p>
        </div>
      </Section>
      <EndCta title="Tell us what you need" text="We would rather hear about a problem than have you struggle with it." to="/contact" label="Contact us" />
    </>
  );
}
