import React, { useMemo } from 'react';
import useFetch from '../hooks/useFetch';
import { imgUrl } from '../utils';
import { Btn, Section } from './ui';
import RichText from './RichText';
import { activeSpotlights } from '../lib/spotlights';

// On the yellow background the red button would not stand out, so the main button is dark there.
const YELLOW_DARK = '!bg-[#1e2522] !text-white !border-[#1e2522] hover:!bg-white hover:!text-[#1e2522] hover:!border-white';
const YELLOW_LINE = '!text-[#1e2522] !border-[#1e2522] hover:!bg-[#1e2522] hover:!text-white';

function Buttons({ s, center, onPhoto }) {
  if (!(s.button_label && s.button_url) && !(s.button2_label && s.button2_url)) return null;
  const yellow = s.tone === 'yellow';
  return (
    <div className={`flex flex-wrap gap-3 mt-6 ${center ? 'justify-center' : ''}`}>
      {s.button_label && s.button_url && <Btn to={s.button_url} variant={onPhoto ? 'gold' : 'primary'} className={yellow ? YELLOW_DARK : ''}>{s.button_label}</Btn>}
      {s.button2_label && s.button2_url && <Btn to={s.button2_url} variant={onPhoto ? 'light' : yellow ? 'ghost' : 'dark'} className={yellow ? YELLOW_LINE : ''}>{s.button2_label}</Btn>}
    </div>
  );
}

function Copy({ s, center }) {
  return (
    <div className={center ? 'text-center' : ''}>
      {s.kicker && <p className={`kicker ${s.tone === 'yellow' ? 'text-[#1e2522]' : 'text-[#c74f2f]'}`}>{s.kicker}</p>}
      {s.title && <h2 className="text-3xl md:text-5xl mb-4">{s.title}</h2>}
      {s.body && <RichText value={s.body} className="text-[1rem]" />}
      <Buttons s={s} center={center} />
    </div>
  );
}

function Spotlight({ s }) {
  const tone = s.tone;
  if (s.layout === 'photo' && s.image_url) {
    return (
      <section data-image-band="true" className="max-w-[1312px] mx-auto px-3 md:px-4 py-1.5 md:py-2">
        <div className="photo-section text-shade rounded-[10px] bg-[#1e2522] text-white py-24 md:py-36 px-6 md:px-10">
          <img src={imgUrl(s.image_url, 1600)} alt="" loading="lazy" decoding="async" className="photo-bg" />
          <div className="hero-text photo-copy max-w-4xl">
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
            {s.body && <RichText value={s.body} className="mt-1 text-[1rem]" />}
          </div>
          {s.button_label && s.button_url && <div className="shrink-0"><Btn to={s.button_url} variant="primary" className={tone === 'yellow' ? YELLOW_DARK : ''}>{s.button_label}</Btn></div>}
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

// Sections are white, light gray, yellow, or a full photo. Anything saved with an older color shows as light gray.
// Yellow is saved as "gold", a value the database already accepts.
const toneOf = (t) => (t === 'white' ? 'white' : t === 'gold' || t === 'yellow' ? 'yellow' : 'gray');

// Renders every layout that is turned on, in the order set in the admin. Nothing shows when none are on.
export default function Spotlights() {
  const { data } = useFetch('read/home_spotlights_church?sort=sort_order_num:asc');
  const active = useMemo(() => activeSpotlights(data), [data]);
  // Neighboring light gray sections, and neighboring yellow ones, must differ. A full photo section is shown as chosen,
  // even right under the hero photo.
  let prev = '';
  const shown = active.map((s) => {
    let tone = toneOf(s.tone);
    if ((tone === 'gray' || tone === 'yellow') && prev === tone) tone = 'white';
    prev = s.layout === 'photo' && s.image_url ? 'photo' : tone;
    return { ...s, tone };
  });
  return <>{shown.map(s => <Spotlight key={s.id} s={s} />)}</>;
}
