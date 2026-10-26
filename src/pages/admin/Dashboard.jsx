import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import HeroManager from './HeroManager';
import GenericManager from './GenericManager';
import SettingsManager from './SettingsManager';
import SectionOrderManager from './SectionOrderManager';
import ActivityLog from './ActivityLog';
import { useAuth } from '../../auth';

const { FiTv, FiLayout, FiMic, FiCalendar, FiFileText, FiCamera, FiImage, FiLogOut, FiMenu, FiX, FiHeadphones, FiMail, FiSettings, FiList, FiActivity } = FiIcons;

const NavItem = ({ icon, children, ...rest }) => (
  <button {...rest} className="w-full flex items-center gap-4 px-4 py-3 text-left text-gray-300 hover:bg-[#CCA866] hover:text-black rounded-lg transition-colors duration-200">
    <SafeIcon icon={icon} className="text-xl" />
    <span className="font-semibold">{children}</span>
  </button>
);

const PUBLISH_FIELDS = [
  { name: 'published', label: 'Published', type: 'checkbox', defaultChecked: true, help: 'Visible on the website' },
  { name: 'publish_date', label: 'Publish On (optional)', type: 'date' },
];

const TAB_CONFIGS = {
  photosections: {
    table: 'photo_sections_church',
    title: 'Photo Sections',
    titleField: 'heading',
    thumbField: 'image_url',
    sortField: 'sort_order_num',
    columns: ['heading', 'subtext'],
    fields: [
      { name: 'heading', label: 'Heading', type: 'text', required: true },
      { name: 'subtext', label: 'Subtext', type: 'text' },
      { name: 'image_url', label: 'Image', type: 'image', required: true },
      { name: 'button_text', label: 'Button Text', type: 'text' },
      { name: 'button_page_slug', label: 'Button Link Slug', type: 'text' },
      { name: 'sort_order_num', label: 'Sort Order', type: 'number' }
    ]
  },
  gallery: {
    table: 'gallery_church',
    title: 'Gallery Photos',
    titleField: 'caption',
    thumbField: 'image_url',
    sortField: 'sort_order_num',
    columns: ['caption'],
    fields: [
      { name: 'image_url', label: 'Image', type: 'image', required: true },
      { name: 'caption', label: 'Caption / Alt Text', type: 'text', required: true },
      { name: 'sort_order_num', label: 'Sort Order', type: 'number' }
    ]
  },
  pages: {
    table: 'custom_pages_church',
    title: 'Custom Pages',
    titleField: 'title_text',
    columns: ['title_text', 'slug_key', 'nav_label_text'],
    fields: [
      { name: 'title_text', label: 'Title', type: 'text', required: true },
      { name: 'slug_key', label: 'URL Slug', type: 'slug', slugFrom: 'title_text', required: true },
      { name: 'nav_label_text', label: 'Nav Label', type: 'text' },
      { name: 'body_content_text', label: 'Body Content', type: 'markdown' }
    ]
  },
  sermons: {
    table: 'sermons',
    title: 'Sermons',
    titleField: 'title',
    columns: ['title', 'speaker', 'date'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'speaker', label: 'Speaker', type: 'text' },
      { name: 'series', label: 'Series', type: 'text' },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'description', label: 'Description', type: 'markdown' },
      { name: 'notes', label: 'Sermon Notes / Transcript', type: 'markdown' },
      { name: 'video_url', label: 'YouTube URL', type: 'youtube' },
      { name: 'audio_url', label: 'Audio URL (optional)', type: 'url' },
      ...PUBLISH_FIELDS
    ]
  },
  events: {
    table: 'events_church',
    title: 'Events',
    titleField: 'title',
    columns: ['title', 'date', 'recurrence'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'date', label: 'Date (first occurrence)', type: 'date', required: true },
      {
        name: 'recurrence', label: 'Repeats', type: 'select',
        options: [
          { value: 'none', label: 'Does not repeat' },
          { value: 'weekly', label: 'Every week' },
          { value: 'biweekly', label: 'Every 2 weeks' },
          { value: 'monthly', label: 'Every month' },
        ]
      },
      { name: 'time', label: 'Time', type: 'text' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'desc_text', label: 'Description', type: 'markdown' },
      { name: 'registration_url', label: 'Registration Link (optional)', type: 'url' },
      ...PUBLISH_FIELDS
    ]
  },
  posts: {
    table: 'posts',
    title: 'Blog Posts',
    titleField: 'title',
    thumbField: 'image_url',
    columns: ['title', 'author', 'date'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'author', label: 'Author', type: 'text' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'image_url', label: 'Cover Image', type: 'image' },
      { name: 'body', label: 'Body Content', type: 'markdown', required: true },
      ...PUBLISH_FIELDS
    ]
  },
  episodes: {
    table: 'episodes',
    title: 'Podcast Episodes',
    titleField: 'title',
    columns: ['title', 'date'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'audio', label: 'Audio URL', type: 'url', required: true },
      { name: 'feed', label: 'Feed / Show Link (optional)', type: 'url' }
    ]
  },
  messages: {
    table: 'contact_messages_church',
    title: 'Messages',
    titleField: 'name',
    canCreate: false,
    columns: ['name', 'kind', 'email'],
    fields: [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'kind', label: 'Type', type: 'text' },
      { name: 'message', label: 'Message', type: 'textarea' },
      { name: 'handled', label: 'Handled', type: 'checkbox', help: 'Someone has followed up' }
    ]
  }
};

