import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { publicDataFetch } from './api';
import { safeUrl } from './utils';
import { SLOT_BY_KEY } from './content/photos';

export const PHOTOS_TABLE = 'site_photos_church';

const PhotosContext = createContext({ map: {}, loaded: true });

export function PhotosProvider({ children }) {
  const [rows, setRows] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    publicDataFetch(`read/${PHOTOS_TABLE}`).then(res => {
      if (res.status === 'success') setRows(res.data ?? []);
      setLoaded(true);
    });
  }, []);

  const map = useMemo(() => {
    const m = {};
    for (const r of rows) {
      const url = safeUrl(r.image_url);
      if (r.slot_key && url) m[r.slot_key] = { url, alt: r.alt_text };
    }
    return m;
  }, [rows]);

  const value = useMemo(() => ({ map, loaded }), [map, loaded]);
  return <PhotosContext.Provider value={value}>{children}</PhotosContext.Provider>;
}

export function usePhoto(key) {
  const { map, loaded } = useContext(PhotosContext);
  const slot = SLOT_BY_KEY[key];
  const set = map[key];
  // loaded is false until the saved photos have arrived, so a stand-in picture is not shown first and then swapped.
  return { url: set?.url || '', alt: set?.alt || slot?.alt || '', label: slot?.label || key, loaded };
}

// The photo URLs for several slots at once ('' when a slot has no photo yet).
export function usePhotoUrls(keys) {
  const { map } = useContext(PhotosContext);
  return keys.map(k => map[k]?.url || '');
}
