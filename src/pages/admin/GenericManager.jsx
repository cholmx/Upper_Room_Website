import React, { useState, useEffect, useMemo, useRef } from 'react';
import { backend } from '../../lib/backend';
import { dataFetch } from '../../api';
import { useAuth } from '../../auth';
import { logActivity } from '../../lib/activity';
import { isLive } from '../../utils';
import { plainText } from '../../lib/markdown';
import ConfirmDialog from '../../components/ConfirmDialog';
import YouTubeImport from './YouTubeImport';
import TranscriptImport from './TranscriptImport';
import BulkBar from './BulkBar';
import { parseCategories } from '../../lib/categories';
import FieldInput from './FieldInput';
import { validate, autoSlug } from './validate';
import SafeIcon from '../../common/SafeIcon';
import { FiEdit2, FiTrash2, FiPlus, FiArrowLeft, FiSave, FiLoader, FiSearch, FiChevronUp, FiChevronDown, FiMenu } from 'react-icons/fi';


const DEFAULT_PAGE_SIZE = 10;

function statusOf(item) {
  if (!('published' in item) && !('publish_date' in item)) return null;
  if (isLive(item)) return null;
  const draft = item.published === false || item.published === 0 || item.published === '0' || item.published === 'false';
  return draft ? 'Draft' : 'Scheduled';
}

