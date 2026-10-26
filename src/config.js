const address = {
  street: '500 Sponseller Road',
  city: 'Columbiana',
  region: 'OH',
  postalCode: '44408',
};

const mapQuery = encodeURIComponent(`${address.street} ${address.city} ${address.region} ${address.postalCode}`);

export const SITE = {
  name: 'Upper Room Fellowship',
  url: (import.meta.env.VITE_SITE_URL || 'https://www.urfellowship.com').replace(/\/$/, ''),
  email: 'info@urfellowship.com',
  phone: '330.482.9058',
  phoneHref: 'tel:3304829058',
  address,
  addressLine: `${address.street}, ${address.city}, ${address.region} ${address.postalCode}`,
  googleMapsUrl: `https://maps.google.com/?q=${mapQuery}`,
  appleMapsUrl: `https://maps.apple.com/?q=${mapQuery}`,
  giveUrl: 'https://onrealm.org/urfellowship',
  // Set these in .env to show the matching footer link; unset ones are hidden.
  social: [
    { label: 'Facebook', url: import.meta.env.VITE_FACEBOOK_URL },
    { label: 'Instagram', url: import.meta.env.VITE_INSTAGRAM_URL },
    { label: 'YouTube', url: import.meta.env.VITE_YOUTUBE_URL },
  ].filter(s => s.url),
};
