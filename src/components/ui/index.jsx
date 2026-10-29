import React, { forwardRef, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePhoto, usePhotoUrls } from '../../photos';
import { imgUrl, safeUrl } from '../../utils';
import { GLOSSARY } from '../../content/glossary';
import { HERO_IMAGES } from '../../content/photos';
import { SEO_ROUTES } from '../../content/seo';
import { useAuth } from '../../auth';

const isExternal = (to) => /^(https?:|mailto:|tel:|sms:)/i.test(to);

const BTN = {
  primary: 'btn btn-solid',
  dark: 'btn bg-[#0B1613] text-white border-[#0B1613] hover:bg-[#FFC44F] hover:text-black hover:border-[#FFC44F]',
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

const TONES = {
  cream: 'bg-[#F9F9F7] text-black',
  white: 'bg-white text-black',
  sand: 'bg-white text-black border-y border-black/5',
  ink: 'bg-[#0B1613] text-[#F9F9F7] relative overflow-hidden glow-gold',
  gold: 'bg-[#FFC44F] text-black',
  bronze: 'bg-[#CCA866] text-black',
};

export function Section({ tone = 'cream', id, className = '', narrow = false, children, ...rest }) {
  return (
    <section id={id} className={`${TONES[tone]} py-20 md:py-24 px-6 ${className}`} {...rest}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className={`${narrow ? 'max-w-[800px]' : 'max-w-[1145px]'} mx-auto relative z-10`}
      >
        {children}
      </motion.div>
    </section>
  );
}

export function SectionHeader({ kicker, title, intro, center = false, as: Tag = 'h2', tone = 'light', className = '' }) {
  return (
    <div className={`${center ? 'text-center mx-auto' : ''} max-w-3xl mb-10 md:mb-12 ${className}`}>
      {kicker && <span className={`kicker ${tone === 'dark' ? 'text-[#FFC44F]' : 'text-[#8A6309]'}`}>{kicker}</span>}
      <Tag className="text-3xl md:text-5xl">{title}</Tag>
      {intro && <p className={`mt-4 text-lg leading-relaxed ${tone === 'dark' ? 'text-white/85' : 'text-black/80'}`}>{intro}</p>}
    </div>
  );
}

// A real photo when one is set. Nothing shows until then, so there are no empty boxes.
export function Photo({ slot, className = '', ratio = 'aspect-[4/3]', priority = false, rounded = true }) {
  const { url, alt } = usePhoto(slot);
  const [failed, setFailed] = useState(null);
  if (!url || failed === url) return null;
  return (
    <div className={`${ratio} ${rounded ? 'rounded-3xl' : ''} overflow-hidden border border-black/5 shadow-xl bg-[#0B1613] ${className}`}>
      <img src={url} alt={alt} loading={priority ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(url)} className="w-full h-full object-cover" />
    </div>
  );
}

// An image from a database row (leader, story, event). Leaders fall back to their initials.
export function PhotoBox({ src, alt = '', initials, className = '', ratio = 'aspect-[4/3]', rounded = true }) {
  const url = safeUrl(src);
  if (url) {
    return (
      <div className={`${ratio} ${rounded ? 'rounded-3xl' : ''} overflow-hidden bg-[#0B1613] ${className}`}>
        <img src={url} alt={alt} loading="lazy" decoding="async" className="w-full h-full object-cover" />
      </div>
    );
  }
  if (!initials) return null;
  return (
    <div aria-hidden="true" className={`${ratio} ${rounded ? 'rounded-3xl' : ''} bg-gradient-to-br from-[#0B1613] to-[#1A2E28] flex items-center justify-center text-6xl font-black text-[#FFC44F]/60 ${className}`}>
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

// Text beside a photo when there is one, and full width text when there is not.
export function Split({ photo, children, reverse = false, className = '' }) {
  const { url } = usePhoto(photo);
  if (!url) return <div className={className}>{children}</div>;
  return (
    <div className={`grid md:grid-cols-2 gap-12 items-center ${className}`}>
      <div className={reverse ? 'md:order-2' : ''}>{children}</div>
      <Photo slot={photo} />
    </div>
  );
}

const PAGE_KEY_BY_ROUTE = Object.fromEntries(Object.entries(SEO_ROUTES).map(([k, v]) => [v, k]));

function usePageBanner(pageKey) {
  const { pathname } = useLocation();
  const key = pageKey || PAGE_KEY_BY_ROUTE[pathname] || (pathname.startsWith('/messages') ? 'messages' : pathname.startsWith('/events') ? 'events' : pathname.startsWith('/blog') ? 'blog' : 'about');
  const { url } = usePhoto(`banner-${key}`);
  return url || HERO_IMAGES[key] || HERO_IMAGES.about;
}

// The page banner: a photo with a dark wash, a gold kicker, a big heading, and an intro.
export function PageHeader({ kicker, title, intro, children, page }) {
  const image = usePageBanner(page);
  return (
    <header className="photo-section text-[#F9F9F7] py-24 md:py-32 px-6 text-center" style={{ backgroundImage: `url('${imgUrl(image, 1600)}')` }}>
      <div className="scrim"></div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-[800px] mx-auto relative z-10"
      >
        {kicker && <span className="kicker text-[#FFC44F]">{kicker}</span>}
        <h1 className="text-4xl md:text-7xl mb-6 drop-shadow-lg">{title}</h1>
        {intro && <p className="font-serif italic text-xl md:text-2xl text-white/90 max-w-[50ch] mx-auto drop-shadow-md leading-relaxed">{intro}</p>}
        {children && <div className="mt-8 flex flex-wrap justify-center gap-4">{children}</div>}
      </motion.div>
    </header>
  );
}

export function Cards({ children, cols = 3, className = '' }) {
  const grid = cols === 2 ? 'md:grid-cols-2' : cols === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3';
  return <div className={`grid gap-6 md:gap-8 ${grid} ${className}`}>{children}</div>;
}

export function Card({ title, children, to, linkLabel, icon, className = '', as: Tag = 'h3' }) {
  return (
    <article className={`fcard !p-8 flex flex-col ${className}`}>
      {icon && <div className="mb-4">{icon}</div>}
      <Tag className="text-2xl mb-3">{title}</Tag>
      <div className="text-black/80 leading-relaxed flex-grow space-y-3">{children}</div>
      {to && (
        <div className="mt-6">
          <Link to={to} className="inline-flex items-center font-bold uppercase tracking-widest text-[#8A6309] hover:text-black transition-colors">
            {linkLabel || 'Learn more'} <span aria-hidden="true" className="ml-2">&rarr;</span>
          </Link>
        </div>
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
        <details key={it.id || i} id={it.id} className="u-acc group bg-white rounded-2xl border border-black/5 shadow-sm">
          <summary className="cursor-pointer px-6 py-5 flex items-center justify-between gap-4 text-lg font-bold min-h-[56px]">
            <span>{it.title}</span>
            <span aria-hidden="true" className="u-acc-icon flex-shrink-0 text-2xl leading-none text-[#8A6309]">+</span>
          </summary>
          <div className="px-6 pb-6 text-black/85 leading-relaxed space-y-3">{it.content}</div>
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
            <span className="w-12 h-12 rounded-full bg-[#FFC44F] text-black font-black flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(255,196,79,0.3)]">{i + 1}</span>
            {i < items.length - 1 && <span className="w-px flex-grow bg-[#CCA866]/60 mt-2" aria-hidden="true"></span>}
          </div>
          <div className="pb-2">
            <h3 className="text-xl md:text-2xl mb-2">{it.title}</h3>
            <div className="text-black/80 leading-relaxed space-y-3">{it.body}</div>
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
        <div key={f.label} className="fcard !p-6">
          <dt className="kicker text-[#8A6309] !mb-1">{f.label}</dt>
          <dd className="text-lg font-bold leading-snug">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

// Every page ends with one clear call to action.
export function EndCta({ title, text, to, href, label }) {
  return (
    <section className="bg-[#FFC44F] text-black text-center py-20 md:py-28 px-6" aria-label="Next step">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="max-w-[800px] mx-auto"
      >
        <h2 className="text-3xl md:text-6xl leading-none">{title}</h2>
        {text && <p className="mt-5 text-lg md:text-xl font-medium text-black/90 leading-relaxed">{text}</p>}
        <div className="mt-9">
          <Btn to={to} href={href} variant="dark">{label}</Btn>
        </div>
      </motion.div>
    </section>
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
    <span data-todo={id} className="inline bg-[#FFF3C4] text-[#5c4306] border border-dashed border-[#8A6309] rounded px-1.5 py-0.5 text-[0.95em] font-semibold normal-case tracking-normal not-italic">
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
  return <div className={`space-y-5 text-lg leading-relaxed text-black/85 ${className}`}>{children}</div>;
}
