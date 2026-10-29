import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { publicDataFetch } from './api';
import { safeUrl } from './utils';
import { SLOT_BY_KEY } from './content/photos';

export const PHOTOS_TABLE = 'site_photos_church';

const PhotosContext = createContext({});

export function PhotosProvider({ children }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    publicDataFetch(`read/${PHOTOS_TABLE}`).then(res => {
      if (res.status === 'success') setRows(res.data ?? []);
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

  return <PhotosContext.Provider value={map}>{children}</PhotosContext.Provider>;
}

export function usePhoto(key) {
  const map = useContext(PhotosContext);
  const slot = SLOT_BY_KEY[key];
  const set = map[key];
  return { url: set?.url || '', alt: set?.alt || slot?.alt || '', label: slot?.label || key };
}
