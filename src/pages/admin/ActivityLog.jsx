import React from 'react';
import useFetch from '../../hooks/useFetch';
import { ACTIVITY_TABLE } from '../../lib/activity';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiLoader } = FiIcons;

export default function ActivityLog() {
  const { data, loading, error, reload } = useFetch(`read/${ACTIVITY_TABLE}?sort=id:desc&limit=100`, { admin: true });

  if (loading) return <div className="flex justify-center p-12" role="status" aria-label="Loading"><SafeIcon icon={FiLoader} className="animate-spin text-3xl text-[#CCA866]" /></div>;
  if (error) {
    return (
      <div role="alert" className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
        Could not load activity: {error} <button onClick={reload} className="underline font-bold ml-2">Retry</button>
      </div>
    );
  }
  if (!data?.length) return <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500">No activity recorded yet.</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <th className="px-6 py-4">When</th><th className="px-6 py-4">Who</th><th className="px-6 py-4">What</th><th className="px-6 py-4">Item</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.id} className="border-b border-gray-50">
              <td className="px-6 py-3 whitespace-nowrap text-gray-500">{row.created_at ? new Date(row.created_at).toLocaleString() : '-'}</td>
              <td className="px-6 py-3">{row.actor}</td>
              <td className="px-6 py-3">{row.action} in {row.area}</td>
              <td className="px-6 py-3 text-gray-600">{row.item_label || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
