import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { dataFetch } from '../../api';
import { useAuth } from '../../auth';
import { logActivity } from '../../lib/activity';
import { isLive } from '../../utils';
import { plainText } from '../../lib/markdown';
import ConfirmDialog from '../../components/ConfirmDialog';
import FieldInput from './FieldInput';
import { validate, autoSlug } from './validate';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiEdit2, FiTrash2, FiPlus, FiArrowLeft, FiSave, FiLoader, FiSearch, FiChevronUp, FiChevronDown, FiMenu } = FiIcons;

const PAGE_SIZE = 10;

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
  const dragId = useRef(null);

  const sortable = Boolean(config.sortField);
  const canCreate = config.canCreate !== false;
  const titleField = config.titleField || config.fields[0].name;
  const dirty = view === 'form' && JSON.stringify(formData) !== initialJson;

  useEffect(() => {
    fetchItems();
  }, [config.table]);

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
      setItems(res.data ?? []);
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
    const payload = { ...prepared };
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
        <SafeIcon icon={FiLoader} className="animate-spin text-3xl text-[#CCA866]" />
      </div>
    );
  }

  const errorBanner = error && (
    <div role="alert" className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">{error}</div>
  );

  if (view === 'form') {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <div className="flex items-center gap-4 mb-6">
          <button type="button" aria-label="Back to list" onClick={requestLeaveForm} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-500 hover:text-black">
            <SafeIcon icon={FiArrowLeft} className="text-xl" />
          </button>
          <h2 className="text-2xl font-bold">{formData.id ? 'Edit' : 'Add'} {config.title}</h2>
          {dirty && <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded">Unsaved changes</span>}
        </div>
        {errorBanner}
        <form onSubmit={handleSave} noValidate className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          {config.fields.map(field => (
            <FieldInput key={field.name} field={field} value={formData[field.name]} onChange={handleChange} error={errors[field.name]} />
          ))}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button type="button" onClick={requestLeaveForm} className="px-6 py-3 font-bold text-gray-600 hover:text-black transition">Cancel</button>
            <button type="submit" disabled={saving} className="bg-[#0B1613] text-white font-bold py-3 px-8 rounded-lg hover:bg-black transition disabled:bg-gray-400 flex items-center gap-2">
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
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      {errorBanner}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage {config.title}</h2>
        {canCreate && (
          <button onClick={handleAddNew} className="bg-[#CCA866] hover:bg-[#b59253] text-black font-bold py-2.5 px-5 rounded-lg flex items-center gap-2 transition shadow-sm">
            <SafeIcon icon={FiPlus} /> Add New
          </button>
        )}
      </div>

      {items.length > 0 && !sortable && (
        <div className="relative mb-4 max-w-md">
          <SafeIcon icon={FiSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            aria-label={`Search ${config.title}`}
            placeholder={`Search ${config.title.toLowerCase()}...`}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(0); }}
            className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-[#CCA866] focus:ring-1 focus:ring-[#CCA866]"
          />
        </div>
      )}

      {sortable && items.length > 1 && (
        <p className="text-sm text-gray-500 mb-3">Drag rows by the handle, or use the arrows, to change the order. The order is saved automatically.</p>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="mb-4">No {config.title.toLowerCase()} yet.</p>
            {canCreate && <button onClick={handleAddNew} className="text-[#CCA866] font-bold hover:underline">Create your first one</button>}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No {config.title.toLowerCase()} match "{query}".</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {sortable && <th className="w-24 px-4 py-4"><span className="sr-only">Order</span></th>}
                  {config.thumbField && <th className="w-20 px-4 py-4"><span className="sr-only">Image</span></th>}
                  {columns.map(name => (
                    <th key={name} className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{labelOf(name)}</th>
                  ))}
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
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
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition"
                    >
                      {sortable && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-gray-400">
                            <span className="cursor-grab" aria-hidden="true"><SafeIcon icon={FiMenu} /></span>
                            <button type="button" aria-label={`Move ${item[titleField] || 'item'} up`} disabled={index === 0} onClick={() => move(index, -1)} className="p-1 hover:text-black disabled:opacity-30"><SafeIcon icon={FiChevronUp} /></button>
                            <button type="button" aria-label={`Move ${item[titleField] || 'item'} down`} disabled={index === items.length - 1} onClick={() => move(index, 1)} className="p-1 hover:text-black disabled:opacity-30"><SafeIcon icon={FiChevronDown} /></button>
                          </div>
                        </td>
                      )}
                      {config.thumbField && (
                        <td className="px-4 py-3">
                          {item[config.thumbField]
                            ? <img src={item[config.thumbField]} alt="" loading="lazy" className="w-14 h-14 object-cover rounded-lg bg-gray-100" />
                            : <div className="w-14 h-14 rounded-lg bg-gray-100" />}
                        </td>
                      )}
                      {columns.map((name, i) => {
                        const text = plainText(String(item[name] ?? ''));
                        return (
                          <td key={name} className="px-6 py-4 text-gray-800 text-sm">
                            {text ? (text.length > 50 ? `${text.slice(0, 50)}...` : text) : '-'}
                            {i === 0 && status && (
                              <span className={`ml-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded ${status === 'Draft' ? 'bg-gray-200 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>{status}</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openForm({ ...item })} aria-label={`Edit ${item[titleField] || 'item'}`} className="p-2 text-gray-400 hover:text-[#CCA866] bg-white hover:bg-[#CCA866]/10 border border-gray-100 rounded-lg transition" title="Edit">
                            <SafeIcon icon={FiEdit2} />
                          </button>
                          <button onClick={() => setPendingDelete(item)} aria-label={`Delete ${item[titleField] || 'item'}`} className="p-2 text-gray-400 hover:text-red-500 bg-white hover:bg-red-50 border border-gray-100 rounded-lg transition" title="Delete">
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
          <span className="text-gray-500">Page {safePage + 1} of {pageCount} ({filtered.length} items)</span>
          <div className="flex gap-2">
            <button disabled={safePage === 0} onClick={() => setPage(safePage - 1)} className="px-4 py-2 rounded-lg border border-gray-200 bg-white font-bold disabled:opacity-40">Previous</button>
            <button disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)} className="px-4 py-2 rounded-lg border border-gray-200 bg-white font-bold disabled:opacity-40">Next</button>
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
    </motion.div>
  );
}
