import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import { useSite } from '../settings';
import { Btn, Section, Cards, Card } from '../components/ui';

export default function NotFoundPage() {
  usePageMeta('notFound');
  const SITE = useSite();
  const navigate = useNavigate();
  const [term, setTerm] = useState('');
  const search = (e) => {
    e.preventDefault();
    navigate(term.trim() ? `/messages?q=${encodeURIComponent(term.trim())}#archive` : '/messages');
  };
  return (
    <>
      <Section tone="white" narrow>
        <div className="py-6">
          <p className="kicker text-[#c74f2f]">Page not found</p>
          <h1 className="text-4xl md:text-6xl">We could not find that page.</h1>
          <p className="mt-5 text-[1rem] md:text-base text-black leading-relaxed max-w-[55ch]">
            It may have moved. Search our messages, pick one of the places below, or call us at <a className="underline underline-offset-4 font-semibold" href={SITE.phoneHref}>{SITE.phone}</a> and we will help you find what you need.
          </p>
          <form role="search" aria-label="Search messages" onSubmit={search} className="mt-8 flex flex-wrap gap-3 max-w-xl">
            <label htmlFor="nf-search" className="sr-only">Search messages</label>
            <input id="nf-search" type="search" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search messages, such as prayer or Romans" className="flex-1 min-w-[14rem] min-h-[48px] px-4 py-3 bg-white rounded-xl border border-[#1e2522]/25 focus:outline-none focus:ring-2 focus:ring-[#1e2522]" />
            <button type="submit" className="btn btn-solid">Search</button>
          </form>
        </div>
      </Section>
      <Section tone="gray">
        <h2 className="text-3xl md:text-5xl mb-8">Where would you like to go?</h2>
        <Cards cols={4}>
          <Card title="New Here?" as="h3" to="/plan-your-visit" linkLabel="Plan your visit"><p>See what a Sunday looks like.</p></Card>
          <Card title="Messages" as="h3" to="/messages" linkLabel="Watch or listen"><p>Browse recent and past teaching.</p></Card>
          <Card title="Shine Podcast" as="h3" to="/shine" linkLabel="Listen"><p>Conversations with people in our church family.</p></Card>
          <Card title="Contact" as="h3" to="/contact" linkLabel="Get in touch"><p>Ask a question or request prayer.</p></Card>
        </Cards>
        <div className="mt-8 flex flex-wrap gap-3">
          <Btn to="/" variant="primary">Go to the home page</Btn>
          <Link to="/connect" className="inline-flex items-center min-h-[44px] underline underline-offset-4 font-semibold">Fill out the Connect Card</Link>
        </div>
      </Section>
    </>
  );
}
