import { describe, it, expect } from 'vitest';
import { FORMS, FORM_KEYS } from '../content/forms';
import { buildSubmission, isVisible, validateForm } from './forms';

describe('form definitions', () => {
  it('give every form a label, a button, and a confirmation', () => {
    for (const key of FORM_KEYS) {
      expect(FORMS[key].label).toBeTruthy();
      expect(FORMS[key].button).toBeTruthy();
      expect(FORMS[key].confirmation).toBeTruthy();
    }
  });

  it('keep field names unique inside each form', () => {
    for (const key of FORM_KEYS) {
      const names = FORMS[key].fields.map(f => f.name);
      expect(new Set(names).size).toBe(names.length);
    }
  });

  it('use only form types the database accepts', () => {
    const allowed = ['connect', 'contact', 'prayer', 'sozo', 'tablegroup', 'serve', 'baptism', 'growthtrack', 'worship', 'story', 'generosity'];
    expect(FORM_KEYS.slice().sort()).toEqual(allowed.slice().sort());
  });

  it('never use dashes in the words visitors read', () => {
    const all = JSON.stringify(FORMS);
    expect(all).not.toMatch(/[—–]/);
  });

  it('shows the Connect Card confirmation from the brief', () => {
    expect(FORMS.connect.confirmation).toBe('Thanks! We can’t wait to meet you on Sunday. A member of our welcome team will be watching for you.');
  });
});

describe('validateForm', () => {
  it('asks for required fields in plain words', () => {
    const e = validateForm('connect', {});
    expect(e.name).toBe('Please fill in name.');
    expect(e.email).toBeTruthy();
  });
  it('checks email shape', () => {
    expect(validateForm('contact', { name: 'A', email: 'nope', message: 'hi' }).email).toMatch(/valid email/);
    expect(validateForm('contact', { name: 'A', email: 'a@b.co', message: 'hi' })).toEqual({});
  });
  it('requires at least nothing for optional fields', () => {
    expect(validateForm('prayer', { message: 'Please pray.' })).toEqual({});
  });
  it('ignores a hidden follow-up field', () => {
    expect(isVisible({ showIf: { has_children: 'Yes' } }, { has_children: 'No' })).toBe(false);
    expect(isVisible({ showIf: { has_children: 'Yes' } }, { has_children: 'Yes' })).toBe(true);
  });
});

describe('buildSubmission', () => {
  it('moves name, email, and phone into columns and the rest into data', () => {
    const out = buildSubmission('connect', { name: ' Pat ', email: 'pat@x.org', phone: '', visit_date: '2026-11-01', has_children: 'No', children_ages: 'ignored', website: 'spam' });
    expect(out).toEqual({ form_type: 'connect', name: 'Pat', email: 'pat@x.org', phone: '', data: { visit_date: '2026-11-01', has_children: 'No' } });
  });
  it('stores checkboxes as Yes and lists as arrays', () => {
    const out = buildSubmission('serve', { name: 'A', email: 'a@b.co', teams: ['Kids', 'Media'] });
    expect(out.data.teams).toEqual(['Kids', 'Media']);
    expect(buildSubmission('prayer', { message: 'x', private: true }).data.private).toBe('Yes');
  });
  it('trims names to the length the database allows', () => {
    expect(buildSubmission('contact', { name: 'a'.repeat(500) }).name.length).toBe(200);
  });
});
