import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import useFetch from '../hooks/useFetch';
import usePageMeta from '../hooks/usePageMeta';
import { isLive, safeUrl } from '../utils';
import PageHero from '../components/PageHero';
import RichText from '../components/RichText';
import { Spinner, ErrorState } from '../components/StateViews';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMail } = FiIcons;

const initials = (name) => (name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');

export default function Team() {
  usePageMeta('Our Team', 'Meet the pastors, staff, and leaders of Upper Room Fellowship.');
  const { data, loading, error, reload } = useFetch('read/staff_church?sort=sort_order_num');
  const people = useMemo(() => (data ?? []).filter(isLive), [data]);

  return (
    <div className="bg-cream min-h-screen text-black pb-24 pt-20">
      <PageHero kicker="Meet The Team" title="Staff & Leaders" subtitle="The people who love and serve this church." image="https://images.pexels.com/photos/3184393/pexels-photo-3184393.jpeg?auto=compress&cs=tinysrgb&h=1200" />

      <div className="max-w-[1145px] mx-auto px-6 mt-16">
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading ? (
          <Spinner />
        ) : people.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-black/5">
            <h2 className="text-3xl mb-3">Our team page is coming soon</h2>
            <p className="opacity-60 text-lg">In the meantime, you can reach us on the contact page.</p>
          </div>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {people.map((p, i) => (
              <motion.li
                key={p.id}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.1 }}
                className="bg-white border border-black/5 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="aspect-[4/5] bg-gradient-to-br from-ink to-ink-800 relative overflow-hidden">
                  {safeUrl(p.photo_url) ? (
                    <img src={safeUrl(p.photo_url)} alt={`${p.name}${p.role ? `, ${p.role}` : ''}`} loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-6xl font-black text-gold/60" aria-hidden="true">{initials(p.name)}</div>
                  )}
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <h2 className="text-2xl mb-1">{p.name}</h2>
                  {p.role && <p className="text-sm font-bold uppercase tracking-wider text-gold-600 mb-4">{p.role}</p>}
                  {p.bio && <RichText value={p.bio} className="text-base opacity-80 mb-6" />}
                  {p.email && (
                    <a href={`mailto:${p.email}`} className="mt-auto inline-flex items-center gap-2 font-bold text-sm text-gold-600 hover:text-black">
                      <SafeIcon icon={FiMail} /> {p.email}
                    </a>
                  )}
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
