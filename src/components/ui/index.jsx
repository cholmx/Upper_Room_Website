import React, { forwardRef, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePhoto, usePhotoUrls } from '../../photos';
import { imgUrl, safeUrl } from '../../utils';
import Media from '../Media';
import { GLOSSARY } from '../../content/glossary';
import { HERO_IMAGES } from '../../content/photos';
import { SEO_ROUTES } from '../../content/seo';
import { useAuth } from '../../auth';
import { useSite } from '../../settings';

const isExternal = (to) => /^(https?:|mailto:|tel:|sms:)/i.test(to);

const BTN = {
  primary: 'btn btn-solid',
  accent: 'btn bg-[#c74f2f] text-white border-[#c74f2f] hover:bg-[#1e2522] hover:border-[#1e2522]',
  dark: 'btn bg-[#1e2522] text-white border-[#1e2522] hover:bg-[#eaa235] hover:text-[#1e2522] hover:border-[#eaa235]',
  ghost: 'btn btn-outline',
  light: 'btn btn-outline-dark',
};

// Link or button in the site's pill style. One primary button per section.
export const Btn = forwardRef(function Btn({ to, href, onClick, variant = 'primary', className = '', children, type = 'button', ...rest }, ref) {
  const cls = `${BTN[variant]} ${className}`;
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

// The site palette: ink, terracotta and amber for strong bands, cream and white for light ones (forest, sage and bronze are kept as names for amber and ink).
// and the two golds for warm bands. Neighboring sections must differ (see the colors check in the README).
const TONES = {
  cream: 'text-black',
  white: 'bg-white text-black',
  sand: 'bg-white text-black',
  gray: 'paper-bg text-black',
};

export function Section({ tone = 'cream', id, className = '', narrow = false, center = false, children, ...rest }) {
  const panel = tone === 'gray';
  return (
    <section id={id} className="max-w-[1312px] mx-auto px-3 md:px-4 py-1.5 md:py-2 scroll-mt-32" {...rest}>
      <div className={`${TONES[tone]} ${panel ? 'rounded-[10px]' : ''} py-16 md:py-24 px-6 md:px-10 ${className}`}>
        <div className={`${narrow ? `max-w-[800px] ${center ? 'mx-auto' : ''}` : ''} relative z-10`}>
          {children}
        </div>
      </div>
    </section>
  );
}

// A label that only repeats the heading below it adds nothing, so it is left out.
const same = (a, b) => String(a || '').toLowerCase().replace(/&|\band\b/g, '').replace(/[^a-z]/g, '') === String(b || '').toLowerCase().replace(/&|\band\b/g, '').replace(/[^a-z]/g, '');

export function SectionHeader({ kicker, title, intro, center = false, as: Tag = 'h2', tone = 'light', className = '' }) {
  return (
    <div className={`${center ? 'text-center mx-auto' : ''} max-w-3xl mb-10 md:mb-12 ${className}`}>
      {kicker && !same(kicker, title) && <span className={`kicker ${tone === 'dark' ? 'text-[#eaa235]' : 'text-[#1e2522]'}`}>{kicker}</span>}
      <Tag className="text-3xl md:text-5xl">{title}</Tag>
      {intro && <p className={`mt-4 text-[1rem] leading-relaxed ${tone === 'dark' ? 'text-white/85' : 'text-black'}`}>{intro}</p>}
    </div>
  );
}

// A real photo when one is set. Nothing shows until then, so there are no empty boxes.
export function Photo({ slot, className = '', ratio = 'aspect-[4/3]', priority = false, rounded = true }) {
  const { url, alt } = usePhoto(slot);
  const [failed, setFailed] = useState(null);
  if (!url || failed === url) return null;
  return (
    <div className={`${ratio} ${rounded ? 'rounded-3xl' : ''} overflow-hidden elev-1 bg-[#1e2522] ${className}`}>
      <Media src={url} alt={alt} priority={priority} onError={() => setFailed(url)} className="w-full h-full object-cover" />
    </div>
  );
}

// An image from a database row (leader, story, event). Leaders fall back to their initials.
export function PhotoBox({ src, alt = '', initials, className = '', ratio = 'aspect-[4/3]', rounded = true, bg = 'bg-[#EDE9DC]', fit = 'object-cover' }) {
  const url = safeUrl(src);
  if (url) {
    return (
      <div className={`${ratio} ${rounded ? 'rounded-3xl' : ''} overflow-hidden ${bg} ${className}`}>
        <img src={url} alt={alt} loading="lazy" decoding="async" className={`w-full h-full ${fit}`} />
      </div>
    );
  }
  if (!initials) return null;
  return (
    <div aria-hidden="true" className={`${ratio} ${rounded ? 'rounded-3xl' : ''} bg-gradient-to-br from-[#1e2522] to-[#1e2522] flex items-center justify-center text-6xl font-black text-[#eaa235]/60 ${className}`}>
      {initials}
    </div>
  );
}

// A row of photos that only appears once at least one of them has been added.
export function PhotoGrid({ slots, className = '' }) {
  const urls = usePhotoUrls(slots);
  if (!urls.some(Boolean)) return null;
  return <div className={`grid gap-6 md:grid-cols-2 ${className}`}>{slots.map(s => <Photo key={s} slot={s} />)}</div>;
}

// Photos for the places on the site that sit beside text. A photo added in Site Photos replaces the stand-in picture.
const STOCK = [...new Set(Object.values(HERO_IMAGES))];
const stockFor = (slot) => STOCK[[...slot].reduce((n, c) => n + c.charCodeAt(0), 0) % STOCK.length];

export function SlotImage({ slot, ratio = 'aspect-[4/3]', className = '' }) {
  const { url, alt, loaded } = usePhoto(slot);
  return (
    <div className={`${ratio} overflow-hidden rounded-[10px] bg-[#1e2522] ${className}`}>
      {loaded && <Media src={url || stockFor(slot)} width={url ? undefined : 1000} alt={url ? alt : ''} className="w-full h-full object-cover" />}
    </div>
  );
}

// A section with text on one side and a photo on the other.
export function PhotoSplit({ slot, side = 'right', tone = 'white', id, ratio, className = '', children }) {
  return (
    <Section tone={tone} id={id} className={className}>
      <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div className={side === 'left' ? 'md:order-2' : ''}>{children}</div>
        <SlotImage slot={slot} ratio={ratio} className={side === 'left' ? 'md:order-1' : ''} />
      </div>
    </Section>
  );
}

// An embedded map of the church, loaded only when it nears the screen, with a Directions button underneath.
export function MapEmbed({ className = '' }) {
  const SITE = useSite();
  return (
    <figure className={`bg-white rounded-[10px] overflow-hidden text-black ${className}`}>
      <div className="aspect-[16/10] bg-[#EDE9DC]">
        <iframe
          title={`Map to ${SITE.name}, ${SITE.addressLine}`}
          src={SITE.mapEmbedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full block"
        />
      </div>
      <figcaption className="p-4 md:p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-display font-bold text-lg leading-tight">{SITE.name}</div>
          <div className="text-sm mt-1">{SITE.addressLine}</div>
        </div>
        <Btn href={SITE.googleMapsUrl} variant="primary">Get Directions</Btn>
      </figcaption>
    </figure>
  );
}

// A section whose whole background is a photo, with white text on it. Photos are never darkened,
// so choose a photo with a calm area for the words.
export function PhotoBand({ slot, id, className = '', wide = false, children }) {
  const { url, loaded } = usePhoto(slot);
  const src = loaded ? imgUrl(url || stockFor(slot), 1600) : '';
  return (
    <section id={id} data-image-band="true" className="max-w-[1312px] mx-auto px-3 md:px-4 py-1.5 md:py-2 scroll-mt-32">
      <div className={`photo-section text-shade rounded-[10px] bg-[#1e2522] text-white py-24 md:py-36 px-6 md:px-10 ${className}`}>
        {src && <Media src={src} className="photo-bg" />}
        <div className={`hero-text photo-copy ${wide ? '' : 'max-w-4xl'}`}>{children}</div>
      </div>
    </section>
  );
}

const PAGE_KEY_BY_ROUTE = Object.fromEntries(Object.entries(SEO_ROUTES).map(([k, v]) => [v, k]));

function usePageBanner(pageKey) {
  const { pathname } = useLocation();
  const key = pageKey || PAGE_KEY_BY_ROUTE[pathname] || (pathname.startsWith('/messages') ? 'messages' : pathname.startsWith('/events') ? 'events' : pathname.startsWith('/blog') ? 'blog' : 'about');
  const { url, loaded } = usePhoto(`banner-${key}`);
  if (!loaded) return '';
  return url || HERO_IMAGES[key] || HERO_IMAGES.about;
}

// The page banner: a photo with a dark wash, a gold kicker, a big heading, and an intro.
export function PageHeader({ kicker, title, intro, children, page, image: imageOverride, compact = false, narrowIntro = false }) {
  const banner = usePageBanner(page);
  const image = banner && imageOverride ? imageOverride : banner;
  return (
    <header className="max-w-[1312px] mx-auto px-3 md:px-4 pt-3 md:pt-4 pb-1.5 md:pb-2">
      <div className={`photo-section nav-fade text-shade rounded-[10px] text-[#ffffff] ${compact ? 'py-16' : 'py-24'} md:py-36 px-6 md:px-10 text-left flex items-end`}>
        {image && <Media src={image} width={1600} priority className="photo-bg" />}
        <div className="hero-text max-w-[800px]">
          {kicker && !same(kicker, title) && <span className="kicker text-[#eaa235]">{kicker}</span>}
          <h1 className={`text-4xl md:text-6xl ${compact ? 'mb-0 md:mb-6' : 'mb-6'}`}>{title}</h1>
          {intro && <p className={`${compact ? 'hidden md:block ' : ''}font-serif text-xl md:text-2xl text-white ${narrowIntro ? 'max-w-[30ch]' : 'max-w-[50ch]'} leading-[1.12] md:leading-[1.12]`}>{intro}</p>}
          {children && <div className="mt-8 flex flex-wrap gap-4">{children}</div>}
        </div>
      </div>
    </header>
  );
}

export function Cards({ children, cols = 3, className = '' }) {
  const grid = cols === 2 ? 'md:grid-cols-2' : cols === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3';
  return <div className={`grid gap-6 md:gap-8 ${grid} ${className}`}>{children}</div>;
}

// A plain run of titled passages, one after another.
export function Beats({ beats, heading: Heading = 'h3' }) {
  const withPhotos = beats.some(b => b.photo);
  return (
    <div className={withPhotos ? 'space-y-14 md:space-y-20' : 'max-w-3xl space-y-12'}>
      {beats.map((b, i) => {
        const text = (
          <div>
            {b.kicker && <p className="kicker text-[#1e2522] !mb-1">{b.kicker}</p>}
            <Heading className="text-2xl md:text-3xl mb-3">{b.title}</Heading>
            <div className="text-[1rem] leading-relaxed text-black space-y-3">{b.body}</div>
          </div>
        );
        if (!b.photo) return <div key={b.title}>{text}</div>;
        return (
          <div key={b.title} className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <div className={i % 2 ? 'md:order-2' : ''}>{text}</div>
            <SlotImage slot={b.photo} className={i % 2 ? 'md:order-1' : ''} />
          </div>
        );
      })}
    </div>
  );
}

export function Card({ title, children, to, linkLabel, icon, className = '', as: Tag = 'h3' }) {
  return (
    <article className={`fcard !p-8 flex flex-col ${className}`}>
      {icon && <div className="mb-4">{icon}</div>}
      <Tag className="text-2xl mb-3">{title}</Tag>
      <div className="text-black leading-relaxed flex-grow space-y-3">{children}</div>
      {to && (
        <div className="mt-6">
          {isExternal(to) ? (
            <a href={to} target="_blank" rel="noopener noreferrer" className="inline-flex items-center font-display font-bold tracking-wide text-[0.9rem] text-[#1e2522] hover:text-[#1e2522] transition-colors">
              {linkLabel || 'Learn more'} <span aria-hidden="true" className="ml-2">&rarr;</span><span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            <Link to={to} className="inline-flex items-center font-display font-bold tracking-wide text-[0.9rem] text-[#1e2522] hover:text-[#1e2522] transition-colors">
              {linkLabel || 'Learn more'} <span aria-hidden="true" className="ml-2">&rarr;</span>
            </Link>
          )}
        </div>
      )}
    </article>
  );
}

// Native details and summary: keyboard and screen reader friendly with no script.
export function Accordion({ items, className = '', group }) {
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
        <details key={it.id || i} id={it.id} name={group} className="u-acc neu-acc group rounded-2xl">
          <summary className="cursor-pointer px-6 py-5 flex items-center justify-between gap-4 text-lg font-bold min-h-[56px]">
            <span className="font-semibold text-lg">{it.title}</span>
            <span aria-hidden="true" className="u-acc-icon flex-shrink-0 text-2xl leading-none text-[#1e2522]">+</span>
          </summary>
          <div className="px-6 pb-6 text-black leading-relaxed space-y-3">{it.content}</div>
        </details>
      ))}
    </div>
  );
}

