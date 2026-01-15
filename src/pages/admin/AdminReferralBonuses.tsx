import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { ArrowDownRight, ArrowUpRight, Filter, RefreshCw, ShieldAlert } from 'lucide-react';
import { supabase } from '../../config/supabaseClient';

interface ReferralBonusRow {
  id: string;
  referrerUserId: string;
  referredUserId: string;
  source: 'user' | 'agent';
  eventType: 'first_deposit' | 'first_bid';
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'frozen' | 'credited';
  approvalMode: 'auto' | 'manual';
  flaggedFraud?: boolean;
  reason?: string;
  fraudNotes?: string;
  createdAt: string;
}

interface AdminHistoryResponse {
  items: any[];
  total: number;
}

const AdminReferralBonuses: React.FC = () => {
  const [rows, setRows] = useState<ReferralBonusRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [total, setTotal] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      if (eventFilter && eventFilter !== 'all') params.set('eventType', eventFilter);
      if (sourceFilter && sourceFilter !== 'all') params.set('source', sourceFilter);
      if (fromDate) params.set('from', new Date(fromDate).toISOString());
      if (toDate) params.set('to', new Date(toDate).toISOString());
      if (searchTerm.trim()) params.set('searchTerm', searchTerm.trim());
      params.set('limit', '100');
      params.set('offset', '0');

      const res = await fetch(`/api/admin/referral/bonus/history?${params.toString()}`);
      if (!res.ok) {
        toast.error('Failed to load referral bonuses');
        return;
      }
      const json = (await res.json()) as AdminHistoryResponse;
      const mapped: ReferralBonusRow[] = (json.items || []).map((h: any) => ({
        id: String(h._id || h.id),
        referrerUserId: h.referrerUserId,
        referredUserId: h.referredUserId,
        source: h.source,
        eventType: h.eventType,
        amount: h.amount,
        currency: h.currency || 'INR',
        status: h.status,
        approvalMode: h.approvalMode,
        flaggedFraud: !!h.flaggedFraud,
        reason: h.reason,
        fraudNotes: h.fraudNotes,
        createdAt: h.createdAt || h.created_at,
      }));
      setRows(mapped);
      setTotal(json.total || mapped.length);
    } catch (e) {
      console.error('load referral bonuses error', e);
      toast.error('Error loading referral bonuses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, eventFilter, sourceFilter, fromDate, toDate, searchTerm]);

  const updateStatus = async (id: string, status: 'approved' | 'rejected' | 'credited') => {
    try {
      const res = await fetch(`/api/admin/referral/bonus/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        toast.error('Failed to update status');
        return;
      }
      toast.success(`Referral marked as ${status}`);
      await loadData();
    } catch (e) {
      console.error('update status error', e);
      toast.error('Error updating status');
    }
  };

  const toggleFreeze = async (row: ReferralBonusRow) => {
    try {
      const res = await fetch(`/api/admin/referral/bonus/${encodeURIComponent(row.id)}/freeze`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frozen: row.status !== 'frozen' }),
      });
      if (!res.ok) {
        toast.error('Failed to update freeze state');
        return;
      }
      toast.success(row.status === 'frozen' ? 'Unfrozen' : 'Frozen for review');
      await loadData();
    } catch (e) {
      console.error('freeze error', e);
      toast.error('Error updating freeze state');
    }
  };

  const getStatusBadge = (status: ReferralBonusRow['status']) => {
    switch (status) {
      case 'credited':
        return 'bg-green-100 text-green-700';
      case 'approved':
        return 'bg-blue-100 text-blue-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'frozen':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Referral Bonuses</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Review, approve, and freeze referral bonus payouts.
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-3 items-center mb-4 text-sm">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600 dark:text-gray-300">Filters:</span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2 py-1 border rounded-md text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="credited">Credited</option>
          <option value="frozen">Frozen</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className="px-2 py-1 border rounded-md text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
        >
          <option value="all">All events</option>
          <option value="first_deposit">First deposit</option>
          <option value="first_bid">First bid</option>
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-2 py-1 border rounded-md text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
        >
          <option value="all">All sources</option>
          <option value="user">User referrals</option>
          <option value="agent">Agent referrals</option>
        </select>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="px-2 py-1 border rounded-md text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="px-2 py-1 border rounded-md text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search referrer/referred ID"
          className="px-2 py-1 border rounded-md text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 min-w-[180px]"
        />
        <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
          Showing {rows.length} of {total} records
        </span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/60">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-300">Event</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-300">Amount</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-300">Users</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-300">Status</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-300">Created</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                    No referral bonuses found for current filters.
                  </td>
                </tr>
              )}
              {rows.map((row) => {
                const isCredit = row.status === 'credited' || row.status === 'approved';
                const isDebit = row.status === 'rejected';
                const icon = isCredit ? <ArrowUpRight className="h-4 w-4" /> : isDebit ? <ArrowDownRight className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />;
                return (
                  <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                          {icon}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {row.eventType === 'first_deposit' ? 'First deposit' : 'First bid'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {row.source === 'agent' ? 'Agent referral' : 'User referral'} • {row.approvalMode === 'auto' ? 'Auto' : 'Manual'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                      ₹{row.amount.toLocaleString()} {row.currency}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
                      <div>Referrer: {row.referrerUserId}</div>
                      <div>Referred: {row.referredUserId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(row.status)}`}>
                        {row.status.toUpperCase()}
                      </span>
                      {row.flaggedFraud && (
                        <div className="mt-1 text-[10px] uppercase tracking-wide text-red-500 flex items-center gap-1">
                          <ShieldAlert className="h-3 w-3" /> Suspected fraud
                        </div>
                      )}
                      {row.reason && (
                        <div className="mt-1 text-[10px] text-gray-500 dark:text-gray-400 break-words max-w-xs">
                          Reason: {row.reason}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                      {row.createdAt ? new Date(row.createdAt).toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        {row.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => updateStatus(row.id, 'approved')}
                              className="px-2 py-1 text-xs rounded-md bg-green-600 text-white hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => updateStatus(row.id, 'rejected')}
                              className="px-2 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {row.status === 'approved' && (
                          <button
                            type="button"
                            onClick={() => updateStatus(row.id, 'credited')}
                            className="px-2 py-1 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700"
                          >
                            Mark Credited
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleFreeze(row)}
                          className={`px-2 py-1 text-xs rounded-md border ${
                            row.status === 'frozen'
                              ? 'border-gray-400 text-gray-700 dark:text-gray-200'
                              : 'border-yellow-500 text-yellow-700'
                          }`}
                        >
                          {row.status === 'frozen' ? 'Unfreeze' : 'Freeze'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                    Loading...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReferralBonuses;
