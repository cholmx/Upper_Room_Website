// Column mapping from the old NCB tables to the Bolt Database schema.
// Only whitelisted columns are copied, so unknown legacy fields never reach the new tables.

export const TABLES = {
  hero_config: ['heading', 'subtext', 'image_url'],
  home_section_order_church: ['section_key_name', 'sort_order_num_val'],
  photo_sections_church: ['heading', 'subtext', 'image_url', 'button_text', 'button_page_slug', 'sort_order_num'],
  gallery_church: ['image_url', 'caption', 'sort_order_num'],
  custom_pages_church: ['title_text', 'slug_key', 'nav_label_text', 'body_content_text'],
  sermons: ['title', 'speaker', 'series', 'date', 'description', 'notes', 'video_url', 'audio_url', 'published', 'publish_date'],
  events_church: ['title', 'date', 'time', 'location', 'desc_text', 'recurrence', 'registration_url', 'published', 'publish_date'],
  posts: ['title', 'author', 'date', 'category', 'image_url', 'body', 'published', 'publish_date'],
  episodes: ['title', 'date', 'audio', 'feed'],
};

const DATE_COLUMNS = new Set(['date', 'publish_date']);
const NUMBER_COLUMNS = new Set(['sort_order_num', 'sort_order_num_val', 'published']);

// Older rows used different names for a few fields.
function applyLegacyNames(table, row) {
  const out = { ...row };
  if (table === 'sermons' && !out.video_url && out.yt) out.video_url = out.yt;
  if (table === 'events_church' && !out.desc_text && out.description) out.desc_text = out.description;
  return out;
}

export function mapRow(table, row) {
  const cols = TABLES[table];
  if (!cols) throw new Error(`Unknown table: ${table}`);
  const src = applyLegacyNames(table, row);
  const out = {};
  for (const col of cols) {
    let v = src[col];
    if (v === undefined) continue;
    if (v === '' && DATE_COLUMNS.has(col)) v = null;
    if (NUMBER_COLUMNS.has(col)) {
      if (v === '' || v === null) continue;
      v = Number(v);
      if (Number.isNaN(v)) continue;
    }
    out[col] = v;
  }
  // Keep the original creation time so "newest first" ordering survives the move.
  if (src.created_at) out.created_at = src.created_at;
  return out;
}

// Oldest first, so ties in the new table still come out in the original order.
export function orderRows(rows) {
  return [...rows].sort((a, b) => {
    const ta = String(a.created_at || '');
    const tb = String(b.created_at || '');
    return ta === tb ? Number(a.id || 0) - Number(b.id || 0) : ta < tb ? -1 : 1;
  });
}
