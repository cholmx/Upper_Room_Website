import { useCallback, useEffect, useState } from 'react';
import { publicDataFetch, dataFetch } from '../api';

// Loads `path` and exposes { data, loading, error, reload }. Pass { admin: true }
// to use the authenticated data endpoint instead of the public one.
export default function useFetch(path, { admin = false } = {}) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!path) {
      setState({ data: null, loading: false, error: null });
      return undefined;
    }
    let cancelled = false;
    setState(s => ({ ...s, loading: true, error: null }));
    (admin ? dataFetch : publicDataFetch)(path).then(res => {
      if (cancelled) return;
      if (res.status === 'success') setState({ data: res.data ?? [], loading: false, error: null });
      else setState({ data: null, loading: false, error: res.error || 'Something went wrong' });
    });
    return () => { cancelled = true; };
  }, [path, admin, tick]);

  const reload = useCallback(() => setTick(t => t + 1), []);
  return { ...state, reload };
}
