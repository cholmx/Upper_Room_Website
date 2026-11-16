import React from 'react';
import useFetch from '../../hooks/useFetch';
import { ACTIVITY_TABLE } from '../../lib/activity';
import SafeIcon from '../../common/SafeIcon';
import { FiLoader } from 'react-icons/fi';


export default function ActivityLog() {
  const { data, loading, error, reload } = useFetch(`read/${ACTIVITY_TABLE}?sort=id:desc&limit=100`, { admin: true });

  if (loading) return <div className="flex justify-center p-12" role="status" aria-label="Loading"><SafeIcon icon={FiLoader} className="animate-spin text-3xl text-[#C65D3B]" /></div>;
  if (error) {
    return (
      <div role="alert" className="p-4 rounded-lg bg-[#C65D3B]/10 border border-[#C65D3B] text-[#C65D3B] text-sm font-medium">
        Could not load activity: {error} <button onClick={reload} className="underline font-bold ml-2">Retry</button>
      </div>
    );
  }
  if (!data?.length) return <div className="bg-white rounded-2xl border border-[#1C2A2B]/10 p-12 text-center text-black">No activity recorded yet.</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#1C2A2B]/10 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-[#1C2A2B]/5 border-b border-[#1C2A2B]/10 text-sm font-bold text-black tracking-wide">
            <th className="px-6 py-4">When</th><th className="px-6 py-4">Who</th><th className="px-6 py-4">What</th><th className="px-6 py-4">Item</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.id} className="border-b border-[#1C2A2B]/10">
              <td className="px-6 py-3 whitespace-nowrap text-black">{row.created_at ? new Date(row.created_at).toLocaleString() : '-'}</td>
              <td className="px-6 py-3">{row.actor}</td>
              <td className="px-6 py-3">{row.action} in {row.area}</td>
              <td className="px-6 py-3 text-black">{row.item_label || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
