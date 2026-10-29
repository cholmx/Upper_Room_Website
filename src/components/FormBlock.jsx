import React, { useRef, useState } from 'react';
import { FORMS } from '../content/forms';
import { buildSubmission, isVisible, validateForm } from '../lib/forms';
import { publicDataFetch } from '../api';
import { useSite } from '../settings';

export const SUBMISSIONS_TABLE = 'form_submissions_church';

const input = 'w-full min-h-[48px] px-4 py-3 bg-white rounded-xl border border-black/25 focus:outline-none focus:ring-2 focus:ring-[#8A6309] focus:border-[#8A6309] text-base';

function Field({ field, value, onChange, error }) {
  const id = `ff-${field.name}`;
  const describedBy = error ? `${id}-err` : undefined;
  const common = { id, name: field.name, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy, required: field.required };

  let control;
  if (field.type === 'textarea') {
    control = <textarea {...common} rows={5} maxLength={4000} value={value || ''} onChange={(e) => onChange(field.name, e.target.value)} className={input} />;
  } else if (field.type === 'select') {
    control = (
      <select {...common} value={value || ''} onChange={(e) => onChange(field.name, e.target.value)} className={input}>
        <option value="">Choose one</option>
        {field.options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  } else if (field.type === 'radio') {
    return (
      <fieldset aria-describedby={describedBy}>
        <legend className="block font-semibold mb-2">{field.label}</legend>
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          {field.options.map(o => (
            <label key={o} className="inline-flex items-center gap-2 min-h-[44px] cursor-pointer">
              <input type="radio" name={field.name} value={o} checked={value === o} onChange={() => onChange(field.name, o)} className="w-5 h-5 accent-[#8A6309]" />
              <span>{o}</span>
            </label>
          ))}
        </div>
        {error && <p id={describedBy} role="alert" className="text-red-700 text-sm mt-1">{error}</p>}
      </fieldset>
    );
  } else if (field.type === 'checkboxes') {
    const list = Array.isArray(value) ? value : [];
    return (
      <fieldset aria-describedby={describedBy}>
        <legend className="block font-semibold mb-2">{field.label}</legend>
        <div className="grid sm:grid-cols-2 gap-x-6">
          {field.options.map(o => (
            <label key={o} className="inline-flex items-center gap-2 min-h-[44px] cursor-pointer">
              <input
                type="checkbox"
                checked={list.includes(o)}
                onChange={(e) => onChange(field.name, e.target.checked ? [...list, o] : list.filter(x => x !== o))}
                className="w-5 h-5 accent-[#8A6309]"
              />
              <span>{o}</span>
            </label>
          ))}
        </div>
        {error && <p id={describedBy} role="alert" className="text-red-700 text-sm mt-1">{error}</p>}
      </fieldset>
    );
  } else if (field.type === 'checkbox') {
    return (
      <div>
        <label className="inline-flex items-start gap-3 min-h-[44px] cursor-pointer">
          <input id={id} type="checkbox" name={field.name} checked={Boolean(value)} onChange={(e) => onChange(field.name, e.target.checked)} className="w-5 h-5 mt-1 accent-[#8A6309]" />
          <span>{field.label}</span>
        </label>
      </div>
    );
  } else {
    control = (
      <input
        {...common}
        type={field.type}
        maxLength={200}
        autoComplete={field.autoComplete}
        value={value || ''}
        onChange={(e) => onChange(field.name, e.target.value)}
        className={input}
      />
    );
  }

  return (
    <div>
      <label htmlFor={id} className="block font-semibold mb-2">
        {field.label}{field.required && <span aria-hidden="true" className="text-[#8A4B00]"> *</span>}
      </label>
      {control}
      {error && <p id={describedBy} role="alert" className="text-red-700 text-sm mt-1">{error}</p>}
    </div>
  );
}

export default function FormBlock({ formKey, heading, intro, defaults = {}, className = '' }) {
  const SITE = useSite();
  const def = FORMS[formKey];
  const opened = useRef(Date.now());
  const [values, setValues] = useState(defaults);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ phase: 'idle', error: '' });
  const formRef = useRef(null);
  const headingId = `form-${formKey}-h`;

  const change = (name, value) => {
    setValues(v => ({ ...v, [name]: value }));
    setErrors(e => (e[name] ? { ...e, [name]: undefined } : e));
  };

  const submit = async (e) => {
    e.preventDefault();
    // Bots fill the hidden field or submit instantly. Pretend it worked and drop it.
    if (values.website || Date.now() - opened.current < 2500) {
      setState({ phase: 'sent', error: '' });
      return;
    }
    const found = validateForm(formKey, values);
    if (Object.keys(found).length) {
      setErrors(found);
      formRef.current?.querySelector(`#ff-${Object.keys(found)[0]}, [name="${Object.keys(found)[0]}"]`)?.focus();
      return;
    }
    setState({ phase: 'sending', error: '' });
    const res = await publicDataFetch(`create/${SUBMISSIONS_TABLE}`, { method: 'POST', body: JSON.stringify(buildSubmission(formKey, values)) });
    if (res.status === 'success') {
      setState({ phase: 'sent', error: '' });
      setValues(defaults);
    } else {
      setState({ phase: 'error', error: `We could not send that just now. Please email ${SITE.email} or call ${SITE.phone}, and we will help.` });
    }
  };

  if (state.phase === 'sent') {
    return (
      <div role="status" className={`bg-white border border-black/10 rounded-2xl p-8 text-center ${className}`}>
        <p className="text-xl font-semibold leading-relaxed">{def.confirmation}</p>
        <button type="button" onClick={() => setState({ phase: 'idle', error: '' })} className="u-btn bg-transparent text-[#080c0b] border-[#080c0b]/70 hover:bg-[#080c0b] hover:text-[#FFC44F] mt-6">Send another</button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate aria-labelledby={heading ? headingId : undefined} className={`bg-white border border-black/10 rounded-2xl p-6 md:p-8 space-y-5 ${className}`}>
      {heading && <h2 id={headingId} className="text-2xl md:text-3xl">{heading}</h2>}
      {intro && <p className="text-[#2b2f2d] leading-relaxed">{intro}</p>}
      {def.fields.filter(f => isVisible(f, values)).map(f => (
        <Field key={f.name} field={f} value={values[f.name]} onChange={change} error={errors[f.name]} />
      ))}
      {/* Honeypot: hidden from people and screen readers */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 overflow-hidden">
        <label>Website<input tabIndex={-1} autoComplete="off" name="website" value={values.website || ''} onChange={(e) => change('website', e.target.value)} /></label>
      </div>
      {def.note && <p className="text-sm text-[#2b2f2d]">{def.note}</p>}
      {state.phase === 'error' && <p role="alert" className="text-red-700 font-medium">{state.error}</p>}
      <button type="submit" disabled={state.phase === 'sending'} className="u-btn bg-[#FFC44F] text-[#080c0b] border-[#FFC44F] hover:bg-[#ffce6b] disabled:opacity-60">
        {state.phase === 'sending' ? 'Sending...' : def.button}
      </button>
    </form>
  );
}
