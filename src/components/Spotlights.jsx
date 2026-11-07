import React, { useMemo } from 'react';
import useFetch from '../hooks/useFetch';
import { imgUrl } from '../utils';
import { Btn, Section } from './ui';
import RichText from './RichText';
import { activeSpotlights } from '../lib/spotlights';

function Buttons({ s, center, onPhoto }) {
  if (!(s.button_label && s.button_url) && !(s.button2_label && s.button2_url)) return null;
  return (
    <div className={`flex flex-wrap gap-3 mt-6 ${center ? 'justify-center' : ''}`}>
      {s.button_label && s.button_url && <Btn to={s.button_url} variant="primary">{s.button_label}</Btn>}
      {s.button2_label && s.button2_url && <Btn to={s.button2_url} variant={onPhoto ? 'light' : 'dark'}>{s.button2_label}</Btn>}
    </div>
  );
}

function Copy({ s, center }) {
  return (
    <div className={center ? 'text-center' : ''}>
      {s.kicker && <p className="kicker text-[#c74f2f]">{s.kicker}</p>}
      {s.title && <h2 className="text-3xl md:text-5xl mb-4">{s.title}</h2>}
      {s.body && <RichText value={s.body} className="text-[0.95rem]" />}
      <Buttons s={s} center={center} />
    </div>
  );
}

function Spotlight({ s }) {
  const tone = s.tone;
  if (s.layout === 'photo' && s.image_url) {
    return (
      <section data-image-band="true" className="max-w-[1312px] mx-auto px-3 md:px-4 py-1.5 md:py-2">
        <div className="photo-section rounded-[10px] bg-[#1e2522] text-white py-24 md:py-36 px-6 md:px-10">
          <img src={imgUrl(s.image_url, 1600)} alt="" loading="lazy" decoding="async" className="photo-bg" />
          <div className="hero-text max-w-3xl">
            {s.title && <h2 className="text-3xl md:text-5xl mb-4">{s.title}</h2>}
            {s.body && <RichText value={s.body} className="text-base" />}
            <Buttons s={s} onPhoto />
          </div>
        </div>
      </section>
    );
  }
  if (s.layout === 'banner') {
    return (
      <Section tone={tone} className="!py-8 md:!py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-center md:text-left">
          <div>
            {s.title && <h2 className="text-2xl md:text-3xl">{s.title}</h2>}
            {s.body && <RichText value={s.body} className="mt-1 text-[0.95rem]" />}
          </div>
          {s.button_label && s.button_url && <div className="shrink-0"><Btn to={s.button_url} variant="primary">{s.button_label}</Btn></div>}
        </div>
      </Section>
    );
  }
  const photo = s.image_url && (
    <div className="aspect-[4/3]"><img src={imgUrl(s.image_url, 1000)} alt="" loading="lazy" className="w-full h-full object-cover rounded-[10px]" /></div>
  );
  if ((s.layout === 'photo-right' || s.layout === 'photo-left' || s.layout === 'photo') && photo) {
    return (
      <Section tone={tone}>
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          {s.layout === 'photo-left' ? <>{photo}<Copy s={s} /></> : <><Copy s={s} />{photo}</>}
        </div>
      </Section>
    );
  }
  return (
    <Section tone={tone} narrow center>
      <Copy s={s} center />
    </Section>
  );
}

// Sections are white, light gray, or a full photo. Anything saved with an older color shows as light gray.
const toneOf = (t) => (t === 'white' ? 'white' : 'gray');

// Renders every layout that is turned on, in the order set in the admin. Nothing shows when none are on.
export default function Spotlights() {
  const { data } = useFetch('read/home_spotlights_church?sort=sort_order_num:asc');
  const active = useMemo(() => activeSpotlights(data), [data]);
  // Neighboring light gray sections must differ, and the first section sits right under the hero photo,
  // so a photo layout there is shown beside its text instead.
  let prev = '';
  const shown = active.map((s, i) => {
    let tone = toneOf(s.tone);
    if (tone === 'gray' && prev === 'gray') tone = 'white';
    const layout = s.layout === 'photo' && i === 0 ? 'photo-right' : s.layout;
    prev = layout === 'photo' ? 'photo' : tone;
    return { ...s, tone, layout };
  });
  return <>{shown.map(s => <Spotlight key={s.id} s={s} />)}</>;
}
