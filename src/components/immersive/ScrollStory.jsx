import React, { useEffect, useRef, useState } from 'react';

// Scrollytelling. On wide screens a stage stays in place while the beats scroll past,
// and the stage changes to match the beat in the middle of the screen. On phones the beats
// stack and each one shows its own badge. The text is always in reading order, and the stage
// is decoration only, so nothing is lost for a screen reader or with motion turned off.
export default function ScrollStory({ beats, label = 'Story', tone = 'light', heading: Heading = 'h3' }) {
  const [active, setActive] = useState(0);
  const refs = useRef([]);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) setActive(Number(e.target.dataset.i));
    }, { rootMargin: '-45% 0px -45% 0px' });
    refs.current.forEach(el => el && io.observe(el));
    return () => io.disconnect();
  }, [beats.length]);

  const dark = tone === 'dark';
  return (
    <div className="grid md:grid-cols-5 gap-10 md:gap-14 items-start">
      <div className="hidden md:block md:col-span-2 md:sticky md:top-32 self-start" aria-hidden="true">
        <div className={`${dark ? 'neu-dark' : 'neu'} relative aspect-square rounded-[2.5rem] overflow-hidden flex items-center justify-center`}>
          {beats.map((b, i) => (
            <div key={b.title} className="story-visual absolute inset-0 flex flex-col items-center justify-center text-center p-8" data-active={i === active}>
              {b.visual}
            </div>
          ))}
        </div>
        <div className="mt-6 h-2 rounded-full neu-inset overflow-hidden">
          <div className="h-full bg-[#FFC44F] rounded-full transition-[width] duration-500" style={{ width: `${((active + 1) / beats.length) * 100}%` }}></div>
        </div>
      </div>
      <ol className="md:col-span-3 space-y-10 md:space-y-0" aria-label={label}>
        {beats.map((b, i) => (
          <li key={b.title} ref={el => { refs.current[i] = el; }} data-i={i} data-active={i === active} className="story-beat md:min-h-[55vh] md:flex md:flex-col md:justify-center">
            <div className="md:hidden mb-3 w-12 h-12 rounded-full bg-[#FFC44F] text-black font-black flex items-center justify-center neu-badge" aria-hidden="true">{i + 1}</div>
            {b.kicker && <span className="kicker text-[#8A6309]">{b.kicker}</span>}
            <Heading className="text-2xl md:text-4xl mb-3">{b.title}</Heading>
            <div className="text-lg leading-relaxed text-black/80 space-y-3">{b.body}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// A simple stage picture: a big word or number with a small line under it.
export function Stage({ big, small, icon }) {
  return (
    <>
      {icon && <span className="w-20 h-20 rounded-full neu flex items-center justify-center text-[#8A6309] mb-6">{icon}</span>}
      <span className="font-black uppercase text-5xl lg:text-6xl leading-none" style={{ fontFamily: "'Google Sans Flex', sans-serif" }}>{big}</span>
      {small && <span className="mt-4 font-serif italic text-xl text-black/70 max-w-[20ch]">{small}</span>}
    </>
  );
}
