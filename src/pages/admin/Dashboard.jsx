import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import HeroManager from './HeroManager';
import GenericManager from './GenericManager';

const { FiTv, FiLayout, FiMic, FiCalendar, FiFileText, FiCamera, FiSettings, FiLogOut, FiMenu, FiX } = FiIcons;

const NavItem = ({ icon, children, ...rest }) => (
  <button {...rest} className="w-full flex items-center gap-4 px-4 py-3 text-left text-gray-300 hover:bg-[#CCA866] hover:text-black rounded-lg transition-colors duration-200">
    <SafeIcon icon={icon} className="text-xl" />
    <span className="font-semibold">{children}</span>
  </button>
);

const TAB_CONFIGS = {
  photosections: {
    table: 'photo_sections_church',
    title: 'Photo Sections',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text' },
      { name: 'subtext', label: 'Subtext', type: 'text' },
      { name: 'image_url', label: 'Image URL', type: 'text' },
      { name: 'button_text', label: 'Button Text', type: 'text' },
      { name: 'button_page_slug', label: 'Button Link Slug', type: 'text' },
      { name: 'sort_order_num', label: 'Sort Order', type: 'number' }
    ]
  },
  pages: {
    table: 'custom_pages_church',
    title: 'Custom Pages',
    fields: [
      { name: 'title_text', label: 'Title', type: 'text' },
      { name: 'slug_key', label: 'URL Slug', type: 'text' },
      { name: 'nav_label_text', label: 'Nav Label', type: 'text' },
      { name: 'body_content_text', label: 'Body Content (HTML)', type: 'textarea' }
    ]
  },
  sermons: {
    table: 'sermons',
    title: 'Sermons',
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'speaker', label: 'Speaker', type: 'text' },
      { name: 'series', label: 'Series', type: 'text' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'yt', label: 'YouTube URL', type: 'text' },
      { name: 'yt_id', label: 'YouTube ID', type: 'text' }
    ]
  },
  events: {
    table: 'events_church',
    title: 'Events',
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'time', label: 'Time', type: 'text' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'desc_text', label: 'Description', type: 'textarea' }
    ]
  },
  posts: {
    table: 'posts',
    title: 'Blog Posts',
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'author', label: 'Author', type: 'text' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'image_url', label: 'Image URL', type: 'text' },
      { name: 'body', label: 'Body Content (HTML)', type: 'textarea' }
    ]
  }
};

const ContentStudio = () => {
  const [activeTab, setActiveTab] = useState('hero');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (activeTab) {
      case 'hero':
        return <HeroManager />;
      case 'photosections':
      case 'pages':
      case 'sermons':
      case 'events':
      case 'posts':
        return <GenericManager key={activeTab} config={TAB_CONFIGS[activeTab]} />;
      default:
        return <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center h-64 text-gray-500">Settings module coming soon.</div>;
    }
  };

  const TABS = {
    'Site': [
      { key: 'hero', label: 'Hero Section', icon: FiTv },
      { key: 'photosections', label: 'Photo Sections', icon: FiCamera },
      { key: 'pages', label: 'Custom Pages', icon: FiLayout },
    ],
    'Content': [
      { key: 'sermons', label: 'Sermons', icon: FiMic },
      { key: 'events', label: 'Events', icon: FiCalendar },
      { key: 'posts', label: 'Blog Posts', icon: FiFileText },
    ],
    'Admin': [
      { key: 'settings', label: 'Settings', icon: FiSettings },
    ]
  };

  const getTabLabel = () => {
      for (const category in TABS) {
          const tab = TABS[category].find(t => t.key === activeTab);
          if (tab) return tab.label;
      }
      return 'Dashboard';
  }

  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex">
      {/* Sidebar */}
      <motion.aside 
        variants={sidebarVariants}
        initial="open"
        animate={isSidebarOpen ? "open" : "closed"}
        className={`w-72 bg-[#0B1613] text-white p-6 flex-col fixed lg:relative h-full z-50 lg:z-auto ${isSidebarOpen ? 'flex' : 'hidden'}`}
      >
        <div className="flex items-center justify-between mb-10">
            <h1 className="text-2xl font-bold text-white tracking-wider">Content <span className="text-[#CCA866]">Studio</span></h1>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-2xl text-gray-400 hover:text-white">
                <SafeIcon icon={FiX} />
            </button>
        </div>

        <nav className="flex-grow space-y-4">
          {Object.entries(TABS).map(([category, items]) => (
            <div key={category}>
              <h2 className="px-4 text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">{category}</h2>
              {items.map(tab => (
                 <NavItem key={tab.key} icon={tab.icon} onClick={() => { setActiveTab(tab.key); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}>
                    {tab.label}
                </NavItem>
              ))}
            </div>
          ))}
        </nav>
        
        <div className="mt-auto pt-6 border-t border-white/10">
             <NavItem icon={FiLogOut} onClick={() => { localStorage.removeItem('urf_admin_auth'); window.location.reload(); }}>
                Log Out
            </NavItem>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col">
        <header className="flex items-center justify-between mb-8 w-full">
           <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-2xl p-2 -ml-2">
                <SafeIcon icon={FiMenu} />
            </button>
          <h1 className="text-3xl font-bold">{getTabLabel()}</h1>
        </header>
        
        <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default ContentStudio;