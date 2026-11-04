// The pages from urfellowship.com, grouped so the menu stays easy to scan.
export const NAV = [
  { label: 'New Here?', to: '/plan-your-visit' },
  {
    label: 'About',
    children: [
      { label: 'About Us', to: '/about' },
      { label: 'Core Values', to: '/core-values' },
      { label: 'Leadership', to: '/leadership' },
    ],
  },
  {
    label: 'Ministries',
    children: [
      { label: 'Ministries', to: '/ministries' },
      { label: 'Sozo', to: '/sozo' },
    ],
  },
  { label: 'Messages', to: '/messages' },
  {
    label: 'Connect',
    children: [
      { label: 'Contact', to: '/contact' },
      { label: 'Connect Card', to: '/connect' },
    ],
  },
];

// Short site map for the footer.
export const FOOTER_LINKS = [
  { label: 'New Here?', to: '/plan-your-visit' },
  { label: 'About Us', to: '/about' },
  { label: 'Core Values', to: '/core-values' },
  { label: 'Ministries', to: '/ministries' },
  { label: 'Sozo', to: '/sozo' },
  { label: 'Messages', to: '/messages' },
  { label: 'Leadership', to: '/leadership' },
  { label: 'Contact', to: '/contact' },
  { label: 'Connect Card', to: '/connect' },
];
