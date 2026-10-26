import { dataFetch } from '../api';

export const ACTIVITY_TABLE = 'activity_log_church';

// Best-effort audit trail. A logging failure must never block the edit itself.
// `actor` is deliberately not sent: the database fills it from the signed-in
// session, so an entry can never be attributed to someone else.
export async function logActivity(user, action, tableLabel, itemLabel) {
  try {
    await dataFetch(`create/${ACTIVITY_TABLE}`, {
      method: 'POST',
      body: JSON.stringify({
        action,
        area: tableLabel,
        item_label: String(itemLabel || '').slice(0, 200),
      }),
    });
  } catch {
    /* ignore */
  }
}
