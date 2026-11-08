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
  discipleship: MINISTRY,
  sozo: GENERAL, give: GENERAL, accessibility: GENERAL, privacy: GENERAL,
  blog: PX(6779632),
};

// Every image the site shows. Until a real photo is added in the admin (Site Photos),
// the slot shows its label so it is clear what belongs there.
export const PHOTO_SLOTS = [
  { key: 'home-hero', label: 'Home page banner photo, such as the congregation worshiping or greeting each other', alt: 'Adults and children worship together on Sunday morning.' },
  { key: 'home-welcome', label: 'Home page welcome photo, such as people gathered after church', alt: 'People gathered at Upper Room Fellowship.' },
  { key: 'home-know', label: 'Home page, Know God photo', alt: 'People worshiping together.' },
  { key: 'home-share', label: 'Home page, Share Life photo', alt: 'Friends sharing life together at church.' },
  { key: 'home-serve', label: 'Home page, Serve Others photo', alt: 'Church members serving their neighbors.' },
  { key: 'home-plan', label: 'Home page, Plan Your Visit photo', alt: 'Guests being welcomed on a Sunday.' },
  { key: 'home-messages', label: 'Home page, Hear the Latest Message photo', alt: 'A message being taught on Sunday.' },
  { key: 'home-grow', label: 'Home page, Grow With Us photo', alt: 'Adults learning together in a class.' },
  { key: 'home-give', label: 'Home page, Give Online photo', alt: 'Generosity at Upper Room Fellowship.' },
  { key: 'home-columbiana', label: 'Home page, We love Columbiana photo, a photo from around Columbiana', alt: 'A view of Columbiana, Ohio.' },
  { key: 'home-where', label: 'Home page, Where and When background photo, such as the building (full width, words go on top)', alt: 'The Upper Room Fellowship building in Columbiana.' },
  { key: 'home-vision', label: 'Home page, Our Vision photo', alt: 'People praying together.' },
  { key: 'home-contact', label: 'Home page, Contact Us background photo (full width, words go on top)', alt: 'A friendly conversation after church.' },
  { key: 'plan-worship', label: 'New Here page, Worship photo', alt: 'Worship on Sunday morning.' },
  { key: 'plan-message', label: 'New Here page, The message photo', alt: 'A message being taught.' },
  { key: 'plan-wear', label: 'New Here page, What to wear photo', alt: 'Guests dressed casually on Sunday.' },
  { key: 'plan-kids', label: 'New Here page, For your kids photo', alt: 'Kids enjoying a Sunday program.' },
  { key: 'plan-wednesday', label: 'New Here page, Wednesday nights photo', alt: 'A Wednesday evening class.' },
  { key: 'plan-access', label: 'New Here page, Accessibility photo', alt: 'The accessible entrance.' },
  { key: 'about-beliefs', label: 'About Us page, What We Believe background photo (full width, words go on top)', alt: 'Reading Scripture together.' },
  { key: 'values-intro', label: 'Core Values page, inside out photo', alt: 'People connecting in community.' },
  { key: 'values-growing', label: 'Core Values page, Growing in our values background photo (full width, words go on top)', alt: 'A class studying together.' },
  { key: 'discipleship-intro', label: 'Discipleship page, introduction photo', alt: 'An adult class meeting on Sunday.' },
  { key: 'discipleship-practices', label: 'Discipleship page, practices background photo (full width, words go on top)', alt: 'Adults praying together.' },
  { key: 'discipleship-values', label: 'Discipleship page, Values In The Kingdom photo', alt: 'A class studying together.' },
  { key: 'discipleship-wednesday', label: 'Discipleship page, Wednesday evenings photo', alt: 'A Wednesday evening class.' },
  { key: 'sozo-intro', label: 'Sozo page, introduction photo', alt: 'A quiet place for prayer.' },
  { key: 'sozo-session', label: 'Sozo page, what happens in a session photo', alt: 'Two people praying together.' },
  { key: 'sozo-begin', label: 'Sozo page, how to begin photo', alt: 'Starting a conversation.' },
  { key: 'leadership-how', label: 'Leadership page, how we lead background photo (full width, words go on top)', alt: 'The leadership team together.' },
  { key: 'give-intro', label: 'Give page, introduction photo', alt: 'Generosity in action.' },
  { key: 'give-story', label: 'Give page, Share your story background photo (full width, words go on top)', alt: 'People sharing a story.' },
  { key: 'sozo-foundation', label: 'Sozo page, Biblical foundation background photo (full width, words go on top)', alt: 'A quiet place of prayer.' },
  { key: 'plan-connect', label: 'New Here page, Let us know you are coming background photo (full width, words go on top)', alt: 'A welcoming entrance.' },
  { key: 'plan-after', label: 'New Here page, After the service photo', alt: 'The Connection Center.' },
  { key: 'sozo-verse', label: 'Sozo page, closing verse background photo (full width, words go on top)', alt: 'A peaceful scene.' },
  { key: 'contact-values', label: 'Contact page, We value healthy relationships background photo (full width, words go on top)', alt: 'People enjoying fellowship.' },
  { key: 'give-ways', label: 'Give page, ways to give photo', alt: 'Giving at the Connection Center.' },
  { key: 'contact-visit', label: 'Contact page, visit photo, such as the front of the building', alt: 'The front of Upper Room Fellowship.' },
  { key: 'messages-podcast', label: 'Messages page, Listen anywhere background photo (full width, words go on top)', alt: 'Listening to a message.' },
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

