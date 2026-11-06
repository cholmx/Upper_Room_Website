import React, { useMemo } from 'react';
import useFetch from '../hooks/useFetch';
import { imgUrl } from '../utils';
import { Btn, Section } from './ui';
import RichText from './RichText';
import { activeSpotlights } from '../lib/spotlights';

const FIRST = { white: 'primary', ink: 'primary', terra: 'light', gold: 'dark' };
const SECOND = { white: 'dark', ink: 'light', terra: 'dark', gold: 'light' };
const DARK_TONES = ['ink', 'terra'];

function Buttons({ s, center }) {
  const tone = s.tone || 'white';
  if (!(s.button_label && s.button_url) && !(s.button2_label && s.button2_url)) return null;
  return (
    <div className={`flex flex-wrap gap-3 mt-6 ${center ? 'justify-center' : ''}`}>
      {s.button_label && s.button_url && <Btn to={s.button_url} variant={FIRST[tone]}>{s.button_label}</Btn>}
      {s.button2_label && s.button2_url && <Btn to={s.button2_url} variant={SECOND[tone]}>{s.button2_label}</Btn>}
    </div>
  );
}

function Copy({ s, center }) {
  const tone = s.tone || 'white';
  const kickerColor = tone === 'white' ? 'text-[#c74f2f]' : DARK_TONES.includes(tone) ? 'text-white' : 'text-[#1e2522]';
  return (
    <div className={center ? 'text-center' : ''}>
      {s.kicker && <p className={`kicker ${kickerColor}`}>{s.kicker}</p>}
      {s.title && <h2 className="text-3xl md:text-5xl mb-4">{s.title}</h2>}
      {s.body && <RichText value={s.body} className="text-[0.95rem]" />}
      <Buttons s={s} center={center} />
    </div>
  );
}

function Spotlight({ s }) {
  const tone = s.tone || 'white';
  const cls = DARK_TONES.includes(tone) ? 'spotlight-dark' : '';
  if (s.layout === 'banner') {
    return (
      <Section tone={tone} className={`!py-8 md:!py-10 ${cls}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-center md:text-left">
          <div>
            {s.title && <h2 className="text-2xl md:text-3xl">{s.title}</h2>}
            {s.body && <RichText value={s.body} className="mt-1 text-[0.95rem]" />}
          </div>
          {s.button_label && s.button_url && <div className="shrink-0"><Btn to={s.button_url} variant={FIRST[tone]}>{s.button_label}</Btn></div>}
        </div>
      </Section>
    );
  }
  const photo = s.image_url && (
    <div className="aspect-[4/3]"><img src={imgUrl(s.image_url, 1000)} alt="" loading="lazy" className="w-full h-full object-cover rounded-[10px]" /></div>
  );
  if ((s.layout === 'photo-right' || s.layout === 'photo-left') && photo) {
    return (
      <Section tone={tone} className={cls}>
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          {s.layout === 'photo-left' ? <>{photo}<Copy s={s} /></> : <><Copy s={s} />{photo}</>}
        </div>
      </Section>
    );
  }
  return (
    <Section tone={tone} narrow center className={cls}>
      <Copy s={s} center />
    </Section>
  );
}

// Renders every layout that is turned on, in the order set in the admin. Nothing shows when none are on.
export default function Spotlights() {
  const { data } = useFetch('read/home_spotlights_church?sort=sort_order_num:asc');
  const active = useMemo(() => activeSpotlights(data), [data]);
  // Neighboring panels must differ in color, so a layout that repeats the one above it takes the next color.
  const ORDER = ['white', 'ink', 'terra', 'gold'];
  let prev = '';
  const shown = active.map(s => {
    let tone = ORDER.includes(s.tone) ? s.tone : 'white';
    if (tone === prev) tone = ORDER[(ORDER.indexOf(tone) + 1) % ORDER.length];
    prev = tone;
    return { ...s, tone };
  });
  return <>{shown.map(s => <Spotlight key={s.id} s={s} />)}</>;
}
