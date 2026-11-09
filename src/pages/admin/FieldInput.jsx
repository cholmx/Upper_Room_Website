import { parseCategories, joinCategories } from '../../lib/categories';
import React, { useRef, useState } from 'react';
import { ytId, ytEmbed } from '../../utils';
import { uploadImage, uploadsEnabled } from '../../lib/upload';
import RichText from '../../components/RichText';

const base = 'w-full px-4 py-3 bg-[#1e2522]/5 rounded-lg border focus:outline-none focus:ring-1 transition';
const ok = 'border-[#1e2522]/20 focus:border-[#eaa235] focus:ring-[#eaa235]';
const bad = 'border-[#c74f2f] focus:border-[#c74f2f] focus:ring-[#c74f2f]';

export const isChecked = (v, fallback = false) => {
  if (v === undefined || v === null || v === '') return fallback;
  return v === true || v === 1 || v === '1' || v === 'true';
};

function ImageField({ id, value, onChange, invalid }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const fileRef = useRef(null);

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setErr('');
    try {
      onChange(await uploadImage(file));
    } catch (ex) {
      setErr(ex.message);
    }
    setBusy(false);
  };

  return (
    <div>
      {value && !invalid && (
        <img src={value} alt="Preview" className="mb-3 h-40 rounded-lg border border-[#1e2522]/20 object-cover bg-[#1e2522]/5" onError={(e) => { e.currentTarget.style.display = 'none'; }} onLoad={(e) => { e.currentTarget.style.display = ''; }} />
      )}
      {uploadsEnabled && (
        <div className="flex flex-wrap items-center gap-3">
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={pick} aria-label="Choose a photo to upload" tabIndex={-1} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className="px-5 py-3 rounded-lg bg-[#1e2522] text-white font-bold whitespace-nowrap disabled:opacity-60">
            {busy ? 'Uploading...' : value ? 'Replace photo' : 'Upload a photo'}
          </button>
          {value && !busy && (
            <button type="button" onClick={() => onChange('')} className="px-4 py-3 rounded-lg border border-[#1e2522]/20 font-semibold text-[#1e2522] hover:bg-[#1e2522]/5">Remove</button>
          )}
          <span className="text-sm text-black">JPG, PNG, WebP, or GIF. Large photos are shrunk for you.</span>
        </div>
      )}
      <details className="mt-3" open={!uploadsEnabled || undefined}>
        <summary className="cursor-pointer text-sm font-semibold text-black">{uploadsEnabled ? 'Or paste a link to a photo' : 'Photo link'}</summary>
        <input id={id} type="url" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="https://..." className={`mt-2 ${base} ${invalid ? bad : ok}`} aria-invalid={invalid} />
      </details>
      {err && <p role="alert" className="text-sm text-[#c74f2f] mt-2">{err}</p>}
    </div>
  );
}

function MarkdownField({ id, value, onChange, invalid }) {
  const [preview, setPreview] = useState(false);
  const ref = useRef(null);

  const wrap = (before, after = before, placeholder = 'text') => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b } = el;
    const text = value || '';
    const sel = text.slice(a, b) || placeholder;
    onChange(text.slice(0, a) + before + sel + after + text.slice(b));
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(a + before.length, a + before.length + sel.length); });
  };
  const linePrefix = (prefix) => {
    const el = ref.current;
    if (!el) return;
    const text = value || '';
    const start = text.lastIndexOf('\n', el.selectionStart - 1) + 1;
    onChange(text.slice(0, start) + prefix + text.slice(start));
    requestAnimationFrame(() => el.focus());
  };

  const tools = [
    ['Bold', 'B', () => wrap('**')],
    ['Italic', 'I', () => wrap('*')],
    ['Heading', 'H', () => linePrefix('## ')],
    ['Bulleted list', '•', () => linePrefix('- ')],
    ['Link', 'Link', () => wrap('[', '](https://)', 'link text')],
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-2" role="toolbar" aria-label="Formatting">
        {tools.map(([label, text, fn]) => (
          <button key={label} type="button" aria-label={label} onClick={fn} disabled={preview} className="px-3 py-1.5 text-sm font-bold rounded border border-[#1e2522]/20 bg-white hover:bg-[#1e2522]/5 disabled:opacity-40">{text}</button>
        ))}
        <button type="button" onClick={() => setPreview(p => !p)} aria-pressed={preview} className="ml-auto px-3 py-1.5 text-sm font-bold rounded border border-[#1e2522]/20 bg-white hover:bg-[#1e2522]/5">
          {preview ? 'Edit' : 'Preview'}
        </button>
      </div>
      {preview ? (
        <div className="min-h-[10rem] p-4 rounded-lg border border-[#1e2522]/20 bg-white"><RichText value={value} /></div>
      ) : (
        <textarea ref={ref} id={id} rows={10} value={value || ''} onChange={(e) => onChange(e.target.value)} className={`${base} ${invalid ? bad : ok} text-sm`} aria-invalid={invalid} />
      )}
      <p className="text-xs text-black mt-2">Supports **bold**, *italic*, ## headings, - lists and [links](https://example.com). Leave a blank line between paragraphs.</p>
    </div>
  );
}

