import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dataFetch } from '../../api';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiEdit2, FiTrash2, FiPlus, FiArrowLeft, FiSave, FiLoader } = FiIcons;

export default function GenericManager({ config }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' | 'form'
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItems();
  }, [config.table]);

  const fetchItems = async () => {
    setLoading(true);
    // Sort by id desc (newest first) by default
    const res = await dataFetch(`read/${config.table}?sort=id:desc`);
    if (res.status === 'success') {
      setItems(res.data ?? []);
      setError('');
    } else {
      setError(`Could not load ${config.title}: ${res.error}`);
    }
    setLoading(false);
  };

  const handleAddNew = () => {
    const initialData = {};
    config.fields.forEach(f => {
      initialData[f.name] = f.type === 'number' ? 0 : '';
    });
    setFormData(initialData);
    setView('form');
  };

  const handleEdit = (item) => {
    setFormData({ ...item });
    setView('form');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const res = await dataFetch(`delete/${config.table}/${id}`, { method: 'DELETE' });
      if (res.status !== 'success') {
        setError(`Delete failed: ${res.error}`);
        return;
      }
      fetchItems();
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = { ...formData };

    let res;
    if (payload.id) {
      res = await dataFetch(`update/${config.table}/${payload.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    } else {
      res = await dataFetch(`create/${config.table}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }

    setSaving(false);
    if (res.status !== 'success') {
      setError(`Save failed: ${res.error}`);
      return;
    }
    setView('list');
    fetchItems();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12 h-64">
        <SafeIcon icon={FiLoader} className="animate-spin text-3xl text-[#CCA866]" />
      </div>
    );
  }

  if (view === 'form') {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <div className="flex items-center gap-4 mb-6">
          <button type="button" aria-label="Back to list" onClick={() => setView('list')} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-500 hover:text-black">
            <SafeIcon icon={FiArrowLeft} className="text-xl" />
          </button>
          <h2 className="text-2xl font-bold">{formData.id ? 'Edit' : 'Add'} {config.title}</h2>
        </div>

        {error && (
          <div role="alert" className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">{error}</div>
        )}

        <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          {config.fields.map(field => (
            <div key={field.name}>
              <label htmlFor={`f-${field.name}`} className="block text-sm font-bold text-gray-800 mb-2">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  id={`f-${field.name}`}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:border-[#CCA866] focus:ring-1 focus:ring-[#CCA866] transition"
                />
              ) : (
                <input
                  type={field.type}
                  id={`f-${field.name}`}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:border-[#CCA866] focus:ring-1 focus:ring-[#CCA866] transition"
                />
              )}
            </div>
          ))}

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setView('list')}
              className="px-6 py-3 font-bold text-gray-600 hover:text-black transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#0B1613] text-white font-bold py-3 px-8 rounded-lg hover:bg-black transition disabled:bg-gray-400 flex items-center gap-2"
            >
              {saving ? <SafeIcon icon={FiLoader} className="animate-spin" /> : <SafeIcon icon={FiSave} />}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      {error && (
          <div role="alert" className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">{error}</div>
        )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage {config.title}</h2>
        <button onClick={handleAddNew} className="bg-[#CCA866] hover:bg-[#b59253] text-black font-bold py-2.5 px-5 rounded-lg flex items-center gap-2 transition shadow-sm">
          <SafeIcon icon={FiPlus} /> Add New
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="mb-4">No {config.title.toLowerCase()} found.</p>
            <button onClick={handleAddNew} className="text-[#CCA866] font-bold hover:underline">Create your first one</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {config.fields.slice(0, 3).map(f => (
                    <th key={f.name} className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{f.label}</th>
                  ))}
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    {config.fields.slice(0, 3).map(f => (
                      <td key={f.name} className="px-6 py-4 text-gray-800 text-sm">
                        {item[f.name]?.toString().substring(0, 50) || '-'}
                        {item[f.name]?.toString().length > 50 ? '...' : ''}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(item)} className="p-2 text-gray-400 hover:text-[#CCA866] bg-white hover:bg-[#CCA866]/10 border border-gray-100 rounded-lg transition" title="Edit">
                          <SafeIcon icon={FiEdit2} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-500 bg-white hover:bg-red-50 border border-gray-100 rounded-lg transition" title="Delete">
                          <SafeIcon icon={FiTrash2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}