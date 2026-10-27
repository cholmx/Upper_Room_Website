import { ytId, slugify } from '../../utils';

const isHttpUrl = (v) => {
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

const isRealDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(new Date(v + 'T00:00:00').getTime());

// Returns { fieldName: message } for every problem found. `others` are the other
// rows in the same table, used for slug uniqueness.
export function validate(fields, data, others = []) {
  const errors = {};
  for (const f of fields) {
    const v = data[f.name];
    const empty = v === undefined || v === null || String(v).trim() === '';
    if (f.required && empty) {
      errors[f.name] = `${f.label} is required`;
      continue;
    }
    if (empty) continue;
    if (f.type === 'url' || f.type === 'image') {
      if (!isHttpUrl(v)) errors[f.name] = 'Enter a full link starting with http:// or https://';
    } else if (f.type === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim())) errors[f.name] = 'Enter a valid email address';
    } else if (f.type === 'youtube') {
      if (!ytId(v)) errors[f.name] = 'Enter a YouTube watch, youtu.be, or embed link';
    } else if (f.type === 'date') {
      if (!isRealDate(v)) errors[f.name] = 'Enter a valid date';
    } else if (f.type === 'slug') {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(v)) errors[f.name] = 'Use lowercase letters, numbers and single hyphens only';
      else if (others.some(o => o.id !== data.id && o[f.name] === v)) errors[f.name] = 'That URL slug is already used by another item';
    }
  }
  return errors;
}

export function autoSlug(fields, data) {
  const out = { ...data };
  for (const f of fields) {
    if (f.type === 'slug' && f.slugFrom && !out[f.name] && out[f.slugFrom]) {
      out[f.name] = slugify(out[f.slugFrom]);
    }
  }
  return out;
}
