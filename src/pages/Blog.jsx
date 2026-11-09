import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import { formatDate, isLive } from '../utils';
import { plainText } from '../lib/markdown';
import useFetch from '../hooks/useFetch';
import { ErrorState } from '../components/StateViews';
import { PageHeader } from '../components/ui';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSearch, FiArrowRight, FiUser, FiCalendar, FiClock, FiTag } = FiIcons;

export default function Blog() {
  usePageMeta('Blog', 'Articles, devotions and updates from Upper Room Fellowship family.');
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
    <div className="bg-[#ffffff] min-h-screen text-[#1e2522] pb-24 pt-20">
      <PageHeader kicker="Articles and updates" title="Church blog" intro="Insights, devotions, and updates from the Upper Room family." />

      <div className="max-w-[1312px] mx-auto px-9 md:px-14 mt-16">
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading ? (
          <div className="text-center py-32 opacity-50 flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-[#eaa235] border-t-transparent rounded-full animate-spin mb-4"></div>
            Loading articles...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-32 rounded-3xl mt-10 neu">
            <div className="text-5xl mb-4">📝</div>
            <h2 className="text-2xl font-bold opacity-50">No articles found.</h2>
          </div>
        ) : (
          <>
            <div className="mb-16 max-w-3xl mx-auto">
              <div className="relative mb-8 group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none group-focus-within:text-[#1e2522] transition-colors">
                  <SafeIcon icon={FiSearch} className="text-black text-xl" />
                </div>
                <input
                  type="text"
                  placeholder="Search articles by title, author, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-16 pr-6 py-5 rounded-full neu-field focus:outline-none focus:ring-2 focus:ring-[#eaa235] focus:border-transparent text-lg"
                />
              </div>

              {categories.length > 1 && (
                <div className="flex flex-wrap gap-3 justify-center">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-normal flex items-center gap-2 ${selectedCategory === cat ? 'bg-[#1e2522] text-white' : 'neu text-black'}`}
                    >
                      {cat !== 'All' && <SafeIcon icon={FiTag} className={selectedCategory === cat ? 'text-white' : 'text-[#1e2522]'} />}
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {filteredPosts.length === 0 ? (
              <div className="text-center py-24 rounded-3xl neu">
                <div className="text-6xl mb-6">🔍</div>
                <h3 className="text-3xl font-bold mb-3">No articles found</h3>
                <p className="text-[0.95rem] mb-8">We couldn't find any posts matching your criteria.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                  className="btn btn-solid"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {featuredPost && (
                  <div className="mb-20">
                    <span className="kicker text-[#1e2522] mb-4 inline-block">{searchQuery || selectedCategory !== 'All' ? 'Top Result' : 'Latest Article'}</span>
                    <Link to={`/blog/${featuredPost.id}`} className="block elev-hover rounded-3xl overflow-hidden flex flex-col md:flex-row group neu">
                      <div className="md:w-1/2 aspect-square md:aspect-auto bg-[#1e2522] relative overflow-hidden flex-shrink-0">
                        {featuredPost.image_url ? (
                          <img 
                            loading="lazy"
                            src={featuredPost.image_url} 
                            alt={featuredPost.title} 
                            className="w-full h-full object-cover transition-transform" 
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#ffffff] p-8 text-center bg-gradient-to-br from-[#1e2522] to-[#1e2522]">
                            <span className="text-5xl font-serif italic mb-2 opacity-50">Upper Room</span>
                            <span className="text-sm tracking-wide opacity-30">Journal</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-8 md:p-14 flex flex-col justify-center md:w-1/2 relative">
                        <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-[#1e2522] tracking-wide mb-6">
                          {featuredPost.category && (
                            <span className="bg-[#eaa235]/10 text-[#1e2522] px-4 py-1.5 rounded-full">{featuredPost.category}</span>
                          )}
                          <span className="flex items-center gap-1.5 text-black"><SafeIcon icon={FiCalendar} /> {featuredPost.date ? formatDate(featuredPost.date) : formatDate(featuredPost.created_at)}</span>
                          <span className="flex items-center gap-1.5 text-black"><SafeIcon icon={FiClock} /> {getReadTime(featuredPost.body)}</span>
                        </div>
                        
                        <h2 className="text-4xl lg:text-5xl font-bold mb-6 group-hover:text-[#1e2522] transition-colors leading-tight">{featuredPost.title}</h2>
                        
                        <p className="mb-10 line-clamp-4 text-[0.95rem] leading-relaxed">
                          {plainText(featuredPost.body) || 'Read this article to learn more...'}
                        </p>
                        
                        <div className="mt-auto flex items-center justify-between border-t border-[#1e2522]/5 pt-8">
                          {featuredPost.author ? (
                            <div className="flex items-center gap-3 text-sm font-bold text-black">
                              <div className="w-8 h-8 rounded-full bg-[#1e2522]/5 flex items-center justify-center text-black">
                                <SafeIcon icon={FiUser} />
                              </div>
                              {featuredPost.author}
                            </div>
                          ) : <div />}
                          <div className="flex items-center text-sm font-bold tracking-wide text-[#1e2522] group-hover:text-[#1e2522] transition-colors">
                            Read Article <SafeIcon icon={FiArrowRight} className="ml-2 transform transition-transform" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                )}

                {standardPosts.length > 0 && (
                  <div>
                    <h3 className="text-3xl font-bold mb-10 border-b border-[#1e2522]/10 pb-4">
                      {searchQuery || selectedCategory !== 'All' ? 'More Results' : 'More Articles'}
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {standardPosts.map(post => (
                        <div key={post.id}>
                          <Link 
                            to={`/blog/${post.id}`}
                            className="flex flex-col h-full rounded-2xl overflow-hidden elev-hover group neu"
                          >
                            <div className="aspect-[16/10] bg-[#1e2522] relative overflow-hidden">
                              {post.image_url ? (
                                <img 
                                  loading="lazy"
                                  src={post.image_url} 
                                  alt={post.title} 
                                  className="w-full h-full object-cover transition-transform" 
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-white/50 bg-gradient-to-br from-[#1e2522] to-[#1e2522]">
                                  <span className="text-3xl font-serif italic">Upper Room</span>
                                </div>
                              )}
                              {post.category && (
                                <div className="absolute top-4 left-4 bg-white text-[#1e2522] text-[0.75rem] font-bold tracking-wide px-3 py-1.5 rounded-full">
                                  {post.category}
                                </div>
                              )}
                            </div>
                            
                            <div className="p-8 flex flex-col flex-grow">
                              <div className="flex flex-wrap gap-3 text-[0.75rem] font-bold text-[#1e2522] tracking-wide mb-4">
                                <span className="flex items-center gap-1 bg-[#eaa235]/10 px-2.5 py-1 rounded text-black"><SafeIcon icon={FiClock} /> {getReadTime(post.body)}</span>
                                <span className="flex items-center gap-1"><SafeIcon icon={FiCalendar} /> {post.date ? formatDate(post.date) : formatDate(post.created_at)}</span>
                              </div>
                              
                              <h3 className="text-2xl font-bold mb-4 group-hover:text-[#1e2522] transition-colors leading-tight">
                                {post.title}
                              </h3>
                              
                              <p className="mb-8 line-clamp-3 text-sm leading-relaxed flex-grow">
                                {plainText(post.body) || 'Read this article to learn more...'}
                              </p>
                              
                              <div className="mt-auto pt-5 border-t border-[#1e2522]/5 flex items-center justify-between">
                                {post.author ? (
                                  <div className="text-xs font-bold text-black truncate max-w-[120px] flex items-center gap-1.5">
                                    <SafeIcon icon={FiUser} /> {post.author}
                                  </div>
                                ) : <div />}
                                <div className="flex items-center text-sm font-bold tracking-wide text-[#1e2522] group-hover:text-[#1e2522] transition-colors">
                                  Read <SafeIcon icon={FiArrowRight} className="ml-1.5 transform transition-transform" />
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}