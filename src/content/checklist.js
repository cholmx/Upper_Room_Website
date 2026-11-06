// The "Content to confirm" list in the admin. Every visible [BRACKETED] placeholder on the site
// has an entry here (checklist.test.js keeps the two in step).
export const CHECKLIST = [
  { id: 'logo', label: 'Upload the dark and light logo files', where: 'Admin, Site Photos', route: '/' },
  { id: 'photos', label: 'Add real photos to every labeled photo slot', where: 'Admin, Site Photos', route: '/' },
  { id: 'analytics', label: 'Add the Google Analytics ID (or similar) and update the privacy page', where: 'Privacy', route: '/privacy' },
  { id: 'legal-review', label: 'Have the privacy page reviewed by someone qualified', where: 'Privacy', route: '/privacy' },
  { id: 'announcement', label: 'Write a current announcement for the top of the site (optional)', where: 'Admin, Settings', route: '/' },
];

export const CHECKLIST_IDS = CHECKLIST.map(i => i.id);
