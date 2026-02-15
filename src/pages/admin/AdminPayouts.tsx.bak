import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AlertCircle, Loader2, IndianRupee, Users, Clock, BarChart3 } from 'lucide-react';

interface AdminPayout {
  id: string;
  seller_id: string;
  status: string;
  sale_price: number | null;
  commission_amount: number | null;
  net_payout: number | null;
  payout_reference: string | null;
  created_at: string;
  paid_at: string | null;
  seller?: {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
}

const AdminPayouts: React.FC = () => {
  const [rows, setRows] = useState<AdminPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'in_progress'>('all');
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const sellerIdFilter = params.get('sellerId');

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        setLoading(true);

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('AdminPayouts: getSession error', sessionError);
        }

        const token = sessionData.session?.access_token;
        if (!token) {
          setError('You must be logged in as admin to view payouts.');
          setLoading(false);
          return;
        }

        const query = new URLSearchParams();
        if (sellerIdFilter) query.set('sellerId', sellerIdFilter);
        if (statusFilter !== 'all') query.set('status', statusFilter);

        const res = await fetch(`/api/admin/payouts?${query.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          console.error('AdminPayouts: backend error', body);
          setError(body.error || body.message || 'Failed to load payouts');
          setLoading(false);
          return;
        }

        const data = (await res.json()) as AdminPayout[];
        setRows(data);
      } catch (e) {
        console.error('AdminPayouts: unexpected error', e);
        setError('Unexpected error while loading payouts');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [statusFilter, sellerIdFilter]);

  const totals = rows.reduce(
    (acc, r) => {
      if (r.status === 'completed') {
        acc.completed += r.net_payout || 0;
      } else {
        acc.pending += r.net_payout || 0;
      }
      return acc;
    },
    { net: 0, completed: 0, pending: 0 },
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <IndianRupee className="h-6 w-6 text-emerald-500" />
            Seller Payout Details
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Detailed list of payouts to sellers. Filter by seller or status and jump into winners.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/sales-dashboard"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </Link>
          <Link
            to="/admin/sales-leads"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Users className="h-4 w-4 mr-2" />
            Leads
          </Link>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 text-xs text-gray-600 dark:text-gray-300">
        <div className="flex items-center gap-3">
          <div>
            <span className="block text-[11px] text-gray-500">Total net payout (this view)</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              ₹{totals.net.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="block text-[11px] text-gray-500">Completed</span>
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              ₹{totals.completed.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="block text-[11px] text-gray-500">Pending / other</span>
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              ₹{totals.pending.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span>Status:</span>
          <select
            className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-[11px] bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
          {sellerIdFilter && (
            <button
              type="button"
              onClick={() => navigate('/admin/payouts')}
              className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-[11px] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Clear seller filter
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="py-10 text-center text-gray-500 flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          <span className="text-sm">Loading payouts…</span>
        </div>
      )}

      {!loading && error && (
        <div className="py-4 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="text-center py-16">
          <IndianRupee className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No payouts found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting the status filter or seller filter, or check back later.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setStatusFilter('all')}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700"
            >
              Show All Statuses
            </button>
            {sellerIdFilter && (
              <button
                onClick={() => navigate('/admin/payouts')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Clear Seller Filter
              </button>
            )}
            <Link
              to="/admin/sales-dashboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/60">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Seller</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Payout</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Status</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Date</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-2">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {row.seller?.name || 'Unknown'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {row.seller?.email || row.seller?.phone || 'No contact'}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      ₹{(row.net_payout || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {row.sale_price ? `Sale: ₹${row.sale_price.toLocaleString()}` : ''}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        row.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          : row.status === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-400 text-xs">
                    {row.paid_at ? new Date(row.paid_at).toLocaleDateString() : new Date(row.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => navigate(`/admin/payouts?sellerId=${row.seller_id}`)}
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                    >
                      Filter by seller
                    </button>
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

export default AdminPayouts;
