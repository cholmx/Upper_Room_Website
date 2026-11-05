// The site menu. Parent items open a short list; the first entry of each is the parent page itself.
export const NAV = [
  { label: 'Home', to: '/' },
  { label: 'New Here?', to: '/plan-your-visit' },
  {
    label: 'About Us',
    children: [
      { label: 'About Us', to: '/about' },
      { label: 'Core Values', to: '/core-values' },
    ],
  },
  {
    label: 'Discipleship',
    children: [
      { label: 'Adult Discipleship Training', to: '/discipleship' },
      { label: 'Sozo', to: '/sozo' },
    ],
  },
  { label: 'Messages', to: '/messages' },
  { label: 'Leadership', to: '/leadership' },
  {
    label: 'Contact',
    children: [
      { label: 'Contact', to: '/contact' },
      { label: 'Connect Card', to: '/connect' },
    ],
  },
  { label: 'Give', to: '/give', external: true },
  { label: 'CarePortal', to: '/careportal' },
];

// Short site map for the footer.
export const FOOTER_LINKS = [
  { label: 'New Here?', to: '/plan-your-visit' },
  { label: 'About Us', to: '/about' },
  { label: 'Core Values', to: '/core-values' },
  { label: 'Adult Discipleship Training', to: '/discipleship' },
  { label: 'Sozo', to: '/sozo' },
  { label: 'Messages', to: '/messages' },
  { label: 'Leadership', to: '/leadership' },
  { label: 'Contact', to: '/contact' },
  { label: 'Connect Card', to: '/connect' },
  { label: 'CarePortal', to: '/careportal' },
];
