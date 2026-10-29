import { FORMS } from '../content/forms';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A field with showIf only appears when another field has a given value.
export function isVisible(field, values) {
  if (!field.showIf) return true;
  return Object.entries(field.showIf).every(([k, v]) => values[k] === v);
}

export function validateForm(formKey, values) {
  const errors = {};
  for (const f of FORMS[formKey].fields) {
    if (!isVisible(f, values)) continue;
    const v = values[f.name];
    const empty = v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
    if (f.required && empty) {
      errors[f.name] = `Please fill in ${f.label.replace(/\s*\(optional\)/, '').toLowerCase()}.`;
    } else if (f.type === 'email' && !empty && !EMAIL.test(String(v).trim())) {
      errors[f.name] = 'Please enter a valid email address.';
    }
  }
  return errors;
}

// Splits values into the table's own columns and a data object for everything else.
export function buildSubmission(formKey, values) {
  const def = FORMS[formKey];
  const data = {};
  for (const f of def.fields) {
    if (!isVisible(f, values)) continue;
    if (['name', 'email', 'phone'].includes(f.name)) continue;
    const v = values[f.name];
    if (v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) continue;
    data[f.name] = v === true ? 'Yes' : v;
  }
  return {
    form_type: formKey,
    name: String(values.name || '').trim().slice(0, 200),
    email: String(values.email || '').trim().slice(0, 200),
    phone: String(values.phone || '').trim().slice(0, 60),
    data,
  };
}
