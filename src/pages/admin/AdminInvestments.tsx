import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { toast } from 'react-hot-toast';
import { RefreshCw, CheckCircle2, Banknote, Loader2 } from 'lucide-react';

interface AdminInvestment {
  id: string;
  investor_id: string;
  plan_type: string;
  amount: number;
  status: string;
  tenure_months: number | null;
  created_at: string;
  kyc_status?: string | null;
  agreement_status?: string | null;
}

const AdminInvestments: React.FC = () => {
  const [rows, setRows] = useState<AdminInvestment[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'completed' | 'cancelled'>('all');
  const [kycFilter, setKycFilter] = useState<'all' | 'pending' | 'in_review' | 'verified' | 'rejected'>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [payoutModalId, setPayoutModalId] = useState<string | null>(null);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutNote, setPayoutNote] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('investments')
        .select('id, investor_id, plan_type, amount, status, tenure_months, created_at, agreement_status')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      const baseRows = (data as AdminInvestment[]) || [];

      // Fetch KYC status for each investor
      const investorIds = Array.from(new Set(baseRows.map((r) => r.investor_id))).filter(Boolean);
      const kycByInvestorId: Record<string, string | null> = {};
      if (investorIds.length > 0) {
        const { data: investors, error: invErr } = await supabase
          .from('investors')
          .select('id, kyc_status')
          .in('id', investorIds);
        if (invErr) throw invErr;
        (investors || []).forEach((inv: any) => {
          kycByInvestorId[inv.id as string] = (inv.kyc_status as string | null) ?? null;
        });
      }

      const enriched = baseRows.map((row) => ({
        ...row,
        kyc_status: kycByInvestorId[row.investor_id] ?? null,
      }));

      const filtered = kycFilter === 'all'
        ? enriched
        : enriched.filter((row) => (row.kyc_status || 'pending') === kycFilter);

      setRows(filtered);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to load investments');
    } finally {
      setLoading(false);
    }
  };

  const updateKycStatus = async (investorId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('investors')
        .update({ kyc_status: newStatus })
        .eq('id', investorId);
      if (error) throw error;
      setRows((prev) => prev.map((r) => (r.investor_id === investorId ? { ...r, kyc_status: newStatus } : r)));
      toast.success('KYC status updated');
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to update KYC status');
    }
  };

  const updateAgreementStatus = async (investmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('investments')
        .update({ agreement_status: newStatus })
        .eq('id', investmentId);
      if (error) throw error;
      setRows((prev) => prev.map((r) => (r.id === investmentId ? { ...r, agreement_status: newStatus } : r)));
      toast.success('Agreement status updated');
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to update agreement status');
    }
  };

  useEffect(() => {
    void load();
  }, [statusFilter, kycFilter]);

  const approve = async (id: string, tenure_months: number | null) => {
    setActionLoadingId(id);
    try {
      const params = new URLSearchParams({ id });
      if (tenure_months) params.set('tenure_months', String(tenure_months));
      const res = await fetch(`/.netlify/functions/investment-approve?${params.toString()}`, {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to approve investment');
      }
      toast.success('Investment approved');
      void load();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to approve');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openPayoutModal = (id: string) => {
    setPayoutModalId(id);
    setPayoutAmount('');
    setPayoutNote('');
  };

  const submitPayout = async () => {
    if (!payoutModalId) return;
    const amountNum = Number(payoutAmount || 0);
    if (!amountNum || amountNum <= 0) {
      toast.error('Enter a valid payout amount');
      return;
    }
    setActionLoadingId(payoutModalId);
    try {
      const res = await fetch('/.netlify/functions/investment-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investment_id: payoutModalId,
          amount: amountNum,
          metadata: payoutNote ? { note: payoutNote } : {},
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to record payout');
      }
      toast.success('Payout recorded in ledger');
      setPayoutModalId(null);
      void load();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to record payout');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Investor Programs — Investments</h1>
        <button
          onClick={() => void load()}
          disabled={loading}
          className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 flex items-center gap-2 text-sm"
        >
          <RefreshCw className="h-4 w-4" /> Reload
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Status</span>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">KYC</span>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value as any)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="in_review">In review</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded shadow">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
              <th className="p-2 text-left">Created</th>
              <th className="p-2 text-left">Investor ID</th>
              <th className="p-2 text-left">Plan</th>
              <th className="p-2 text-left">Amount (₹)</th>
              <th className="p-2 text-left">Tenure</th>
              <th className="p-2 text-left">KYC</th>
              <th className="p-2 text-left">Agreement</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  {loading ? 'Loading investments...' : 'No investments yet.'}
                </td>
              </tr>
            )}
            {rows.map((row) => {
              const isPending = row.status === 'pending';
              return (
                <tr key={row.id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="p-2 align-top text-xs text-gray-700 dark:text-gray-200">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td className="p-2 align-top text-xs font-mono break-all max-w-xs">{row.investor_id}</td>
                  <td className="p-2 align-top capitalize">{row.plan_type.replace('_', ' ')}</td>
                  <td className="p-2 align-top">{row.amount}</td>
                  <td className="p-2 align-top text-xs">{row.tenure_months ? `${row.tenure_months} months` : '—'}</td>
                  <td className="p-2 align-top capitalize">{row.status}</td>
                  <td className="p-2 align-top text-right">
                    <div className="inline-flex gap-2">
                      {isPending && (
                        <button
                          onClick={() => void approve(row.id, row.tenure_months)}
                          disabled={actionLoadingId === row.id}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          {actionLoadingId === row.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3 w-3" />
                          )}
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => openPayoutModal(row.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        <Banknote className="h-3 w-3" /> Payout
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {payoutModalId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-3">Record payout</h2>
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
              This only records the payout in the investor ledger. Ensure the bank transfer is completed separately.
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm mb-1">Amount (₹)</label>
                <input
                  type="number"
                  min={0}
                  step="100"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Note / Reference</label>
                <input
                  value={payoutNote}
                  onChange={(e) => setPayoutNote(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="e.g., UTR, bank ref, month"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 text-sm">
              <button
                onClick={() => setPayoutModalId(null)}
                className="px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => void submitPayout()}
                disabled={actionLoadingId === payoutModalId}
                className="px-3 py-1.5 rounded bg-primary-600 text-white hover:bg-primary-700"
              >
                {actionLoadingId === payoutModalId ? 'Saving...' : 'Save payout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInvestments;
