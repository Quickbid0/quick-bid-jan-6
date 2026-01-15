import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, Loader2, IndianRupee, Users, CheckCircle2, Clock } from 'lucide-react';

interface SellerPayoutSummary {
  seller_id: string;
  seller_name: string | null;
  seller_email: string | null;
  seller_phone: string | null;
  total_auctions: number | null;
  total_sales: number | null;
  completed_count: number;
  completed_net_total: number;
  pending_count: number;
  pending_net_total: number;
  in_progress_count: number;
  in_progress_net_total: number;
  other_count: number;
}

const AdminSellerPayouts: React.FC = () => {
  const [rows, setRows] = useState<SellerPayoutSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'has_pending' | 'only_completed'>('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        setLoading(true);

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('AdminSellerPayouts: getSession error', sessionError);
        }

        const token = sessionData.session?.access_token;
        if (!token) {
          setError('You must be logged in as admin to view seller payouts.');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/admin/seller-payouts-summary', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          console.error('AdminSellerPayouts: list error', body);
          setError(body.error || 'Failed to load seller payouts summary');
          setLoading(false);
          return;
        }

        const data = (await res.json()) as SellerPayoutSummary[];
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('AdminSellerPayouts: unexpected error loading summary', e);
        setError('Unexpected error while loading seller payouts summary');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredRows = rows.filter((row) => {
    if (statusFilter === 'has_pending' && row.pending_count === 0 && row.in_progress_count === 0) {
      return false;
    }
    if (
      statusFilter === 'only_completed' &&
      (row.pending_count > 0 || row.in_progress_count > 0 || row.other_count > 0)
    ) {
      return false;
    }

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      row.seller_id.toLowerCase().includes(q) ||
      (row.seller_name || '').toLowerCase().includes(q) ||
      (row.seller_email || '').toLowerCase().includes(q)
    );
  });

  const totals = rows.reduce(
    (acc, r) => {
      acc.completedNet += r.completed_net_total;
      acc.pendingNet += r.pending_net_total + r.in_progress_net_total;
      if (r.pending_count > 0 || r.in_progress_count > 0) {
        acc.sellersWithPending += 1;
      }
      return acc;
    },
    { completedNet: 0, pendingNet: 0, sellersWithPending: 0 },
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <IndianRupee className="h-6 w-6 text-emerald-500" />
            Seller Payouts
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Overview of payouts owed to sellers. Use this to reconcile finance and spot pending settlements.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 text-xs text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-3">
            <div>
              <span className="block text-[11px] text-gray-500">Completed net payout</span>
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                ₹{totals.completedNet.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="block text-[11px] text-gray-500">Pending / in progress</span>
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                ₹{totals.pendingNet.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="block text-[11px] text-gray-500">Sellers with pending payouts</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {totals.sellersWithPending}
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
              <option value="has_pending">Has pending / in progress</option>
              <option value="only_completed">Only fully completed</option>
            </select>
            <input
              type="text"
              placeholder="Search by seller ID / name / email"
              className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-[11px] bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-w-[220px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="py-10 text-center text-gray-500 flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          <span className="text-sm">Loading seller payouts…</span>
        </div>
      )}

      {!loading && error && (
        <div className="py-4 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && filteredRows.length === 0 && (
        <div className="py-10 text-center text-gray-500 text-sm">
          No seller payouts found for this filter.
        </div>
      )}

      {!loading && !error && filteredRows.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/60">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Seller</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Sales</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Completed</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Pending / In progress</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Other</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredRows.map((row) => {
                const hasPending = row.pending_count > 0 || row.in_progress_count > 0;
                return (
                  <tr key={row.seller_id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                    <td className="px-4 py-3 align-top text-xs text-gray-800 dark:text-gray-100">
                      <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {row.seller_name || 'Unknown seller'}
                      </div>
                      <div className="text-[11px] text-gray-500">ID: {row.seller_id}</div>
                      {row.seller_email && (
                        <div className="text-[11px] text-gray-500">{row.seller_email}</div>
                      )}
                      {row.seller_phone && (
                        <div className="text-[11px] text-gray-500">{row.seller_phone}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-800 dark:text-gray-100">
                      {row.total_auctions != null && (
                        <div className="text-[11px]">Auctions: {row.total_auctions}</div>
                      )}
                      {row.total_sales != null && (
                        <div className="text-[11px]">Sales: ₹{row.total_sales.toLocaleString()}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-800 dark:text-gray-100">
                      <div className="flex flex-col gap-0.5">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" />
                          {row.completed_count} payout{row.completed_count === 1 ? '' : 's'}
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                          ₹{row.completed_net_total.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-800 dark:text-gray-100">
                      <div className="flex flex-col gap-0.5">
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-300">
                          <Clock className="h-3 w-3" />
                          {row.pending_count + row.in_progress_count} payout
                          {row.pending_count + row.in_progress_count === 1 ? '' : 's'}
                        </span>
                        <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                          ₹{(row.pending_net_total + row.in_progress_net_total).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-800 dark:text-gray-100">
                      {row.other_count > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-50 text-gray-700 border border-gray-200 text-[11px]">
                          {row.other_count} other
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-800 dark:text-gray-100">
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/winners?sellerId=${encodeURIComponent(row.seller_id)}`)}
                          className="inline-flex items-center px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-700 text-[11px] hover:bg-gray-50 dark:hover:bg-gray-900/40"
                        >
                          View winners
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/payouts?sellerId=${encodeURIComponent(row.seller_id)}`)}
                          className="inline-flex items-center px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-700 text-[11px] hover:bg-gray-50 dark:hover:bg-gray-900/40"
                        >
                          View payout details
                        </button>
                        {hasPending && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px]">
                            Has pending payouts
                          </span>
                        )}
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
  );
};

export default AdminSellerPayouts;
