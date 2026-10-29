// The page banners from the original design. A photo set in Site Photos replaces one.
const PX = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&h=1200`;
const ABOUT = PX(40383990);
const VISIT = PX(8250816);
const MINISTRY = PX(3700250);
const GENERAL = PX(9562304);

export const HERO_IMAGES = {
  home: PX(38274945),
  plan: VISIT, contact: VISIT, faq: VISIT,
  about: ABOUT, beliefs: ABOUT, values: ABOUT, growth: ABOUT,
  leadership: PX(3184393),
  messages: PX(34328505),
  events: PX(39007872),
  ministries: MINISTRY, kids: MINISTRY, youth: MINISTRY, tableGroups: MINISTRY, serve: MINISTRY,
  careportal: MINISTRY, nextSteps: MINISTRY,
  sozo: GENERAL, give: GENERAL, accessibility: GENERAL, privacy: GENERAL,
  blog: PX(6779632),
};

// Every image the site shows. Until a real photo is added in the admin (Site Photos),
// the slot shows its label so it is clear what belongs there.
export const PHOTO_SLOTS = [
  { key: 'home-hero', label: 'congregation worshiping or greeting each other', alt: 'Adults and children worship together on Sunday morning.' },
  { key: 'plan-entrance', label: 'front entrance and parking lot', alt: 'The front entrance of Upper Room Fellowship at 500 Sponseller Road in Columbiana.' },
  { key: 'plan-greeter', label: 'families greeting each other at the front door', alt: 'A greeter welcomes a family at the front door of Upper Room Fellowship.' },
  { key: 'plan-coffee', label: 'people talking over coffee during the Sunday break', alt: 'People talking over coffee during the Sunday break.' },
  { key: 'about-story', label: 'the church family together', alt: 'The Upper Room Fellowship church family together in Columbiana.' },
  { key: 'about-columbiana', label: 'a Columbiana street or local landmark', alt: 'A street scene in Columbiana, Ohio.' },
  { key: 'kids-classroom', label: 'kids in a classroom', alt: 'Children learning together in Upper Room Kids.' },
  { key: 'youth-center', label: 'students in the Student Center', alt: 'Students gather on a Wednesday night at Upper Room Youth.' },
  { key: 'table-group', label: 'a Table Group in a living room', alt: 'A Table Group meets in a home to study and pray.' },
  { key: 'worship-team', label: 'the worship team on stage', alt: 'The worship team leads the congregation in song.' },
  { key: 'building', label: 'the building exterior', alt: 'The Upper Room Fellowship building at 500 Sponseller Road in Columbiana.' },
  { key: 'give-impact-1', label: 'impact story one', alt: 'A story of what generosity made possible.' },
  { key: 'give-impact-2', label: 'impact story two', alt: 'A story of what generosity made possible.' },
  { key: 'give-impact-3', label: 'impact story three', alt: 'A story of what generosity made possible.' },
  { key: 'outreach-1', label: 'an outreach project', alt: 'Church members serving at a community outreach project.' },
  { key: 'campaign-hero', label: 'the sanctuary or the expansion plans', alt: 'The Upper Room Fellowship sanctuary.' },
  { key: 'logo-dark', label: 'dark logo for light backgrounds', alt: 'The Upper Room Fellowship', kind: 'logo' },
  { key: 'logo-light', label: 'light logo for dark backgrounds', alt: 'The Upper Room Fellowship', kind: 'logo' },
  { key: 'og-image', label: 'social sharing image, 1200 by 630', alt: 'The Upper Room Fellowship in Columbiana, Ohio', kind: 'logo' },
  { key: 'core-value-1', label: 'icon for Pursuing Healthy Relationships', alt: '', kind: 'icon' },
  { key: 'core-value-2', label: 'icon for Accessing Abundant Wholeness', alt: '', kind: 'icon' },
  { key: 'core-value-3', label: 'icon for Knowing Our Greatness', alt: '', kind: 'icon' },
  { key: 'core-value-4', label: 'icon for Owning a Supernatural Lifestyle', alt: '', kind: 'icon' },
  { key: 'core-value-5', label: 'icon for Treasuring His Presence', alt: '', kind: 'icon' },
  { key: 'core-value-6', label: 'icon for Living the Gospel', alt: '', kind: 'icon' },
];

export const BANNER_SLOTS = Object.keys(HERO_IMAGES).map(k => ({ key: `banner-${k}`, label: `${k.replace(/([A-Z])/g, ' $1').toLowerCase()} page banner (replaces the default photo)`, alt: '', kind: 'banner' }));
PHOTO_SLOTS.push(...BANNER_SLOTS);

export const SLOT_BY_KEY = Object.fromEntries(PHOTO_SLOTS.map(s => [s.key, s]));