const ContentStudio = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('hero');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (activeTab) {
      case 'hero':
        return <HeroManager />;
      case 'layout':
        return <SectionOrderManager />;
      case 'settings':
        return <SettingsManager />;
      case 'activity':
        return <ActivityLog />;
      case 'photosections':
      case 'gallery':
      case 'pages':
      case 'sermons':
      case 'events':
      case 'posts':
      case 'episodes':
      case 'messages':
        return <GenericManager key={activeTab} config={TAB_CONFIGS[activeTab]} />;
      default:
        return null;
    }
  };

  const isAdmin = user?.role !== 'editor';
  const TABS = {
    'Site': [
      { key: 'hero', label: 'Hero Section', icon: FiTv },
      { key: 'layout', label: 'Home Layout', icon: FiList },
      { key: 'photosections', label: 'Photo Sections', icon: FiCamera },
      { key: 'gallery', label: 'Gallery', icon: FiImage },
      { key: 'pages', label: 'Custom Pages', icon: FiLayout },
    ],
    'Content': [
      { key: 'sermons', label: 'Sermons', icon: FiMic },
      { key: 'episodes', label: 'Podcasts', icon: FiHeadphones },
      { key: 'events', label: 'Events', icon: FiCalendar },
      { key: 'posts', label: 'Blog Posts', icon: FiFileText },
      { key: 'messages', label: 'Messages', icon: FiMail },
    ],
    ...(isAdmin ? {
      'Admin': [
        { key: 'settings', label: 'Settings', icon: FiSettings },
        { key: 'activity', label: 'Activity Log', icon: FiActivity },
      ]
    } : {})
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
            <button aria-label="Close menu" onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-2xl text-gray-400 hover:text-white">
                <SafeIcon icon={FiX} />
            </button>
        </div>

        <nav aria-label="Content Studio" className="flex-grow space-y-4">
          {Object.entries(TABS).map(([category, items]) => (
            <div key={category}>
              <h2 className="px-4 text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">{category}</h2>
              {items.map(tab => (
                 <NavItem key={tab.key} icon={tab.icon} aria-current={activeTab === tab.key ? 'page' : undefined} onClick={() => { setActiveTab(tab.key); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}>
                    {tab.label}
                </NavItem>
              ))}
            </div>
          ))}
        </nav>
        
        <div className="mt-auto pt-6 border-t border-white/10">
             <NavItem icon={FiLogOut} onClick={logout}>
                Log Out
            </NavItem>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col">
        <header className="flex items-center justify-between mb-8 w-full">
           <button aria-label="Open menu" aria-expanded={isSidebarOpen} onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-2xl p-2 -ml-2">
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