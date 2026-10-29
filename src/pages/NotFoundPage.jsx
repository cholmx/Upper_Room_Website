import React from 'react';
import usePageMeta from '../hooks/usePageMeta';
import { useSite } from '../settings';
import { Btn, Section } from '../components/ui';

export default function NotFoundPage() {
  usePageMeta('notFound');
  const SITE = useSite();
  return (
    <Section tone="cream" narrow>
      <div className="text-center py-8">
        <h1 className="text-4xl md:text-5xl">We could not find that page.</h1>
        <p className="mt-5 text-lg md:text-xl text-black/80 leading-relaxed">
          It may have moved. Try the links below, or call us at <a className="underline underline-offset-4 font-semibold" href={SITE.phoneHref}>{SITE.phone}</a> and we will help you find what you need.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Btn to="/" variant="primary">Go to the home page</Btn>
          <Btn to="/plan-your-visit" variant="ghost">Plan Your Visit</Btn>
          <Btn to="/messages" variant="ghost">Messages</Btn>
          <Btn to="/contact" variant="ghost">Contact</Btn>
        </div>
      </div>
    </Section>
  );
}
