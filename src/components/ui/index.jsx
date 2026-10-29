import React, { forwardRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePhoto } from '../../photos';
import { safeUrl } from '../../utils';
import { GLOSSARY } from '../../content/glossary';

const isExternal = (to) => /^(https?:|mailto:|tel:|sms:)/i.test(to);

const BTN = {
  primary: 'bg-[#FFC44F] text-[#080c0b] border-[#FFC44F] hover:bg-[#ffce6b]',
  dark: 'bg-[#0B1613] text-white border-[#0B1613] hover:bg-black',
  ghost: 'bg-transparent text-[#080c0b] border-[#080c0b]/70 hover:bg-[#080c0b] hover:text-[#FFC44F]',
  light: 'bg-transparent text-white border-white/70 hover:bg-white hover:text-[#080c0b]',
};

// Link or button that looks like a button. One primary button per section.
export const Btn = forwardRef(function Btn({ to, href, onClick, variant = 'primary', className = '', children, type = 'button', ...rest }, ref) {
  const cls = `u-btn ${BTN[variant]} ${className}`;
  const target = href || to;
  if (target) {
    if (isExternal(target)) {
      const safe = /^https?:/i.test(target) ? safeUrl(target) : target;
      if (!safe) return null;
      const web = /^https?:/i.test(safe);
      return (
        <a ref={ref} href={safe} className={cls} onClick={onClick} {...(web ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
          {children}{web && <span className="sr-only"> (opens in a new tab)</span>}
        </a>
      );
    }
    return <Link ref={ref} to={target} onClick={onClick} className={cls} {...rest}>{children}</Link>;
  }
  return <button ref={ref} type={type} onClick={onClick} className={cls} {...rest}>{children}</button>;
});

const TONES = {
  cream: 'bg-[#F9F9F7] text-[#080c0b]',
  white: 'bg-white text-[#080c0b]',
  sand: 'bg-[#F2F1ED] text-[#080c0b]',
  ink: 'bg-[#0B1613] text-white',
  gold: 'bg-[#FFC44F] text-[#080c0b]',
};

export function Section({ tone = 'cream', id, className = '', narrow = false, children, ...rest }) {
  return (
    <section id={id} className={`${TONES[tone]} ${className}`} {...rest}>
      <div className={`${narrow ? 'max-w-3xl' : 'max-w-6xl'} mx-auto px-5 sm:px-8 py-14 md:py-20`}>{children}</div>
    </section>
  );
}

export function SectionHeader({ kicker, title, intro, center = false, as: Tag = 'h2', tone = 'light', className = '' }) {
  return (
    <div className={`${center ? 'text-center mx-auto' : ''} max-w-3xl mb-10 md:mb-12 ${className}`}>
      {kicker && <p className={`u-kicker ${tone === 'dark' ? 'text-[#FFC44F]' : 'text-[#8A6309]'}`}>{kicker}</p>}
      <Tag className="text-3xl md:text-4xl">{title}</Tag>
      {intro && <p className={`mt-4 text-lg md:text-xl leading-relaxed ${tone === 'dark' ? 'text-white/85' : 'text-[#2b2f2d]'}`}>{intro}</p>}
    </div>
  );
}

// A real photo when there is one, and a visible labeled stand-in until then.
export function PhotoBox({ src, alt = '', label, className = '', ratio = 'aspect-[4/3]', priority = false, rounded = true }) {
  const round = rounded ? 'rounded-2xl' : '';
  const url = safeUrl(src);
  if (url) {
    return (
      <div className={`${ratio} ${round} overflow-hidden bg-[#0B1613] ${className}`}>
        <img src={url} alt={alt} loading={priority ? 'eager' : 'lazy'} decoding="async" className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={`Photo placeholder: ${label}`}
      className={`${ratio} ${round} ${className} border-2 border-dashed border-[#8A6309]/60 bg-[#F2F1ED] flex items-center justify-center text-center p-4`}
    >
      <span className="text-sm font-semibold text-[#5c4306] leading-snug">[PHOTO: {label}]</span>
    </div>
  );
}

// A photo slot managed in the admin under Site Photos.
export function Photo({ slot, ...rest }) {
  const { url, alt, label } = usePhoto(slot);
  return <PhotoBox src={url} alt={alt} label={label} {...rest} />;
}

// Plain page opening: one H1, a short intro, an optional photo.
export function PageHeader({ kicker, title, intro, children, photo, photoRatio = 'aspect-[4/3]' }) {
  return (
    <header className="bg-[#F2F1ED]">
      <div className={`max-w-6xl mx-auto px-5 sm:px-8 py-12 md:py-16 ${photo ? 'grid md:grid-cols-2 gap-10 items-center' : ''}`}>
        <div className={photo ? '' : 'max-w-3xl'}>
          {kicker && <p className="u-kicker text-[#8A6309]">{kicker}</p>}
          <h1 className="text-4xl md:text-5xl">{title}</h1>
          {intro && <p className="mt-5 text-lg md:text-xl leading-relaxed text-[#2b2f2d]">{intro}</p>}
          {children && <div className="mt-7 flex flex-wrap gap-3">{children}</div>}
        </div>
        {photo && <Photo slot={photo} ratio={photoRatio} priority />}
      </div>
    </header>
  );
}

export function Cards({ children, cols = 3, className = '' }) {
  const grid = cols === 2 ? 'md:grid-cols-2' : cols === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3';
  return <div className={`grid gap-6 ${grid} ${className}`}>{children}</div>;
}

export function Card({ title, children, to, linkLabel, icon, className = '', tone = 'white', as: Tag = 'h3' }) {
  return (
    <article className={`rounded-2xl border border-black/10 p-6 md:p-7 flex flex-col ${tone === 'white' ? 'bg-white' : 'bg-[#F9F9F7]'} ${className}`}>
      {icon && <div className="mb-4">{icon}</div>}
      <Tag className="text-xl md:text-2xl mb-2">{title}</Tag>
      <div className="text-[#2b2f2d] leading-relaxed flex-grow space-y-3">{children}</div>
      {to && (
        <Btn to={to} variant="ghost" className="mt-5 self-start">
          {linkLabel || 'Learn more'}
        </Btn>
      )}
    </article>
  );
}

// Native details and summary: keyboard and screen reader friendly with no script.
export function Accordion({ items, className = '' }) {
  useEffect(() => {
    const open = () => {
      const id = window.location.hash.slice(1);
      const el = id && document.getElementById(id);
      if (el && el.tagName === 'DETAILS') { el.open = true; el.scrollIntoView({ block: 'start' }); }
    };
    open();
    window.addEventListener('hashchange', open);
    return () => window.removeEventListener('hashchange', open);
  }, [items.length]);
  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((it, i) => (
        <details key={it.id || i} id={it.id} className="u-acc group bg-white rounded-xl border border-black/10">
          <summary className="cursor-pointer list-none px-5 py-4 md:px-6 flex items-center justify-between gap-4 text-lg font-semibold min-h-[56px]">
            <span>{it.title}</span>
            <span aria-hidden="true" className="u-acc-icon flex-shrink-0 text-2xl leading-none text-[#8A6309]">+</span>
          </summary>
          <div className="px-5 pb-5 md:px-6 md:pb-6 text-[#2b2f2d] leading-relaxed space-y-3">{it.content}</div>
        </details>
      ))}
    </div>
  );
}

export function Steps({ items }) {
  return (
    <ol className="relative space-y-8">
      {items.map((it, i) => (
        <li key={it.title} className="flex gap-5">
          <div className="flex flex-col items-center">
            <span className="w-11 h-11 rounded-full bg-[#FFC44F] text-[#080c0b] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
            {i < items.length - 1 && <span className="w-px flex-grow bg-[#8A6309]/40 mt-2" aria-hidden="true"></span>}
          </div>
          <div className="pb-2">
            <h3 className="text-xl md:text-2xl mb-2">{it.title}</h3>
            <div className="text-[#2b2f2d] leading-relaxed space-y-3">{it.body}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function QuickFacts({ items }) {
  return (
    <dl className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map(f => (
        <div key={f.label} className="bg-white rounded-xl border border-black/10 p-5">
          <dt className="u-kicker text-[#8A6309] !mb-1">{f.label}</dt>
          <dd className="text-lg font-semibold leading-snug">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

// Every page ends with one clear call to action.
export function EndCta({ title, text, to, href, label }) {
  return (
    <section className="bg-[#0B1613] text-white" aria-label="Next step">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-14 md:py-20 text-center">
        <h2 className="text-3xl md:text-4xl">{title}</h2>
        {text && <p className="mt-4 text-lg md:text-xl text-white/85 leading-relaxed">{text}</p>}
        <div className="mt-8">
          <Btn to={to} href={href} variant="primary">{label}</Btn>
        </div>
      </div>
    </section>
  );
}

// A visible reminder that something still needs a real answer from the church.
export function Todo({ id, children }) {
  return (
    <span data-todo={id} className="inline bg-[#FFF3C4] text-[#5c4306] border border-dashed border-[#8A6309] rounded px-1.5 py-0.5 text-[0.95em] font-semibold">
      {children}
    </span>
  );
}

// Names a church term and explains it in plain words the first time it appears on a page.
export function Gloss({ k, children }) {
  const g = GLOSSARY[k];
  return (
    <>
      <strong>{children || g.term}</strong>{' '}
      <span>({g.plain}{g.plain && g.todo ? ' ' : ''}{g.todo && <Todo id={g.todo}>{g.todoText}</Todo>})</span>
    </>
  );
}

export function Prose({ children, className = '' }) {
  return <div className={`space-y-5 text-lg leading-relaxed text-[#2b2f2d] ${className}`}>{children}</div>;
}
