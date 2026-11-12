import React, { useState } from 'react';
import SafeIcon from '../../common/SafeIcon';
import { FiLayout, FiMic, FiCalendar, FiFileText, FiCamera, FiLogOut, FiMenu, FiX, FiMail, FiSettings, FiActivity, FiUsers, FiHeart, FiMessageSquare, FiExternalLink } from 'react-icons/fi';
import GenericManager from './GenericManager';
import SettingsManager from './SettingsManager';
import ActivityLog from './ActivityLog';
import SitePhotosManager from './SitePhotosManager';
import WelcomeList from './WelcomeList';
import FormSubmissionsManager from './FormSubmissionsManager';
import { useAuth } from '../../auth';
import useNoIndex from '../../hooks/useNoIndex';
import { LAYOUTS, TONES } from '../../lib/spotlights';
import { newestFirst } from '../../utils';
import { STANDARD_CATEGORIES } from '../../content/categories';
import { DEFAULT_LEADERS } from '../../content/leaders';


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
    transcript: true,
    bulk: true,
    categorySelect: true,
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
      { name: 'topic', label: 'Categories (choose all that fit)', type: 'text' },
      { name: 'description', label: 'Sermon summary', type: 'markdown' },
      { name: 'discussion_questions', label: 'Discussion questions', type: 'markdown' },
      { name: 'notes', label: 'Notes shown on the message page (transcripts do not go here. Use the private Transcript box below)', type: 'markdown' },
      { name: 'notes_url', label: 'Downloadable notes link (optional)', type: 'url' },
      { name: 'video_url', label: 'YouTube URL', type: 'youtube' },
      { name: 'audio_url', label: 'Audio URL (optional)', type: 'url' },
      ...PUBLISH_FIELDS
    ]
  },
  staff: {
    table: 'staff_church',
    seedItems: DEFAULT_LEADERS.map((p, i) => ({ name: p.name, role: p.role, email: p.email, sort_order_num: i + 1, published: 1 })),
    seedLabel: (n) => `Add the ${n} leaders shown on the site, then add their photos`,
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
  podcastShows: {
    table: 'podcast_shows_church',
    title: 'Podcast Shows',
    titleField: 'name',
    thumbField: 'image_url',
    refreshFeed: true,
    columns: ['name', 'slug'],
    fields: [
      { name: 'name', label: 'Show name', type: 'text', required: true },
      { name: 'slug', label: 'Short name used by the site (leave as shine for the Shine podcast)', type: 'text', required: true },
      { name: 'feed_url', label: 'RSS feed address (from your podcast host). New episodes are added every hour.', type: 'url' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'image_url', label: 'Cover art', type: 'image' },
      { name: 'apple_url', label: 'Apple Podcasts link', type: 'url' },
      { name: 'spotify_url', label: 'Spotify link', type: 'url' },
      { name: 'youtube_url', label: 'YouTube link', type: 'url' },
    ]
  },
  podcastEpisodes: {
    table: 'podcast_episodes_church',
    title: 'Podcast Episodes',
    titleField: 'title',
    pageSize: 100,
    sortItems: (items) => [...items].sort((a, b) => String(b.published_at || '').localeCompare(String(a.published_at || ''))),
    columns: ['title', 'published_at'],
    fields: [
      { name: 'title', label: 'Episode title', type: 'text', required: true },
      { name: 'show_slug', label: 'Show (shine for the Shine podcast)', type: 'text', required: true },
      { name: 'published_at', label: 'Date', type: 'date' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'audio_url', label: 'Audio file link (an mp3 address)', type: 'url' },
      { name: 'duration', label: 'Length (for example 32:10)', type: 'text' },
      { name: 'page_url', label: 'Episode page link (optional)', type: 'url' },
      { name: 'published', label: 'Published', type: 'checkbox', defaultChecked: true, help: 'Visible on the website' },
    ]
  },
  events: {
    table: 'urf_events_church',
    title: 'Events',
    titleField: 'title',
    canCreate: false,
    syncNow: { rpc: 'sync_events_now', label: 'Update from urf.life', note: 'Events come from urf.life and are copied here every hour. To change an event, change it on urf.life. Use Hide to keep one off this website.' },
    pageSize: 100,
    sortItems: (items) => [...items].sort((a, b) => String(a.event_date || '').localeCompare(String(b.event_date || ''))),
    columns: ['title', 'event_date', 'ministry', 'recurrence_label', 'hidden'],
    fields: [
      { name: 'title', label: 'Event (changed on urf.life, not here)', type: 'text', required: true },
      { name: 'hidden', label: 'Hide this event on this website', type: 'checkbox', defaultChecked: false },
    ]
  },
  campaign: {
    table: 'campaign_items_church',
    title: 'Growth Campaign',
    titleField: 'title',
    pageSize: 100,
    sortItems: (items) => [...items].sort((a, b) => String(b.kind).localeCompare(String(a.kind)) || (a.sort_order_num - b.sort_order_num)),
    columns: ['title', 'kind'],
    fields: [
      { name: 'kind', label: 'What is this?', type: 'select', required: true, options: [
        { value: 'vision', label: 'Vision text (shows under Vision)' },
        { value: 'qa', label: 'A question and its answer (the title is the question)' },
      ] },
      { name: 'title', label: 'Title (for a question, the question)', type: 'text', required: true },
            { name: 'body', label: 'Text (for a question, the answer)', type: 'markdown' },
      { name: 'sort_order_num', label: 'Order (lower shows first)', type: 'number' },
      { name: 'published', label: 'Published', type: 'checkbox', defaultChecked: true, help: 'Visible on the website' },
    ]
  },
  welcomeSteps: {
    table: 'welcome_steps_church',
    title: 'Welcome Emails',
    titleField: 'subject',
    testWelcome: true,
    sortItems: (items) => [...items].sort((a, b) => a.step_number - b.step_number),
    columns: ['step_number', 'delay_days', 'subject'],
    fields: [
      { name: 'step_number', label: 'Order (1 is first)', type: 'number', required: true },
      { name: 'delay_days', label: 'Send this many days after the person is added (0 is right away)', type: 'number' },
      { name: 'subject', label: 'Subject', type: 'text', required: true },
      { name: 'body', label: 'Email text. Leave a blank line between paragraphs. Web addresses become links. {{first_name}} becomes their first name. An unsubscribe link is added at the bottom for you.', type: 'textarea', required: true },
      { name: 'published', label: 'Send this email', type: 'checkbox', defaultChecked: true },
    ]
  },
  emailSettings: {
    table: 'email_settings_church',
    title: 'Email Settings',
    titleField: 'notify_email',
    canCreate: false,
    columns: ['notify_email', 'from_address'],
    fields: [
      { name: 'notify_email', label: 'Send a notice to this address whenever someone fills out a form on the website', type: 'text', required: true },
      { name: 'from_address', label: 'Send from (a sender on a domain you verified in Resend, for example Upper Room Fellowship <info@urfellowship.com>)', type: 'text', required: true },
      { name: 'welcome_enabled', label: 'Add people who fill out the Connect Card or the contact form to the welcome emails', type: 'checkbox', defaultChecked: true },
    ]
  },
  emailLog: {
    table: 'email_outbox_church',
    title: 'Email Log',
    titleField: 'subject',
    canCreate: false,
    testEmail: true,
    pageSize: 100,
    sortItems: (items) => [...items].sort((a, b) => b.id - a.id),
    columns: ['created_at', 'to_email', 'subject', 'status'],
    fields: [
      { name: 'to_email', label: 'To', type: 'text' },
      { name: 'subject', label: 'Subject', type: 'text' },
      { name: 'status', label: 'Status (pending, sent or failed)', type: 'text' },
      { name: 'error', label: 'Problem, if any', type: 'textarea' },
    ]
  },
  categories: {
    table: 'message_categories_church',
    seedNames: STANDARD_CATEGORIES,
    pageSize: 100,
    title: 'Message Categories',
    titleField: 'name',
    columns: ['name'],
    fields: [
      { name: 'name', label: 'Category name', type: 'text', required: true },
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
  useNoIndex();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('forms');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (activeTab) {
      case 'forms':
        return <FormSubmissionsManager />;
      case 'photos':
        return <SitePhotosManager />;
      case 'settings':
        return <SettingsManager />;
      case 'activity':
        return <ActivityLog />;
      case 'welcomeList':
        return <WelcomeList />;
      default:
        return TAB_CONFIGS[activeTab] ? <GenericManager key={activeTab} config={TAB_CONFIGS[activeTab]} /> : null;
    }
  };

  const isAdmin = user?.role !== 'editor';
  const TABS = {
    'Inbox': [
      { key: 'forms', label: 'Form Submissions', icon: FiMail },
      { key: 'welcomeList', label: 'Welcome List', icon: FiUsers },
      { key: 'welcomeSteps', label: 'Welcome Emails', icon: FiMail },
    ],
    'Site': [
      { key: 'spotlights', label: 'Front Page Area', icon: FiLayout },
      { key: 'photos', label: 'Site Photos', icon: FiCamera },
      { key: 'pages', label: 'Custom Pages', icon: FiLayout },
    ],
    'Content': [
      { key: 'sermons', label: 'Messages', icon: FiMic },
      { key: 'categories', label: 'Message Categories', icon: FiLayout },
      { key: 'events', label: 'Events', icon: FiCalendar },
      { key: 'campaign', label: 'Growth Campaign', icon: FiHeart },
      { key: 'podcastShows', label: 'Podcast Shows', icon: FiMic },
      { key: 'podcastEpisodes', label: 'Podcast Episodes', icon: FiMic },
      { key: 'staff', label: 'Staff & Leaders', icon: FiUsers },
      { key: 'posts', label: 'Blog Posts', icon: FiFileText },
    ],
    ...(isAdmin ? {
      'Admin': [
        { key: 'settings', label: 'Settings', icon: FiSettings },
        { key: 'emailSettings', label: 'Email Settings', icon: FiMail },
        { key: 'emailLog', label: 'Email Log', icon: FiMail },
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
            <h1 className="text-2xl font-bold text-white tracking-wider"><span className="text-[#eaa235]">Admin</span></h1>
            <button aria-label="Close menu" onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-2xl text-white/70 hover:text-white">
                <SafeIcon icon={FiX} />
            </button>
        </div>

        <nav aria-label="Admin" className="flex-grow space-y-4">
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
        
        <div className="mt-auto pt-6 border-t border-white/10 space-y-1">
             <a href="/" target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-4 px-4 py-3 text-left text-white/80 hover:bg-[#eaa235] hover:text-[#1e2522] rounded-lg transition-colors">
               <SafeIcon icon={FiExternalLink} className="text-xl" />
               <span className="font-semibold">Go to Site<span className="sr-only"> (opens in a new tab)</span></span>
             </a>
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