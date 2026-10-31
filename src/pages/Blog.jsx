import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import usePageMeta from '../hooks/usePageMeta';
import { formatDate, isLive } from '../utils';
import { plainText } from '../lib/markdown';
import useFetch from '../hooks/useFetch';
import { ErrorState } from '../components/StateViews';
import { PageHeader } from '../components/ui';
import SafeIcon from '../common/SafeIcon';
import { slideInLeft, slideInRight, fadeUp } from '../lib/motion';
import * as FiIcons from 'react-icons/fi';

const { FiSearch, FiArrowRight, FiUser, FiCalendar, FiClock, FiTag } = FiIcons;

export default function Blog() {
  usePageMeta('Blog', 'Articles, devotions and updates from the Upper Room Fellowship family.');
  const { data, loading, error, reload } = useFetch('read/posts?sort=created_at:desc');
  const posts = useMemo(() => (data ?? []).filter(isLive), [data]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const getReadTime = (text) => {
    if (!text) return '1 min read';
    const words = plainText(text).split(/\s+/).length;
    const mins = Math.max(1, Math.ceil(words / 200));
    return `${mins} min read`;
  };

  const categories = ['All', ...new Set(posts.map(p => p.category).filter(Boolean))];

  const filteredPosts = posts.filter(post => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      (post?.title?.toLowerCase().includes(query)) ||
      (post?.author?.toLowerCase().includes(query)) ||
      (post?.body?.toLowerCase().includes(query));
      
    const matchesCategory = selectedCategory === 'All' || post?.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const standardPosts = filteredPosts.length > 1 ? filteredPosts.slice(1) : [];

  return (
    <div className="bg-[#F7F5EE] min-h-screen text-black pb-24 pt-20">
      <PageHeader kicker="Articles and updates" title="Church blog" intro="Insights, devotions, and updates from the Upper Room family." />

      <div className="max-w-[1145px] mx-auto px-6 mt-16">
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading ? (
          <div className="text-center py-32 opacity-50 flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-[#A6790F] border-t-transparent rounded-full animate-spin mb-4"></div>
            Loading articles...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-3xl border border-black/5 mt-10">
            <div className="text-5xl mb-4">📝</div>
            <h2 className="text-2xl font-bold opacity-50">No articles found.</h2>
          </div>
        ) : (
          <>
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-16 max-w-3xl mx-auto">
              <div className="relative mb-8 group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none group-focus-within:text-[#8A6309] transition-colors">
                  <SafeIcon icon={FiSearch} className="text-gray-400 text-xl" />
                </div>
                <input
                  type="text"
                  placeholder="Search articles by title, author, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-16 pr-6 py-5 border border-black/10 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A6790F] focus:border-transparent text-lg transition-all"
                />
              </div>

              {categories.length > 1 && (
                <div className="flex flex-wrap gap-3 justify-center">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${selectedCategory === cat ? 'bg-[#1E2522] text-white shadow-md scale-105' : 'bg-white hover:border-black/30 hover:bg-gray-50 text-gray-600 border border-black/10'}`}
                    >
                      {cat !== 'All' && <SafeIcon icon={FiTag} className={selectedCategory === cat ? 'text-white' : 'text-[#8A6309]'} />}
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {filteredPosts.length === 0 ? (
              <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center py-24 bg-white rounded-3xl border border-black/5 shadow-sm">
                <div className="text-6xl mb-6">🔍</div>
                <h3 className="text-3xl font-bold mb-3">No articles found</h3>
                <p className="opacity-60 text-lg mb-8">We couldn't find any posts matching your criteria.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                  className="btn btn-solid"
                >
                  Clear Filters
                </button>
              </motion.div>
            ) : (
              <>
                {featuredPost && (
                  <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{
                    visible: { transition: { staggerChildren: 0.1 } }
                  }} className="mb-20">
                    <motion.span variants={slideInLeft} className="kicker text-[#8A6309] mb-4 inline-block">{searchQuery || selectedCategory !== 'All' ? 'Top Result' : 'Latest Article'}</motion.span>
                    <Link to={`/blog/${featuredPost.id}`} className="block bg-white border border-black/5 hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden flex flex-col md:flex-row group translate-y-0 hover:-translate-y-2">
                      <div className="md:w-1/2 aspect-square md:aspect-auto bg-[#1E2522] relative overflow-hidden flex-shrink-0">
                        {featuredPost.image_url ? (
                          <img 
                            loading="lazy"
                            src={featuredPost.image_url} 
                            alt={featuredPost.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#F7F5EE] p-8 text-center bg-gradient-to-br from-[#1E2522] to-[#1A2E28]">
                            <span className="text-5xl font-serif mb-2 opacity-50">Upper Room</span>
                            <span className="text-sm tracking-widest uppercase opacity-30">Journal</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-8 md:p-14 flex flex-col justify-center md:w-1/2 relative">
                        <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4 text-xs font-bold text-[#8A6309] uppercase tracking-wider mb-6">
                          {featuredPost.category && (
                            <span className="bg-[#A6790F]/10 text-[#8A6309] px-4 py-1.5 rounded-full">{featuredPost.category}</span>
                          )}
                          <span className="flex items-center gap-1.5 text-gray-500"><SafeIcon icon={FiCalendar} /> {featuredPost.date ? formatDate(featuredPost.date) : formatDate(featuredPost.created_at)}</span>
                          <span className="flex items-center gap-1.5 text-gray-500"><SafeIcon icon={FiClock} /> {getReadTime(featuredPost.body)}</span>
                        </motion.div>
                        
                        <motion.h2 variants={slideInRight} className="text-4xl lg:text-5xl font-bold mb-6 group-hover:text-[#8A6309] transition-colors leading-tight">{featuredPost.title}</motion.h2>
                        
                        <motion.p variants={fadeUp} className="opacity-70 mb-10 line-clamp-4 text-lg leading-relaxed">
                          {plainText(featuredPost.body) || 'Read this article to learn more...'}
                        </motion.p>
                        
                        <div className="mt-auto flex items-center justify-between border-t border-black/5 pt-8">
                          {featuredPost.author ? (
                            <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                <SafeIcon icon={FiUser} />
                              </div>
                              {featuredPost.author}
                            </div>
                          ) : <div />}
                          <div className="flex items-center text-sm font-bold uppercase tracking-wider text-[#8A6309] group-hover:text-black transition-colors">
                            Read Article <SafeIcon icon={FiArrowRight} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )}

                {standardPosts.length > 0 && (
                  <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                  }}>
                    <motion.h3 variants={slideInLeft} className="text-3xl font-bold mb-10 border-b border-black/10 pb-4">
                      {searchQuery || selectedCategory !== 'All' ? 'More Results' : 'More Articles'}
                    </motion.h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {standardPosts.map(post => (
                        <motion.div key={post.id} variants={fadeUp}>
                          <Link 
                            to={`/blog/${post.id}`}
                            className="bg-white border border-black/5 flex flex-col h-full rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-400 group"
                          >
                            <div className="aspect-[16/10] bg-[#1E2522] relative overflow-hidden">
                              {post.image_url ? (
                                <img 
                                  loading="lazy"
                                  src={post.image_url} 
                                  alt={post.title} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-white/50 bg-gradient-to-br from-[#1E2522] to-[#1A2E28]">
                                  <span className="text-3xl font-serif">Upper Room</span>
                                </div>
                              )}
                              {post.category && (
                                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur text-black text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm">
                                  {post.category}
                                </div>
                              )}
                            </div>
                            
                            <div className="p-8 flex flex-col flex-grow">
                              <div className="flex flex-wrap gap-3 text-[10px] font-bold text-[#8A6309] uppercase tracking-wider mb-4">
                                <span className="flex items-center gap-1 bg-[#A6790F]/10 px-2.5 py-1 rounded text-black/70"><SafeIcon icon={FiClock} /> {getReadTime(post.body)}</span>
                                <span className="flex items-center gap-1"><SafeIcon icon={FiCalendar} /> {post.date ? formatDate(post.date) : formatDate(post.created_at)}</span>
                              </div>
                              
                              <h3 className="text-2xl font-bold mb-4 group-hover:text-[#8A6309] transition-colors leading-tight">
                                {post.title}
                              </h3>
                              
                              <p className="opacity-70 mb-8 line-clamp-3 text-sm leading-relaxed flex-grow">
                                {plainText(post.body) || 'Read this article to learn more...'}
                              </p>
                              
                              <div className="mt-auto pt-5 border-t border-black/5 flex items-center justify-between">
                                {post.author ? (
                                  <div className="text-xs font-bold text-gray-500 truncate max-w-[120px] flex items-center gap-1.5">
                                    <SafeIcon icon={FiUser} /> {post.author}
                                  </div>
                                ) : <div />}
                                <div className="flex items-center text-xs font-bold uppercase tracking-wider text-[#8A6309] group-hover:text-black transition-colors">
                                  Read <SafeIcon icon={FiArrowRight} className="ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}