export default function GenericManager({ config }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' | 'form'
  const [formData, setFormData] = useState({});
  const [initialJson, setInitialJson] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [importing, setImporting] = useState(false);
  const [transcripts, setTranscripts] = useState(false);
  const [refreshing, setRefreshing] = useState('');
  const [refreshMsg, setRefreshMsg] = useState('');
  const FEED_WHY = { '-1': 'has no feed address yet', '-2': 'could not be reached', '-3': 'answered with an error', '-4': 'did not look like a podcast feed' };
  const refreshFeeds = async () => {
    setRefreshing('busy'); setRefreshMsg('');
    const notes = [];
    for (const it of items.filter(i => String(i.feed_url || '').trim())) {
      const res = await backend.rpc('import_podcast_feed', { show: it.slug });
      const n = res.status === 'success' ? Number(res.data) : NaN;
      notes.push(Number.isNaN(n) ? `${it.name}: ${res.error || 'failed'}` : n < 0 ? `${it.name}: the feed ${FEED_WHY[String(n)] || 'could not be read'}` : `${it.name}: ${n} new ${n === 1 ? 'episode' : 'episodes'}`);
    }
    setRefreshMsg(notes.length ? notes.join('. ') + '.' : 'Add an RSS feed address to a show first.');
    setRefreshing('');
    fetchItems();
  };
  const [categories, setCategories] = useState([]);
  const [seeding, setSeeding] = useState(null);
  const [selected, setSelected] = useState(() => new Set());
  const toggleSelected = (id) => setSelected(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const dragId = useRef(null);

  const PAGE_SIZE = config.pageSize || DEFAULT_PAGE_SIZE;
  const sortable = Boolean(config.sortField);
  const canCreate = config.canCreate !== false;
  const titleField = config.titleField || config.fields[0].name;
  const dirty = view === 'form' && JSON.stringify(formData) !== initialJson;

  useEffect(() => {
    fetchItems();
  }, [config.table]);

  // Messages pick a category from the approved list kept under Message Categories.
  useEffect(() => {
    if (!config.categorySelect) return;
    dataFetch('read/message_categories_church?sort=name:asc').then(res => {
      if (res.status === 'success') setCategories((res.data ?? []).map(c => c.name));
    });
  }, [config.categorySelect]);

  // Warn before closing the tab with unsaved edits.
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const fetchItems = async () => {
    setLoading(true);
    const sort = sortable ? `${config.sortField}:asc` : 'id:desc';
    const res = await dataFetch(`read/${config.table}?sort=${sort}`);
    if (res.status === 'success') {
      setItems(config.sortItems ? config.sortItems(res.data ?? []) : (res.data ?? []));
      setError('');
    } else {
      setError(`Could not load ${config.title}: ${res.error}`);
    }
    setLoading(false);
  };

  const openForm = (data) => {
    setFormData(data);
    setInitialJson(JSON.stringify(data));
    setErrors({});
    setView('form');
  };

  // Adds the standard names that are not in the list yet, so the list never depends on a database migration.
  const seedList = config.seedItems || (config.seedNames || []).map(n => ({ [titleField]: n }));
  const missingSeeds = seedList.filter(seed => !items.some(i => String(i[titleField] || '').toLowerCase() === String(seed[titleField]).toLowerCase()));
  const addSeeds = async () => {
    setSeeding({ done: 0, failed: 0, total: missingSeeds.length });
    let done = 0; let failed = 0;
    for (const seed of missingSeeds) {
      const res = await dataFetch(`create/${config.table}`, { method: 'POST', body: JSON.stringify(seed) });
      if (res.status === 'success') done += 1; else failed += 1;
      setSeeding({ done, failed, total: missingSeeds.length });
    }
    if (done) logActivity(user, 'added', config.title, `${done} standard names`);
    await fetchItems();
    setSeeding({ done, failed, total: missingSeeds.length, finished: true });
  };

  const handleAddNew = () => {
    const initial = {};
    config.fields.forEach(f => {
      if (f.type === 'number') initial[f.name] = sortable && f.name === config.sortField ? items.length + 1 : 0;
      else if (f.type === 'checkbox') initial[f.name] = f.defaultChecked ? 1 : 0;
      else initial[f.name] = '';
    });
    openForm(initial);
  };

  const requestLeaveForm = () => (dirty ? setConfirmDiscard(true) : setView('list'));

  const handleDelete = async () => {
    const item = pendingDelete;
    setPendingDelete(null);
    const res = await dataFetch(`delete/${config.table}/${item.id}`, { method: 'DELETE' });
    if (res.status !== 'success') {
      setError(`Delete failed: ${res.error}`);
      return;
    }
    logActivity(user, 'deleted', config.title, item[titleField]);
    fetchItems();
  };

  const toggle = async (item) => {
    const field = config.toggleField;
    const next = Number(item[field]) ? 0 : 1;
    setItems(prev => prev.map(i => (i.id === item.id ? { ...i, [field]: next } : i)));
    const res = await dataFetch(`update/${config.table}/${item.id}`, { method: 'PUT', body: JSON.stringify({ [field]: next }) });
    if (res.status !== 'success') {
      setError(`Could not change that: ${res.error}`);
      fetchItems();
      return;
    }
    logActivity(user, next ? 'turned on' : 'turned off', config.title, item[titleField]);
  };

  const duplicate = async (item) => {
    const copy = { ...item, [titleField]: `${item[titleField] || 'Layout'} (copy)` };
    if (config.toggleField) copy[config.toggleField] = 0;
    if (sortable) copy[config.sortField] = items.length + 1;
    const res = await dataFetch(`create/${config.table}`, { method: 'POST', body: JSON.stringify(copy) });
    if (res.status !== 'success') {
      setError(`Could not copy that: ${res.error}`);
      return;
    }
    logActivity(user, 'copied', config.title, item[titleField]);
    fetchItems();
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const prepared = autoSlug(config.fields, formData);
    const found = validate(config.fields, prepared, items);
    if (Object.keys(found).length > 0) {
      setFormData(prepared);
      setErrors(found);
      document.getElementById(`f-${Object.keys(found)[0]}`)?.focus();
      return;
    }

    setSaving(true);
    setError('');
    // Empty inputs become NULL (dates) or 0 (numbers) so typed database columns accept them.
    const payload = { ...prepared };
    for (const f of config.fields) {
      if (payload[f.name] === '' && f.type === 'date') payload[f.name] = null;
      if (payload[f.name] === '' && f.type === 'number') payload[f.name] = 0;
    }
    let res;
    if (payload.id) {
      res = await dataFetch(`update/${config.table}/${payload.id}`, { method: 'PUT', body: JSON.stringify(payload) });
    } else {
      res = await dataFetch(`create/${config.table}`, { method: 'POST', body: JSON.stringify(payload) });
    }
    setSaving(false);
    if (res.status !== 'success') {
      setError(`Save failed: ${res.error}`);
      return;
    }
    logActivity(user, payload.id ? 'updated' : 'created', config.title, payload[titleField]);
    setInitialJson(JSON.stringify(prepared));
    setView('list');
    fetchItems();
  };

  // Reordering: update local order immediately, then persist only rows whose position changed.
  const persistOrder = async (next) => {
    const previous = items;
    setItems(next);
    const changed = next
      .map((item, i) => ({ item, pos: i + 1 }))
      .filter(({ item, pos }) => Number(item[config.sortField]) !== pos);
    const results = await Promise.all(changed.map(({ item, pos }) =>
      dataFetch(`update/${config.table}/${item.id}`, { method: 'PUT', body: JSON.stringify({ [config.sortField]: pos }) })));
    if (results.some(r => r.status !== 'success')) {
      setError('Could not save the new order. Please try again.');
      setItems(previous);
      return;
    }
    setItems(next.map((item, i) => ({ ...item, [config.sortField]: i + 1 })));
    logActivity(user, 'reordered', config.title, `${changed.length} items`);
  };

  const move = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    persistOrder(next);
  };

  const onDrop = (overId) => {
    const from = items.findIndex(i => i.id === dragId.current);
    const to = items.findIndex(i => i.id === overId);
    dragId.current = null;
    if (from < 0 || to < 0 || from === to) return;
    const next = [...items];
    next.splice(to, 0, next.splice(from, 1)[0]);
    persistOrder(next);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(item => config.fields.some(f => {
      const v = item[f.name];
      return v != null && String(v).toLowerCase().includes(q);
    }));
  }, [items, query, config.fields]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = sortable ? filtered : filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);
  const columns = config.columns || config.fields.filter(f => !['markdown', 'textarea', 'checkbox', 'image', 'slug'].includes(f.type)).slice(0, 3).map(f => f.name);
  const labelOf = (name) => config.fields.find(f => f.name === name)?.label || name;

  if (loading && view === 'list') {
    return (
      <div className="flex justify-center items-center p-12 h-64" role="status" aria-label="Loading">
        <SafeIcon icon={FiLoader} className="animate-spin text-3xl text-[#c74f2f]" />
      </div>
    );
  }

  const errorBanner = error && (
    <div role="alert" className="mb-6 p-4 rounded-lg bg-[#c74f2f]/10 border border-[#c74f2f] text-[#c74f2f] text-sm font-medium">{error}</div>
  );

  if (view === 'form') {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <button type="button" aria-label="Back to list" onClick={requestLeaveForm} className="p-2 hover:bg-[#1e2522]/10 rounded-full transition text-black hover:text-[#1e2522]">
            <SafeIcon icon={FiArrowLeft} className="text-xl" />
          </button>
          <h2 className="text-2xl font-bold">{formData.id ? 'Edit' : 'Add'} {config.title}</h2>
          {dirty && <span className="text-xs font-bold text-[#1e2522] bg-[#eaa235]/20 px-2 py-1 rounded">Unsaved changes</span>}
        </div>
        {errorBanner}
        <form onSubmit={handleSave} noValidate className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#1e2522]/10 space-y-6">
          {config.fields.map(field => (field.name === 'topic' && config.categorySelect && categories.length > 0
            ? { ...field, type: 'categories', options: [...new Set([...categories, ...parseCategories(formData.topic)])] }
            : field
          )).map(field => (
            <FieldInput key={field.name} field={field} value={formData[field.name]} onChange={handleChange} error={errors[field.name]} />
          ))}
          <div className="flex justify-end gap-4 pt-6 border-t border-[#1e2522]/10">
            <button type="button" onClick={requestLeaveForm} className="px-6 py-3 font-bold text-black hover:text-[#1e2522] transition">Cancel</button>
            <button type="submit" disabled={saving} className="bg-[#1e2522] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#1e2522] transition disabled:bg-[#1e2522]/40 flex items-center gap-2">
              {saving ? <SafeIcon icon={FiLoader} className="animate-spin" /> : <SafeIcon icon={FiSave} />}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
        {confirmDiscard && (
          <ConfirmDialog
            title="Discard changes?"
            message="You have unsaved changes. They will be lost if you leave."
            confirmLabel="Discard"
            onCancel={() => setConfirmDiscard(false)}
            onConfirm={() => { setConfirmDiscard(false); setView('list'); }}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      {errorBanner}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-[#1e2522]">Manage {config.title}</h2>
        <div className="flex flex-wrap items-center gap-3">
          {missingSeeds.length > 0 && !loading && (
          <button onClick={addSeeds} disabled={seeding && !seeding.finished} className="border border-[#1e2522]/20 bg-white text-[#1e2522] font-bold py-2.5 px-5 rounded-lg transition disabled:opacity-50">
            {seeding && !seeding.finished ? `Adding ${seeding.done + seeding.failed} of ${seeding.total}` : config.seedLabel ? config.seedLabel(missingSeeds.length) : `Add the ${missingSeeds.length} standard categories that are missing`}
          </button>
        )}
        {config.refreshFeed && (
            <button onClick={refreshFeeds} disabled={refreshing === 'busy'} className="border border-[#1e2522]/20 bg-white text-[#1e2522] font-bold py-2.5 px-5 rounded-lg transition disabled:opacity-50">
              {refreshing === 'busy' ? 'Reading the feeds' : 'Refresh from feed'}
            </button>
          )}
        {config.youtubeImport && (
            <button onClick={() => setImporting(true)} className="border border-[#1e2522]/20 bg-white text-[#1e2522] font-bold py-2.5 px-5 rounded-lg transition">
              Import from YouTube
            </button>
          )}
        {config.youtubeImport && (
            <button onClick={() => setTranscripts(t => !t)} className="border border-[#1e2522]/20 bg-white text-[#1e2522] font-bold py-2.5 px-5 rounded-lg transition">
              Import transcripts
            </button>
          )}
          {canCreate && (
            <button onClick={handleAddNew} className="bg-[#eaa235] hover:bg-[#eaa235] text-[#1e2522] font-bold py-2.5 px-5 rounded-lg flex items-center gap-2 transition shadow-sm">
              <SafeIcon icon={FiPlus} /> Add New
            </button>
          )}
        </div>
      </div>

      {refreshMsg && <p role="status" className="mb-4 text-sm font-semibold">{refreshMsg}</p>}
      {transcripts && <TranscriptImport items={items} onClose={() => setTranscripts(false)} onDone={fetchItems} />}
      {importing && <YouTubeImport existing={items} onClose={() => setImporting(false)} onImported={fetchItems} />}

      {config.bulk && items.length > 0 && <BulkBar table={config.table} title={config.title} items={items} filtered={filtered} selected={selected} setSelected={setSelected} onDone={fetchItems} categories={categories} />}

      {items.length > 0 && !sortable && (
        <div className="relative mb-4 max-w-md">
          <SafeIcon icon={FiSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-black" />
          <input
            type="search"
            aria-label={`Search ${config.title}`}
            placeholder={`Search ${config.title.toLowerCase()}...`}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(0); }}
            className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-[#1e2522]/20 bg-white focus:outline-none focus:border-[#eaa235] focus:ring-1 focus:ring-[#eaa235]"
          />
        </div>
      )}

      {sortable && items.length > 1 && (
        <p className="text-sm text-black mb-3">Drag rows by the handle, or use the arrows, to change the order. The order is saved automatically.</p>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-[#1e2522]/10 overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center text-black">
            <p className="mb-4">No {config.title.toLowerCase()} yet.</p>
            {canCreate && <button onClick={handleAddNew} className="text-[#c74f2f] font-bold hover:underline">Create your first one</button>}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-black">No {config.title.toLowerCase()} match "{query}".</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1e2522]/5 border-b border-[#1e2522]/10">
                  {config.bulk && (
                    <th className="w-10 px-4 py-4">
                      <input
                        type="checkbox"
                        aria-label={visible.length > 0 && visible.every(i => selected.has(i.id)) ? 'Deselect everything on this page' : 'Select everything on this page'}
                        checked={visible.length > 0 && visible.every(i => selected.has(i.id))}
                        onChange={(e) => setSelected(prev => { const next = new Set(prev); visible.forEach(i => (e.target.checked ? next.add(i.id) : next.delete(i.id))); return next; })}
                        className="w-5 h-5 accent-[#c74f2f]"
                      />
                    </th>
                  )}
                  {sortable && <th className="w-24 px-4 py-4"><span className="sr-only">Order</span></th>}
                  {config.thumbField && <th className="w-20 px-4 py-4"><span className="sr-only">Image</span></th>}
                  {columns.map(name => (
                    <th key={name} className="px-6 py-4 text-sm font-bold text-black tracking-wide">{labelOf(name)}</th>
                  ))}
                  {config.toggleField && <th className="px-4 py-4 text-sm font-bold text-black tracking-wide">On</th>}
                  <th className="px-6 py-4 text-right text-sm font-bold text-black tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item, index) => {
                  const status = statusOf(item);
                  return (
                    <tr
                      key={item.id}
                      draggable={sortable}
                      onDragStart={() => { dragId.current = item.id; }}
                      onDragOver={(e) => sortable && e.preventDefault()}
                      onDrop={() => sortable && onDrop(item.id)}
                      className="border-b border-[#1e2522]/10 hover:bg-[#1e2522]/5 transition"
                    >
                      {config.bulk && (
                        <td className="px-4 py-4">
                          <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSelected(item.id)} aria-label={`Select ${item[titleField] || 'item'}`} className="w-5 h-5 accent-[#c74f2f]" />
                        </td>
                      )}
                      {sortable && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-black">
                            <span className="cursor-grab" aria-hidden="true"><SafeIcon icon={FiMenu} /></span>
                            <button type="button" aria-label={`Move ${item[titleField] || 'item'} up`} disabled={index === 0} onClick={() => move(index, -1)} className="p-1 hover:text-[#1e2522] disabled:opacity-30"><SafeIcon icon={FiChevronUp} /></button>
                            <button type="button" aria-label={`Move ${item[titleField] || 'item'} down`} disabled={index === items.length - 1} onClick={() => move(index, 1)} className="p-1 hover:text-[#1e2522] disabled:opacity-30"><SafeIcon icon={FiChevronDown} /></button>
                          </div>
                        </td>
                      )}
                      {config.thumbField && (
                        <td className="px-4 py-3">
                          {item[config.thumbField]
                            ? <img src={item[config.thumbField]} alt="" loading="lazy" className="w-14 h-14 object-cover rounded-lg bg-[#1e2522]/5" />
                            : <div className="w-14 h-14 rounded-lg bg-[#1e2522]/5" />}
                        </td>
                      )}
                      {columns.map((name, i) => {
                        const text = plainText(String(item[name] ?? ''));
                        return (
                          <td key={name} className="px-6 py-4 text-[#1e2522] text-sm">
                            {text ? (text.length > 50 ? `${text.slice(0, 50)}...` : text) : '-'}
                            {i === 0 && status && (
                              <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded ${status === 'Draft' ? 'bg-[#1e2522]/10 text-[#1e2522]' : 'bg-[#eaa235]/20 text-[#1e2522]'}`}>{status}</span>
                            )}
                          </td>
                        );
                      })}
                      {config.toggleField && (
                        <td className="px-4 py-4">
                          <button type="button" role="switch" aria-checked={Boolean(Number(item[config.toggleField]))} aria-label={`${item[titleField] || 'Item'} is ${Number(item[config.toggleField]) ? 'on' : 'off'}`} onClick={() => toggle(item)} className={`relative w-11 h-6 rounded-full transition-colors ${Number(item[config.toggleField]) ? 'bg-[#1e2522]' : 'bg-[#1e2522]/20'}`}>
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${Number(item[config.toggleField]) ? 'translate-x-5' : ''}`} />
                          </button>
                        </td>
                      )}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {config.duplicable && (
                            <button onClick={() => duplicate(item)} aria-label={`Make a copy of ${item[titleField] || 'item'}`} className="px-3 py-2 text-sm font-bold text-black hover:text-[#c74f2f] bg-white border border-[#1e2522]/10 rounded-lg transition" title="Save as a copy">Copy</button>
                          )}
                          <button onClick={() => openForm({ ...item })} aria-label={`Edit ${item[titleField] || 'item'}`} className="p-2 text-black hover:text-[#c74f2f] bg-white hover:bg-[#eaa235]/10 border border-[#1e2522]/10 rounded-lg transition" title="Edit">
                            <SafeIcon icon={FiEdit2} />
                          </button>
                          <button onClick={() => setPendingDelete(item)} aria-label={`Delete ${item[titleField] || 'item'}`} className="p-2 text-black hover:text-[#c74f2f] bg-white hover:bg-[#c74f2f]/10 border border-[#1e2522]/10 rounded-lg transition" title="Delete">
                            <SafeIcon icon={FiTrash2} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!sortable && filtered.length > PAGE_SIZE && (
        <nav aria-label="Pagination" className="flex items-center justify-between mt-4 text-sm">
          <span className="text-black">Page {safePage + 1} of {pageCount} ({filtered.length} items)</span>
          <div className="flex gap-2">
            <button disabled={safePage === 0} onClick={() => setPage(safePage - 1)} className="px-4 py-2 rounded-lg border border-[#1e2522]/20 bg-white font-bold disabled:opacity-40">Previous</button>
            <button disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)} className="px-4 py-2 rounded-lg border border-[#1e2522]/20 bg-white font-bold disabled:opacity-40">Next</button>
          </div>
        </nav>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title={`Delete this ${config.title.replace(/s$/, '').toLowerCase()}?`}
          message={`"${pendingDelete[titleField] || 'This item'}" will be permanently removed.`}
          onCancel={() => setPendingDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
