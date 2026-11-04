// The page banners from the original design. A photo set in Site Photos replaces one.
const PX = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&h=1200`;
const ABOUT = PX(40383990);
const VISIT = PX(8250816);
const MINISTRY = PX(3700250);
const GENERAL = PX(9562304);

export const HERO_IMAGES = {
  home: PX(38274945),
  plan: VISIT, contact: VISIT, connect: VISIT,
  about: ABOUT, values: ABOUT,
  leadership: PX(3184393),
  messages: PX(34328505),
  ministries: MINISTRY,
  sozo: GENERAL, give: GENERAL, accessibility: GENERAL, privacy: GENERAL,
  blog: PX(6779632),
};

// Every image the site shows. Until a real photo is added in the admin (Site Photos),
// the slot shows its label so it is clear what belongs there.
export const PHOTO_SLOTS = [
  { key: 'home-hero', label: 'Home page banner photo, such as the congregation worshiping or greeting each other', alt: 'Adults and children worship together on Sunday morning.' },
  { key: 'plan-entrance', label: 'front entrance and parking lot', alt: 'The front entrance of Upper Room Fellowship at 500 Sponseller Road in Columbiana.' },
  { key: 'plan-greeter', label: 'families greeting each other at the front door', alt: 'A greeter welcomes a family at the front door of Upper Room Fellowship.' },
  { key: 'plan-coffee', label: 'people talking over coffee during the Sunday break', alt: 'People talking over coffee during the Sunday break.' },
  { key: 'about-story', label: 'the church family together', alt: 'Upper Room Fellowship church family together in Columbiana.' },
  { key: 'logo-dark', label: 'dark logo for light backgrounds', alt: 'Upper Room Fellowship', kind: 'logo' },
  { key: 'logo-light', label: 'light logo for dark backgrounds', alt: 'Upper Room Fellowship', kind: 'logo' },
  { key: 'og-image', label: 'social sharing image, 1200 by 630', alt: 'Upper Room Fellowship in Columbiana, Ohio', kind: 'logo' },
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

