import { backend } from './lib/backend';

// Both helpers use the signed-in user's session when there is one and the anonymous key
// otherwise. What each caller may actually do is decided by row level security in the database.
export function dataFetch(path, options = {}) {
  return backend.data(path, options);
}

export function publicDataFetch(path, options = {}) {
  return backend.data(path, options, { minimal: true });
}