// A sticky "On this page" bar that jumps to a section and marks the one in view.
export function PageNav({ items }) {
  const [current, setCurrent] = useState('');
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const seen = new Map();
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => seen.set(e.target.id, e.isIntersecting));
      const first = items.find(([id]) => seen.get(id));
      if (first) setCurrent(first[0]);
    }, { rootMargin: '-140px 0px -55% 0px' });
    items.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [items]);
  return (
    <nav aria-label="On this page" className="sticky top-20 z-40 bg-white border-b border-[#1e2522]/10">
      <div className="max-w-[1312px] mx-auto px-6 md:px-14">
        <ul className="flex gap-2 overflow-x-auto py-3 text-sm">
          <li className="flex items-center pr-2 font-display font-bold text-black whitespace-nowrap">On this page</li>
          {items.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} aria-current={current === id ? 'true' : undefined} className={`inline-flex items-center min-h-[40px] px-4 rounded-full font-display font-bold whitespace-nowrap ${current === id ? 'bg-[#1e2522] text-white' : 'bg-[#EDE9DC] text-[#1e2522] hover:bg-[#1e2522]/15'}`}>{label}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export function Steps({ items }) {
  return (
    <ol className="relative space-y-8">
      {items.map((it, i) => (
        <li key={it.title} className="flex gap-5">
          <div className="flex flex-col items-center">
            <span className="w-12 h-12 rounded-full bg-[#c74f2f] text-white font-black flex items-center justify-center flex-shrink-0">{i + 1}</span>
            {i < items.length - 1 && <span className="w-px flex-grow bg-[#eaa235]/60 mt-2" aria-hidden="true"></span>}
          </div>
          <div className="pb-2">
            <h3 className="text-xl md:text-2xl mb-2">{it.title}</h3>
            <div className="text-black leading-relaxed space-y-3">{it.body}</div>
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
        <div key={f.label} className="neu-inset rounded-3xl p-6">
          <dt className="kicker text-[#1e2522] !mb-1">{f.label}</dt>
          <dd className="text-lg font-bold leading-snug">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

// A band of two panels side by side, edge to edge. The panels are the section: each one is a block of color
// with its own content, and the text lines up with the rest of the page. Use sparingly, one or two per page.
const PANEL = 'paper-bg text-[#1e2522]';

export function Band({ children, id, className = '' }) {
  return (
    <section id={id} data-band="true" className={`max-w-[1312px] mx-auto px-3 md:px-4 py-1.5 md:py-2 ${className}`}>
      <div className="grid md:grid-cols-2 gap-3 md:gap-4">{children}</div>
    </section>
  );
}

export function Panel({ title, as: Tag = 'h2', children, id, className = '' }) {
  return (
    <div id={id} className={`${PANEL} rounded-[10px] scroll-mt-24 py-14 md:py-20 px-8 md:px-12 ${className}`}>
      {title && <Tag className="text-3xl md:text-4xl mb-6">{title}</Tag>}
      <div className="box-body space-y-4 text-[1rem] leading-relaxed max-w-[34rem]">{children}</div>
    </div>
  );
}

// Staff see these reminders while signed in. Visitors never see an unfinished placeholder.
export function AdminOnly({ children }) {
  const user = useAuth()?.user;
  return user ? <>{children}</> : null;
}

export function Todo({ id, children }) {
  const user = useAuth()?.user;
  if (!user) return null;
  return (
    <span data-todo={id} className="inline bg-[#eaa235] text-[#1e2522] border border-dashed border-[#1e2522] rounded px-1.5 py-0.5 text-[0.95em] font-semibold normal-case tracking-normal not-italic">
      {children}
    </span>
  );
}

// Names a church term and explains it in plain words the first time it appears on a page.
export function Gloss({ k, children }) {
  const g = GLOSSARY[k];
  const user = useAuth()?.user;
  const note = g.todo && user;
  return (
    <>
      <strong>{children || g.term}</strong>
      {(g.plain || note) && (
        <span>{' '}({g.plain}{g.plain && note ? ' ' : ''}{note && <Todo id={g.todo}>{g.todoText}</Todo>})</span>
      )}
    </>
  );
}

export function Prose({ children, className = '' }) {
  return <div className={`space-y-5 text-[1rem] leading-relaxed text-black ${className}`}>{children}</div>;
}
