import React, { useState } from 'react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import GenericManager from './GenericManager';
import SettingsManager from './SettingsManager';
import ActivityLog from './ActivityLog';
import SitePhotosManager from './SitePhotosManager';
import ChecklistManager from './ChecklistManager';
import FormSubmissionsManager from './FormSubmissionsManager';
import { useAuth } from '../../auth';
import { LAYOUTS, TONES } from '../../lib/spotlights';
import { newestFirst } from '../../utils';

const { FiLayout, FiMic, FiCalendar, FiFileText, FiCamera, FiLogOut, FiMenu, FiX, FiMail, FiSettings, FiActivity, FiUsers, FiCheckSquare, FiHeart, FiMessageSquare } = FiIcons;

const NavItem = ({ icon, children, ...rest }) => (
  <button {...rest} className="w-full flex items-center gap-4 px-4 py-3 text-left text-white/80 hover:bg-[#eaa235] hover:text-[#1e2522] rounded-lg transition-colors">
    <SafeIcon icon={icon} className="text-xl" />
    <span className="font-semibold">{children}</span>
  </button>
);

const PUBLISH_FIELDS = [
  { name: 'published', label: 'Published', type: 'checkbox', defaultChecked: true, help: 'Visible on the website' },
  { name: 'publish_date', label: 'Publish On (optional)', type: 'date' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const opts = (list) => list.map(v => ({ value: v, label: v }));

const TAB_CONFIGS = {
  sermons: {
    table: 'sermons',
    youtubeImport: true,
    bulk: true,
    pageSize: 100,
    sortItems: newestFirst,
    title: 'Messages',
    titleField: 'title',
    columns: ['title', 'speaker', 'series', 'date'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'speaker', label: 'Speaker', type: 'text' },
      { name: 'series', label: 'Series', type: 'text' },
      { name: 'series_image_url', label: 'Series cover art (any message in the series)', type: 'image' },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'scripture', label: 'Main Scripture passage (for example John 3:16-21)', type: 'text' },
      { name: 'topic', label: 'Category', type: 'text' },
      { name: 'tags', label: 'Tags (separated by commas, for example Prayer, Family)', type: 'text' },
      { name: 'description', label: 'Sermon summary', type: 'markdown' },
      { name: 'discussion_questions', label: 'Discussion questions', type: 'markdown' },
      { name: 'notes', label: 'Notes, transcript, or written summary', type: 'markdown' },
      { name: 'notes_url', label: 'Downloadable notes link (optional)', type: 'url' },
      { name: 'video_url', label: 'YouTube URL', type: 'youtube' },
      { name: 'audio_url', label: 'Audio URL (optional)', type: 'url' },
      ...PUBLISH_FIELDS
    ]
  },
  events: {
    table: 'events_church',
    title: 'Events',
    titleField: 'title',
    columns: ['title', 'date', 'ministry'],
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
      { name: 'ministry', label: 'Ministry (for the calendar filter)', type: 'select', options: [{ value: '', label: 'None' }, ...opts(['Sunday', 'Kids', 'Youth', 'Table Groups', 'Outreach', 'Campaign'])] },
      { name: 'time', label: 'Time', type: 'text' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'desc_text', label: 'Description', type: 'markdown' },
      { name: 'image_url', label: 'Image (optional)', type: 'image' },
      { name: 'registration_url', label: 'Sign-up link (optional)', type: 'url' },
      { name: 'featured', label: 'Featured', type: 'checkbox', help: 'Show at the top of the Events page' },
      ...PUBLISH_FIELDS
    ]
  },
  staff: {
    table: 'staff_church',
    title: 'Staff and Leaders',
    titleField: 'name',
    thumbField: 'photo_url',
    sortField: 'sort_order_num',
    columns: ['name', 'role'],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'role', label: 'Role / Title', type: 'text' },
      { name: 'photo_url', label: 'Photo', type: 'image' },
      { name: 'bio', label: 'Short Bio', type: 'markdown' },
      { name: 'email', label: 'Email (optional)', type: 'email' },
      { name: 'sort_order_num', label: 'Sort Order', type: 'number' },
      { name: 'published', label: 'Published', type: 'checkbox', defaultChecked: true, help: 'Visible on the website' }
    ]
  },
  groups: {
    table: 'table_groups_church',
    title: 'Table Groups',
    titleField: 'name',
    columns: ['name', 'day', 'status'],
    fields: [
      { name: 'name', label: 'Group name', type: 'text', required: true },
      { name: 'day', label: 'Day', type: 'select', options: [{ value: '', label: 'Not set' }, ...opts(DAYS)] },
      { name: 'time_of_day', label: 'Time of day', type: 'select', options: [{ value: '', label: 'Not set' }, ...opts(['Morning', 'Afternoon', 'Evening'])] },
      { name: 'area', label: 'Area (for example Columbiana, Salem)', type: 'text' },
      { name: 'life_stage', label: 'Life stage (for example Young adults, Families)', type: 'text' },
      { name: 'status', label: 'Open or full', type: 'select', options: [{ value: 'open', label: 'Open' }, { value: 'full', label: 'Full' }] },
      { name: 'description', label: 'Short description', type: 'textarea' },
      { name: 'published', label: 'Published', type: 'checkbox', defaultChecked: true, help: 'Visible on the website' }
    ]
  },
  spotlights: {
    table: 'home_spotlights_church',
    title: 'Front Page Area',
    titleField: 'name',
    thumbField: 'image_url',
    sortField: 'sort_order_num',
    toggleField: 'published',
    duplicable: true,
    columns: ['name', 'layout'],
    fields: [
      { name: 'name', label: 'Layout name (only you see this, for example Easter service)', type: 'text', required: true },
      { name: 'published', label: 'On', type: 'checkbox', defaultChecked: false, help: 'Show this layout on the front page, below the hero' },
      { name: 'publish_date', label: 'Start showing on (optional)', type: 'date' },
      { name: 'end_date', label: 'Stop showing after (optional)', type: 'date' },
      { name: 'layout', label: 'Layout', type: 'select', options: LAYOUTS },
      { name: 'tone', label: 'Background color', type: 'select', options: TONES },
      { name: 'kicker', label: 'Small label above the title (optional)', type: 'text' },
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'body', label: 'Text', type: 'markdown' },
      { name: 'image_url', label: 'Photo (used by the photo layouts)', type: 'image' },
      { name: 'button_label', label: 'Button text (optional)', type: 'text' },
      { name: 'button_url', label: 'Button link (a full web address, or a page such as /plan-your-visit)', type: 'text' },
      { name: 'button2_label', label: 'Second button text (optional)', type: 'text' },
      { name: 'button2_url', label: 'Second button link', type: 'text' },
      { name: 'sort_order_num', label: 'Order on the page (lower shows first)', type: 'number' },
    ]
  },
  stories: {
    table: 'stories_church',
    title: 'Stories',
    titleField: 'name',
    thumbField: 'photo_url',
    columns: ['name', 'quote'],
    fields: [
      { name: 'name', label: 'First name and last initial', type: 'text', required: true },
      { name: 'quote', label: 'Short quote', type: 'textarea', required: true },
      { name: 'body', label: 'Full story (optional)', type: 'markdown' },
      { name: 'photo_url', label: 'Photo (written permission required)', type: 'image' },
      { name: 'published', label: 'Published', type: 'checkbox', defaultChecked: true, help: 'Visible on the website' }
    ]
  },
  pages: {
    table: 'custom_pages_church',
    title: 'Custom Pages',
    titleField: 'title_text',
    columns: ['title_text', 'slug_key', 'nav_label_text'],
    fields: [
      { name: 'title_text', label: 'Title', type: 'text', required: true },
      { name: 'slug_key', label: 'URL Slug (the page appears at /p/your-slug)', type: 'slug', slugFrom: 'title_text', required: true },
      { name: 'nav_label_text', label: 'Nav Label', type: 'text' },
      { name: 'body_content_text', label: 'Body Content', type: 'markdown' }
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
};

const ContentStudio = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('forms');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (activeTab) {
      case 'forms':
        return <FormSubmissionsManager />;
      case 'checklist':
        return <ChecklistManager />;
      case 'photos':
        return <SitePhotosManager />;
      case 'settings':
        return <SettingsManager />;
      case 'activity':
        return <ActivityLog />;
      default:
        return TAB_CONFIGS[activeTab] ? <GenericManager key={activeTab} config={TAB_CONFIGS[activeTab]} /> : null;
    }
  };

  const isAdmin = user?.role !== 'editor';
  const TABS = {
    'Inbox': [
      { key: 'forms', label: 'Form Submissions', icon: FiMail },
    ],
    'Site': [
      { key: 'checklist', label: 'Content to Confirm', icon: FiCheckSquare },
      { key: 'spotlights', label: 'Front Page Area', icon: FiLayout },
      { key: 'photos', label: 'Site Photos', icon: FiCamera },
      { key: 'pages', label: 'Custom Pages', icon: FiLayout },
    ],
    'Content': [
      { key: 'sermons', label: 'Messages', icon: FiMic },
      { key: 'staff', label: 'Staff & Leaders', icon: FiUsers },
      { key: 'posts', label: 'Blog Posts', icon: FiFileText },
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


  return (
    <div className="min-h-screen bg-[#1e2522]/5 text-[#1e2522] flex">
      {/* Sidebar */}
      <aside className={`w-72 bg-[#1e2522] text-white p-6 flex-col fixed lg:relative h-full z-50 lg:z-auto ${isSidebarOpen ? 'flex' : 'hidden'}`}>
        <div className="flex items-center justify-between mb-10">
            <h1 className="text-2xl font-bold text-white tracking-wider">Content <span className="text-[#eaa235]">Studio</span></h1>
            <button aria-label="Close menu" onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-2xl text-white/70 hover:text-white">
                <SafeIcon icon={FiX} />
            </button>
        </div>

        <nav aria-label="Content Studio" className="flex-grow space-y-4">
          {Object.entries(TABS).map(([category, items]) => (
            <div key={category}>
              <h2 className="px-4 text-sm font-bold text-white/60 tracking-wide mb-2">{category}</h2>
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col">
        <header className="flex items-center justify-between mb-8 w-full">
           <button aria-label="Open menu" aria-expanded={isSidebarOpen} onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-2xl p-2 -ml-2">
                <SafeIcon icon={FiMenu} />
            </button>
          <h1 className="text-3xl font-bold">{getTabLabel()}</h1>
        </header>
        
        <div className="flex-1 overflow-y-auto">
              <div key={activeTab}>
                {renderContent()}
              </div>
        </div>
      </main>
    </div>
  );
};

export default ContentStudio;