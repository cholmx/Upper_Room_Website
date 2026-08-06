import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dataFetch } from '../../api';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSave, FiLoader } = FiIcons;

const HeroManager = () => {
  const [hero, setHero] = useState({ heading: '', subtext: '', image_url: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroId, setHeroId] = useState(null);

  useEffect(() => {
    const fetchHero = async () => {
      setLoading(true);
      const res = await dataFetch('read/hero_config?limit=1');
      if (res.status === 'success' && res.data.length > 0) {
        setHero(res.data[0]);
        setHeroId(res.data[0].id);
      }
      setLoading(false);
    };
    fetchHero();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHero(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const payload = {
      heading: hero.heading,
      subtext: hero.subtext,
      image_url: hero.image_url,
    };

    let res;
    if (heroId) {
      res = await dataFetch(`update/hero_config/${heroId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } else {
      res = await dataFetch('create/hero_config', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.status === 'success') {
        setHeroId(res.data.id);
      }
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <SafeIcon icon={FiLoader} className="animate-spin text-2xl text-gray-500" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <form onSubmit={handleSave} className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <label htmlFor="heading" className="block text-sm font-bold text-gray-800 mb-2">
            Main Heading
          </label>
          <input
            type="text"
            name="heading"
            id="heading"
            value={hero.heading}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-50 rounded-lg border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CCA866] transition"
            placeholder="e.g., Transforming lives..."
          />
        </div>

        <div>
          <label htmlFor="subtext" className="block text-sm font-bold text-gray-800 mb-2">
            Subtext
          </label>
          <input
            type="text"
            name="subtext"
            id="subtext"
            value={hero.subtext}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-50 rounded-lg border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CCA866] transition"
            placeholder="e.g., Join us Sundays..."
          />
        </div>

        <div>
          <label htmlFor="image_url" className="block text-sm font-bold text-gray-800 mb-2">
            Background Image URL
          </label>
          <input
            type="text"
            name="image_url"
            id="image_url"
            value={hero.image_url}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-50 rounded-lg border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CCA866] transition"
            placeholder="https://images.unsplash.com/..."
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#0B1613] text-white font-bold py-3 px-6 rounded-lg hover:bg-black transition-colors disabled:bg-gray-400 flex items-center gap-2"
          >
            {saving ? (
              <>
                <SafeIcon icon={FiLoader} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <SafeIcon icon={FiSave} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default HeroManager;