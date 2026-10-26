import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { publicDataFetch } from './api';
import { SITE } from './config';

const SettingsContext = createContext(SITE);

export const SETTINGS_TABLE = 'site_settings_church';

// Builds the effective site details: code defaults from config.js, overridden by
// whatever staff saved in the admin Settings tab.
export function mergeSettings(row) {
  if (!row) return SITE;
  const address = {
    street: row.street || SITE.address.street,
    city: row.city || SITE.address.city,
    region: row.region || SITE.address.region,
    postalCode: row.postal_code || SITE.address.postalCode,
  };
  const q = encodeURIComponent(`${address.street} ${address.city} ${address.region} ${address.postalCode}`);
  const phone = row.phone || SITE.phone;
  const social = [
    { label: 'Facebook', url: row.facebook_url || SITE.social.find(s => s.label === 'Facebook')?.url },
    { label: 'Instagram', url: row.instagram_url || SITE.social.find(s => s.label === 'Instagram')?.url },
    { label: 'YouTube', url: row.youtube_url || SITE.social.find(s => s.label === 'YouTube')?.url },
  ].filter(s => s.url);
  return {
    ...SITE,
    email: row.email || SITE.email,
    phone,
    phoneHref: `tel:${phone.replace(/[^\d+]/g, '')}`,
    serviceTime: row.service_time || SITE.serviceTime,
    address,
    addressLine: `${address.street}, ${address.city}, ${address.region} ${address.postalCode}`,
    googleMapsUrl: `https://maps.google.com/?q=${q}`,
    appleMapsUrl: `https://maps.apple.com/?q=${q}`,
    giveUrl: row.give_url || SITE.giveUrl,
    social,
  };
}

export function SettingsProvider({ children }) {
  const [row, setRow] = useState(null);

  useEffect(() => {
    publicDataFetch(`read/${SETTINGS_TABLE}?limit=1`).then(res => {
      if (res.status === 'success') setRow(res.data?.[0] ?? null);
    });
  }, []);

  const value = useMemo(() => mergeSettings(row), [row]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSite() {
  return useContext(SettingsContext);
}
