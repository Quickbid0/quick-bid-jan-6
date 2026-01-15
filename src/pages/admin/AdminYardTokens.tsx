import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';

interface YardToken {
  id: string;
  user_id: string;
  yard_id: string;
  amount: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

const AdminYardTokens: React.FC = () => {
  const [tokens, setTokens] = useState<YardToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'held' | 'refunded' | 'forfeited'>('all');
  const [yardFilter, setYardFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('yard_tokens')
          .select('id, user_id, yard_id, amount, status, created_at, updated_at')
          .order('created_at', { ascending: false });

        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }
        if (yardFilter.trim()) {
          query = query.ilike('yard_id', `%${yardFilter.trim()}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        setTokens(data || []);
      } catch (e) {
        console.error('Error loading yard tokens', e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [statusFilter, yardFilter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Yard Tokens</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            View and audit yard token deposits, refunds, and forfeitures across yards.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center text-sm">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All statuses</option>
            <option value="held">Held</option>
            <option value="refunded">Refunded</option>
            <option value="forfeited">Forfeited</option>
          </select>
          <input
            type="text"
            value={yardFilter}
            onChange={(e) => setYardFilter(e.target.value)}
            placeholder="Filter by yard id"
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 min-w-[220px]"
          />
        </div>
      </div>

      {tokens.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No yard tokens found for the selected filters.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Yard</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Updated</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {tokens.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-4 py-3 font-mono text-xs break-all">{t.user_id}</td>
                  <td className="px-4 py-3 font-mono text-xs break-all">{t.yard_id}</td>
                  <td className="px-4 py-3 text-right">₹{(t.amount || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 capitalize">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      t.status === 'held'
                        ? 'bg-yellow-100 text-yellow-800'
                        : t.status === 'refunded'
                        ? 'bg-green-100 text-green-800'
                        : t.status === 'forfeited'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {t.created_at ? new Date(t.created_at).toLocaleString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {t.updated_at ? new Date(t.updated_at).toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminYardTokens;
