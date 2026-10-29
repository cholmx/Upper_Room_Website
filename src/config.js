const address = {
  street: '500 Sponseller Road',
  city: 'Columbiana',
  region: 'OH',
  postalCode: '44408',
};

const mapQuery = encodeURIComponent(`${address.street} ${address.city} ${address.region} ${address.postalCode}`);

export const SITE = {
  name: 'The Upper Room Fellowship',
  shortName: 'Upper Room Fellowship',
  abbr: 'URF',
  tagline: 'Transforming lives that transform communities.',
  mission: 'Know God. Share Life. Serve Others.',
  founded: 1971,
  url: (import.meta.env.VITE_SITE_URL || 'https://www.urfellowship.com').replace(/\/$/, ''),
  email: 'info@urfellowship.com',
  phone: '330.482.9058',
  phoneHref: 'tel:3304829058',
  serviceTime: 'Sundays at 10:30am',
  serviceEnds: 'around 11:45am',
  address,
  addressLine: `${address.street}, ${address.city}, ${address.region} ${address.postalCode}`,
  mapEmbedUrl: `https://www.google.com/maps?q=${mapQuery}&output=embed`,
  googleMapsUrl: `https://maps.google.com/?q=${mapQuery}`,
  appleMapsUrl: `https://maps.apple.com/?q=${mapQuery}`,
  giveUrl: 'https://onrealm.org/urfellowship/-/form/give/now',
  growthGiveUrl: 'https://onrealm.org/urfellowship/-/form/give/growthcampaign',
  pledgeUrl: 'https://onrealm.org/urfellowship/-/form/pledge/goalcard',
  textToGive: { keyword: 'urf', number: '73256', example: 'urf $50' },
  careportalUrl: 'https://system.careportal.org/church/103440?q%5Bstatus%5D%5B0%5D=Open',
  podcasts: {
    apple: 'https://podcasts.apple.com/us/podcast/the-upper-room-fellowship/id1193235232',
    spotify: 'https://open.spotify.com/show/4vFbmzsFFEt4DSlUMcVKeO?si=51919efc36ae4862',
  },
  listenApps: {
    apple: 'https://apps.apple.com/us/app/listenwifi/id1391914337',
    google: 'https://play.google.com/store/apps/details?id=com.listentech.ListenEverywhere',
  },
  youtubeChannel: 'https://www.youtube.com/c/TheUpperRoomFellowship',
  social: [
    { label: 'Facebook', url: import.meta.env.VITE_FACEBOOK_URL || 'https://www.facebook.com/urfellowship/' },
    { label: 'Instagram', url: import.meta.env.VITE_INSTAGRAM_URL || 'https://www.instagram.com/urfellowship/' },
    { label: 'YouTube', url: import.meta.env.VITE_YOUTUBE_URL || 'https://www.youtube.com/c/TheUpperRoomFellowship' },
  ],
  announcementText: '',
  announcementUrl: '',
  defaultOgImage: '/og-default.png',
};
