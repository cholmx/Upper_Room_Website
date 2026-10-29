import React, { useMemo } from 'react';
import usePageMeta from '../hooks/usePageMeta';
import useFetch from '../hooks/useFetch';
import { isLive } from '../utils';
import { Section, SectionHeader, PageHeader, PhotoBox, Todo } from '../components/ui';
import RichText from '../components/RichText';
import FormBlock from '../components/FormBlock';

export default function Stories() {
  usePageMeta('stories');
  const { data } = useFetch('read/stories_church?sort=created_at:desc');
  const stories = useMemo(() => (data ?? []).filter(isLive), [data]);
  return (
    <>
      <PageHeader
        kicker="Stories"
        title="Stories from our church family"
        intro="These are real stories from people who call this place home. Each one is shared with permission."
      />
      <Section tone="cream">
        {stories.length === 0 ? (
          <p className="text-lg"><Todo id="stories">[ADD 3 TO 5 SHORT STORIES WITH WRITTEN PERMISSION]</Todo></p>
        ) : (
          <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map(s => (
              <li key={s.id} className="bg-white rounded-2xl border border-black/10 overflow-hidden flex flex-col">
                <PhotoBox src={s.photo_url} alt={s.name ? `Photo of ${s.name}` : ''} label={`${s.name || 'story'} photo`} ratio="aspect-[4/3]" rounded={false} />
                <div className="p-6 flex flex-col flex-grow">
                  <blockquote className="text-xl leading-snug">“{s.quote}”</blockquote>
                  {s.name && <p className="mt-3 font-semibold text-[#8A6309]">{s.name}</p>}
                  {s.body && (
                    <details className="mt-4 u-acc">
                      <summary className="cursor-pointer list-none min-h-[44px] flex items-center font-semibold underline underline-offset-4 text-[#8A6309]">Read more</summary>
                      <RichText value={s.body} className="mt-3" />
                    </details>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
      <Section tone="sand">
        <div className="grid md:grid-cols-5 gap-10 items-start">
          <div className="md:col-span-2">
            <SectionHeader title="Share your story" className="!mb-4" />
            <p className="text-lg leading-relaxed text-black/80">If God has done something in your life, we would love to hear it. It might encourage someone else.</p>
          </div>
          <div className="md:col-span-3"><FormBlock formKey="story" /></div>
        </div>
      </Section>
    </>
  );
}