export default function FieldInput({ field, value, onChange, error }) {
  const id = `f-${field.name}`;
  const invalid = Boolean(error);
  const set = (v) => onChange(field.name, v);

  let control;
  switch (field.type) {
    case 'textarea':
      control = <textarea id={id} rows={6} value={value || ''} onChange={(e) => set(e.target.value)} className={`${base} ${invalid ? bad : ok}`} aria-invalid={invalid} />;
      break;
    case 'markdown':
      control = <MarkdownField id={id} value={value} onChange={set} invalid={invalid} />;
      break;
    case 'image':
      control = <ImageField id={id} value={value} onChange={set} invalid={invalid} />;
      break;
    case 'checkbox':
      control = (
        <label className="inline-flex items-center gap-3 cursor-pointer">
          <input id={id} type="checkbox" checked={isChecked(value, field.defaultChecked)} onChange={(e) => set(e.target.checked ? 1 : 0)} className="w-5 h-5 accent-[#eaa235]" />
          <span className="text-[#1e2522]">{field.help}</span>
        </label>
      );
      break;
    case 'categories': {
      const chosen = parseCategories(value);
      const toggle = (name) => set(joinCategories(chosen.some(c => c.toLowerCase() === name.toLowerCase()) ? chosen.filter(c => c.toLowerCase() !== name.toLowerCase()) : [...chosen, name]));
      control = (
        <div role="group" aria-labelledby={`${id}-label`} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 p-4 rounded-lg border border-[#1e2522]/20 bg-white max-h-72 overflow-y-auto">
          {field.options.map(name => (
            <label key={name} className="flex items-center gap-3 cursor-pointer text-sm">
              <input type="checkbox" checked={chosen.some(c => c.toLowerCase() === name.toLowerCase())} onChange={() => toggle(name)} className="w-5 h-5 accent-[#c74f2f]" />
              <span>{name}</span>
            </label>
          ))}
          {field.options.length === 0 && <p className="text-sm text-black">Add categories under Message Categories first.</p>}
        </div>
      );
      break;
    }
    case 'select':
      control = (
        <select id={id} value={value || field.options[0].value} onChange={(e) => set(e.target.value)} className={`${base} ${ok}`}>
          {field.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
      break;
    case 'youtube':
      control = (
        <div>
          <input id={id} type="url" value={value || ''} onChange={(e) => set(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className={`${base} ${invalid ? bad : ok}`} aria-invalid={invalid} />
          {ytId(value) && (
            <div className="mt-3 aspect-video max-w-sm rounded-lg overflow-hidden border border-[#1e2522]/20 bg-[#1e2522]">
              <iframe src={ytEmbed(value)} title="Video preview" className="w-full h-full" loading="lazy" allowFullScreen></iframe>
            </div>
          )}
        </div>
      );
      break;
    case 'number':
      control = <input id={id} type="number" value={value ?? ''} onChange={(e) => set(e.target.value === '' ? '' : Number(e.target.value))} className={`${base} ${invalid ? bad : ok}`} aria-invalid={invalid} />;
      break;
    default:
      control = <input id={id} type={['date', 'url', 'email'].includes(field.type) ? field.type : 'text'} value={value || ''} onChange={(e) => set(e.target.value)} className={`${base} ${invalid ? bad : ok}`} aria-invalid={invalid} />;
  }

  return (
    <div>
      <label id={`${id}-label`} htmlFor={id} className="block text-sm font-bold text-[#1e2522] mb-2">
        {field.label}{field.required && <span className="text-[#c74f2f]" aria-hidden="true"> *</span>}
      </label>
      {control}
      {field.type === 'slug' && <p className="text-xs text-black mt-2">Appears in the page address. Filled in from the title if left blank.</p>}
      {invalid && <p role="alert" className="text-sm text-[#c74f2f] mt-2">{error}</p>}
    </div>
  );
}
