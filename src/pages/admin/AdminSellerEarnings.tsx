import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
import { Wallet, User, Clock } from 'lucide-react';
import LocationFilter from '../../components/admin/LocationFilter';

interface SellerEarningsRow {
  seller_id: string;
  seller_name: string | null;
  seller_location_id: string | null;
  completed_payouts: number;
  pending_payouts: number;
  in_progress_payouts: number;
  total_sales_amount: number;
  total_net_payout: number;
  total_commission: number;
  last_payout_at: string | null;
}

const AdminSellerEarnings: React.FC = () => {
  const [rows, setRows] = useState<SellerEarningsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [rangeFilter, setRangeFilter] = useState<'365' | '90' | '30' | 'all' | 'custom'>('365');
  const [filterLocation, setFilterLocation] = useState<string | null>(null);
  const [customFrom, setCustomFrom] = useState<string>('');
  const [customTo, setCustomTo] = useState<string>('');

  useEffect(() => {
    const loadEarnings = async () => {
      try {
        setError(null);
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const { data, error: qError } = await supabase
          .from('payouts')
          .select(`
            seller_id,
            status,
            sale_price,
            commission_amount,
            net_payout,
            created_at,
            seller:profiles(id, name, primary_branch_id)
          `)
          .gte('created_at', oneYearAgo.toISOString())
          .limit(2000);

        if (qError) {
          console.error('Error loading seller earnings', qError);
          setError('Failed to load seller earnings');
          setLoading(false);
          return;
        }

        const bySeller = new Map<string, SellerEarningsRow>();

        (data || []).forEach((p: any) => {
          const sellerId = String(p.seller_id);
          if (!sellerId) return;
          const existing = bySeller.get(sellerId) || {
            seller_id: sellerId,
            seller_name: p.seller?.name ?? null,
            seller_location_id: p.seller?.primary_branch_id ?? null,
            completed_payouts: 0,
            pending_payouts: 0,
            in_progress_payouts: 0,
            total_sales_amount: 0,
            total_net_payout: 0,
            total_commission: 0,
            last_payout_at: null,
          };

          const sale = p.sale_price != null ? Number(p.sale_price) : 0;
          const net = p.net_payout != null ? Number(p.net_payout) : 0;
          const commission = p.commission_amount != null ? Number(p.commission_amount) : 0;

          if (p.status === 'completed') {
            existing.completed_payouts += 1;
          } else if (p.status === 'in_progress') {
            existing.in_progress_payouts += 1;
          } else {
            existing.pending_payouts += 1;
          }

          existing.total_sales_amount += sale;
          existing.total_net_payout += net;
          existing.total_commission += commission;

          const createdAt = p.created_at as string | null;
          if (createdAt) {
            if (!existing.last_payout_at || new Date(createdAt) > new Date(existing.last_payout_at)) {
              existing.last_payout_at = createdAt;
            }
          }

          bySeller.set(sellerId, existing);
        });

        const mapped = Array.from(bySeller.values()).sort((a, b) => (b.total_sales_amount || 0) - (a.total_sales_amount || 0));
        setRows(mapped);
      } catch (e) {
        console.error('Unexpected error loading seller earnings', e);
        setError('Unexpected error while loading seller earnings');
      } finally {
        setLoading(false);
      }
    };

    loadEarnings();
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // Location filter
      if (filterLocation && row.seller_location_id !== filterLocation) {
        return false;
      }

      // Status filter
      if (statusFilter === 'completed' && row.completed_payouts <= 0) return false;
      if (statusFilter === 'in_progress' && row.in_progress_payouts <= 0) return false;
      if (statusFilter === 'pending' && row.pending_payouts <= 0) return false;

      // Date range filter (based on last_payout_at)
      if (rangeFilter !== 'all') {
        const last = row.last_payout_at ? new Date(row.last_payout_at) : null;
        if (!last) {
          return false;
        }

        const now = new Date();
        let fromDate: Date | null = null;
        let toDate: Date | null = null;

        if (rangeFilter === '365') {
          fromDate = new Date(now);
          fromDate.setDate(fromDate.getDate() - 365);
        } else if (rangeFilter === '90') {
          fromDate = new Date(now);
          fromDate.setDate(fromDate.getDate() - 90);
        } else if (rangeFilter === '30') {
          fromDate = new Date(now);
          fromDate.setDate(fromDate.getDate() - 30);
        } else if (rangeFilter === 'custom') {
          if (customFrom) {
            fromDate = new Date(customFrom);
          }
          if (customTo) {
            toDate = new Date(customTo);
            // include the whole day
            toDate.setHours(23, 59, 59, 999);
          }
        }

        if (fromDate && last < fromDate) return false;
        if (toDate && last > toDate) return false;
      }

      return true;
    });
  }, [rows, statusFilter, rangeFilter, filterLocation, customFrom, customTo]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Wallet className="h-6 w-6 text-emerald-500" />
            Seller Earnings
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Overview of seller-level sales, commissions, and net payouts from the payouts ledger.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:inline-flex items-center px-2 py-1 text-[11px] rounded-full bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">
            Commission shown here is platform revenue from seller payouts
          </div>
          <LocationFilter onFilterChange={setFilterLocation} className="min-w-[150px]" />
          <div className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
            <span>Status:</span>
            <select
              className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'in_progress' | 'completed')}
            >
              <option value="all">All payouts</option>
              <option value="completed">Has completed</option>
              <option value="in_progress">Has in progress</option>
              <option value="pending">Only pending</option>
            </select>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
            <span>Range:</span>
            <select
              className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
              value={rangeFilter}
              onChange={(e) => setRangeFilter(e.target.value as '365' | '90' | '30' | 'all' | 'custom')}
            >
              <option value="365">Last 1 year</option>
              <option value="90">Last 90 days</option>
              <option value="30">Last 30 days</option>
              <option value="all">All (loaded)</option>
              <option value="custom">Custom…</option>
            </select>
            {rangeFilter === 'custom' && (
              <div className="flex items-center gap-1 ml-2">
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="border border-gray-300 dark:border-gray-700 rounded px-1 py-0.5 text-xs bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                />
                <span>to</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="border border-gray-300 dark:border-gray-700 rounded px-1 py-0.5 text-xs bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {loading && <div className="py-10 text-center text-gray-500">Loading seller earnings…</div>}
      {!loading && error && <div className="py-4 text-sm text-red-600">{error}</div>}
      {!loading && !error && rows.length === 0 && (
        <div className="py-10 text-center text-gray-500 text-sm">
          No payouts recorded yet. Once auctions settle and payouts are created, seller earnings will appear here.
        </div>
      )}

      {!loading && !error && filteredRows.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/60">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Seller</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Payouts</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Sales & Commission</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Last payout</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredRows.map((row) => (
                <tr key={row.seller_id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center gap-1 text-gray-800 dark:text-gray-100 text-sm">
                      <User className="h-4 w-4" />
                      <span>{row.seller_name || 'Unknown seller'}</span>
                    </div>
                    <div className="text-[11px] text-gray-500">Seller ID: {row.seller_id}</div>
                  </td>
                  <td className="px-4 py-3 align-top text-xs text-gray-700 dark:text-gray-200">
                    <div>Completed: {row.completed_payouts}</div>
                    <div>In progress: {row.in_progress_payouts}</div>
                    <div>Pending: {row.pending_payouts}</div>
                  </td>
                  <td className="px-4 py-3 align-top text-xs text-gray-700 dark:text-gray-200">
                    <div>Total sales: ₹{row.total_sales_amount.toLocaleString()}</div>
                    <div>Net payout: ₹{row.total_net_payout.toLocaleString()}</div>
                    <div>Commission: ₹{row.total_commission.toLocaleString()}</div>
                  </td>
                  <td className="px-4 py-3 align-top text-xs text-gray-700 dark:text-gray-200">
                    {row.last_payout_at ? (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(row.last_payout_at).toLocaleString()}</span>
                      </div>
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top text-xs text-gray-700 dark:text-gray-200">
                    <div className="flex flex-col gap-1">
                      <Link
                        to={`/seller/${row.seller_id}`}
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 underline"
                      >
                        View profile
                      </Link>
                      <Link
                        to={`/admin/winners?sellerId=${encodeURIComponent(row.seller_id)}`}
                        className="inline-flex items-center gap-1 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white underline"
                      >
                        View payouts & ETA
                      </Link>
                    </div>
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

export default AdminSellerEarnings;
