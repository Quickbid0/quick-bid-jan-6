import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
import { ShieldCheck, AlertCircle, CheckCircle2, Clock, X, Loader2, Gavel } from 'lucide-react';

interface AdminWinPayment {
  id: string;
  auction_id: string;
  buyer_id: string;
  method: string;
  reference_number?: string | null;
  amount: number;
  status: string;
  submitted_at: string;
  verified_by?: string | null;
  verified_at?: string | null;
  notes?: string | null;
  auction?: {
    id: string;
    status?: string | null;
    final_price?: number | null;
  } | null;
  buyer?: {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
}

interface AdminWinPaymentAudit {
  id: string;
  win_payment_id: string;
  changed_by: string | null;
  old_status: string | null;
  new_status: string | null;
  note?: string | null;
  created_at: string;
  admin?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
}

type PaymentStatus =
  | 'pending_verification'
  | 'approved'
  | 'rejected'
  | 'pending_documents'
  | 'refund_in_progress'
  | 'refunded'
  | 'partial_payment';

const ALLOWED_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  pending_verification: ['approved', 'rejected', 'pending_documents', 'partial_payment'],
  pending_documents: ['approved', 'rejected'],
  approved: ['refund_in_progress'],
  refund_in_progress: ['refunded'],
  refunded: [],
  rejected: [],
  partial_payment: ['approved', 'refund_in_progress'],
};

const ALL_STATUSES: PaymentStatus[] = [
  'pending_verification',
  'approved',
  'rejected',
  'pending_documents',
  'partial_payment',
  'refund_in_progress',
  'refunded',
];

const getStatusChip = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'approved') return { label: 'Approved', className: 'bg-green-50 text-green-700 border-green-200' };
  if (s === 'rejected') return { label: 'Rejected', className: 'bg-red-50 text-red-700 border-red-200' };
  if (s === 'pending_documents') return { label: 'Pending documents', className: 'bg-yellow-50 text-yellow-800 border-yellow-200' };
  if (s === 'partial_payment') return { label: 'Partial payment', className: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
  if (s === 'refund_in_progress') return { label: 'Refund in progress', className: 'bg-orange-50 text-orange-800 border-orange-200' };
  if (s === 'refunded') return { label: 'Refunded', className: 'bg-gray-100 text-gray-800 border-gray-300' };
  return { label: 'Pending verification', className: 'bg-gray-50 text-gray-700 border-gray-200' };
};

const AdminWinPayments: React.FC = () => {
  const [payments, setPayments] = useState<AdminWinPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('pending_verification');
  const [selected, setSelected] = useState<AdminWinPayment | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string>('approved');
  const [updateNotes, setUpdateNotes] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [inlineUpdatingId, setInlineUpdatingId] = useState<string | null>(null);
  const [confirmReject, setConfirmReject] = useState<{ payment: AdminWinPayment; notes: string } | null>(null);
  const [auditEntries, setAuditEntries] = useState<AdminWinPaymentAudit[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [lastRequestId, setLastRequestId] = useState<string | null>(null);
  const location = useLocation();
  const auctionIdFilter = new URLSearchParams(location.search).get('auctionId');

  const getAvailableTransitions = (from: string): PaymentStatus[] => {
    const f = (from || '').toLowerCase() as PaymentStatus;
    return ALLOWED_TRANSITIONS[f] ?? [];
  };

  const canTransition = (from: string, to: string): boolean => {
    const f = (from || '').toLowerCase() as PaymentStatus;
    const t = (to || '').toLowerCase() as PaymentStatus;
    const allowed = ALLOWED_TRANSITIONS[f] ?? [];
    return allowed.includes(t);
  };

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setError(null);
        setLoading(true);

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('AdminWinPayments: getSession error', sessionError);
        }

        const token = sessionData.session?.access_token;
        if (!token) {
          setError('You must be logged in as admin to view win payments.');
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/admin/win-payments?status=${encodeURIComponent(statusFilter)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          console.error('AdminWinPayments: list error', body);
          setError(body.error || 'Failed to load win payments');
          setLastRequestId(res.headers.get('x-request-id'));
          setLoading(false);
          return;
        }

        const data = await res.json();
        const mapped: AdminWinPayment[] = (data || []).map((p: any) => ({
          ...p,
          amount: p.amount != null ? Number(p.amount) : 0,
        }));
        setPayments(mapped);
      } catch (e) {
        console.error('AdminWinPayments: unexpected error loading win payments', e);
        setError('Unexpected error while loading win payments');
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [statusFilter]);

  const openDetail = async (payment: AdminWinPayment) => {
    setSelected(payment);
    const nexts = getAvailableTransitions(payment.status || '');
    setUpdateStatus(nexts[0] || 'approved');
    setUpdateNotes(payment.notes || '');
    setAuditEntries([]);
    setAuditError(null);
    setAuditLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setAuditError('Missing admin auth token.');
        setAuditLoading(false);
        return;
      }

      const res = await fetch(`/api/admin/win-payments/${payment.id}/audit`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error('AdminWinPayments: audit list error', body);
        setAuditError(body.error || 'Failed to load audit history');
        setLastRequestId(res.headers.get('x-request-id'));
        setAuditLoading(false);
        return;
      }

      const data = (await res.json()) as AdminWinPaymentAudit[];
      setAuditEntries(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('AdminWinPayments: unexpected error loading audit history', e);
      setAuditError('Unexpected error while loading audit history');
    } finally {
      setAuditLoading(false);
    }
  };

  const closeDetail = () => {
    setSelected(null);
    setUpdateStatus('approved');
    setUpdateNotes('');
    setAuditEntries([]);
    setAuditError(null);
    setAuditLoading(false);
  };

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected) return;

    if (!canTransition(selected.status || '', updateStatus)) {
      setError('Illegal status transition attempted');
      return;
    }

    try {
      setUpdating(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setError('Missing admin auth token.');
        setUpdating(false);
        return;
      }

      const res = await fetch(`/api/admin/win-payments/${selected.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: updateStatus, notes: updateNotes }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error('AdminWinPayments: update error', body);
        setError(body.error || 'Failed to update payment');
        setLastRequestId(res.headers.get('x-request-id'));
        setUpdating(false);
        return;
      }

      // Optimistically update local list
      setPayments((prev) =>
        prev.map((p) => (p.id === selected.id ? { ...p, status: updateStatus, notes: updateNotes } : p)),
      );
      closeDetail();
    } catch (e) {
      console.error('AdminWinPayments: unexpected error updating payment', e);
      setError('Unexpected error while updating payment');
    } finally {
      setUpdating(false);
    }
  };

  const handleInlineStatusChange = async (
    payment: AdminWinPayment,
    nextStatus: string,
    notes?: string,
  ) => {
    if (!payment || !nextStatus) return;

    if (!canTransition(payment.status || '', nextStatus)) {
      setError('Illegal status transition attempted');
      return;
    }

    const prevPayments = payments;
    setInlineUpdatingId(payment.id);
    setError(null);

    // Optimistic update
    setPayments((prev) =>
      prev.map((p) => (p.id === payment.id ? { ...p, status: nextStatus, notes: notes ?? p.notes } : p)),
    );

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setError('Missing admin auth token.');
        setPayments(prevPayments);
        setInlineUpdatingId(null);
        return;
      }

      const res = await fetch(`/api/admin/win-payments/${payment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus, notes: notes ?? payment.notes }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error('AdminWinPayments: inline update error', body);
        setError(body.error || 'Failed to update payment');
        setLastRequestId(res.headers.get('x-request-id'));
        setPayments(prevPayments);
      }
    } catch (e) {
      console.error('AdminWinPayments: unexpected error in inline update', e);
      setError('Unexpected error while updating payment');
      setPayments(prevPayments);
    } finally {
      setInlineUpdatingId(null);
    }
  };

  const filteredPayments = payments.filter((p) =>
    auctionIdFilter ? p.auction_id === auctionIdFilter : true,
  );

  const settlementSummary = (() => {
    if (!auctionIdFilter || filteredPayments.length === 0) return null;

    const expectedWin = filteredPayments[0]?.auction?.final_price
      ? Number(filteredPayments[0].auction!.final_price)
      : null;

    let totalApprovedOrPartial = 0;
    let countApproved = 0;
    let countPendingLike = 0;
    let latestPayment: { at: Date; method?: string | null } | null = null;

    for (const p of filteredPayments) {
      if (p.status === 'approved' || p.status === 'partial_payment') {
        totalApprovedOrPartial += p.amount || 0;
        countApproved += 1;
      }
      if (
        p.status === 'pending_verification' ||
        p.status === 'pending_documents' ||
        p.status === 'partial_payment'
      ) {
        countPendingLike += 1;
      }

      if (p.submitted_at) {
        const d = new Date(p.submitted_at);
        if (!Number.isNaN(d.getTime())) {
          if (!latestPayment || d > latestPayment.at) {
            latestPayment = { at: d, method: p.method };
          }
        }
      }
    }

    const remaining = expectedWin != null ? Math.max(expectedWin - totalApprovedOrPartial, 0) : null;

    return {
      expectedWin,
      totalApprovedOrPartial,
      remaining,
      totalCount: filteredPayments.length,
      countApproved,
      countPendingLike,
      latestPayment,
    };
  })();

  const handleExportCsv = () => {
    if (!filteredPayments.length) return;

    const headers = [
      'id',
      'auction_id',
      'buyer_id',
      'buyer_name',
      'buyer_email',
      'buyer_phone',
      'method',
      'reference_number',
      'amount',
      'status',
      'submitted_at',
      'verified_by',
      'verified_at',
      'notes',
    ];

    const escape = (value: unknown): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes('"') || str.includes(',') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const rowsCsv = filteredPayments.map((p) =>
      [
        p.id,
        p.auction_id,
        p.buyer_id,
        p.buyer?.name || '',
        p.buyer?.email || '',
        p.buyer?.phone || '',
        p.method,
        p.reference_number || '',
        p.amount,
        p.status,
        p.submitted_at,
        p.verified_by || '',
        p.verified_at || '',
        p.notes || '',
      ]
        .map(escape)
        .join(','),
    );

    const csvContent = [headers.join(','), ...rowsCsv].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    a.download = `win-payments-export-${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-indigo-500" />
            Win Payments
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Review and verify payments submitted by auction winners. Only approved payments should move auctions to paid.
          </p>
          {auctionIdFilter && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-600 dark:text-gray-300">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-mono">
                Filtered by auction ID: {auctionIdFilter}
              </span>
              <Link
                to="/admin/winners"
                className="inline-flex items-center text-indigo-600 hover:text-indigo-800 underline"
              >
                View winner in AdminWinners
              </Link>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <span>Status:</span>
            <select
              className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="pending_verification">Pending verification</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="pending_documents">Pending documents</option>
              <option value="partial_payment">Partial payments</option>
              <option value="refund_in_progress">Refund in progress</option>
            </select>
          </div>
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-[11px] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Export CSV
          </button>
        </div>
      </div>

      {settlementSummary && (
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 p-3">
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Expected win amount</p>
            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
              {settlementSummary.expectedWin != null
                ? `₹${settlementSummary.expectedWin.toLocaleString()}`
                : '—'}
            </p>
            <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
              {settlementSummary.totalCount} payment{settlementSummary.totalCount === 1 ? '' : 's'} recorded
            </p>
          </div>
          <div className="rounded-lg border border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 p-3">
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
              Collected (approved / partial)
            </p>
            <p className="mt-1 text-sm font-semibold text-emerald-800 dark:text-emerald-100">
              ₹{settlementSummary.totalApprovedOrPartial.toLocaleString()}
            </p>
            <p className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-300">
              {settlementSummary.countApproved} approved / partial payment{settlementSummary.countApproved === 1 ? '' : 's'}
            </p>
          </div>
          <div className="rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-3">
            <p className="text-[11px] text-amber-700 dark:text-amber-300">Remaining (if any)</p>
            <p className="mt-1 text-sm font-semibold text-amber-800 dark:text-amber-100">
              {settlementSummary.remaining != null
                ? `₹${settlementSummary.remaining.toLocaleString()}`
                : '—'}
            </p>
            <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">
              {settlementSummary.countPendingLike} pending / in-progress payment
              {settlementSummary.countPendingLike === 1 ? '' : 's'}
            </p>
            {settlementSummary.latestPayment && (
              <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">
                Last payment on{' '}
                {settlementSummary.latestPayment.at.toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
                {settlementSummary.latestPayment.method
                  ? ` via ${settlementSummary.latestPayment.method}`
                  : ''}
              </p>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="py-10 text-center text-gray-500 flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          <span className="text-sm">Loading win payments…</span>
        </div>
      )}

      {!loading && error && (
        <div className="py-4 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
          {lastRequestId && (
            <span className="font-mono text-[10px] text-gray-500">Request ID: {lastRequestId}</span>
          )}
        </div>
      )}

      {!loading && !error && filteredPayments.length === 0 && (
        <div className="py-10 text-center text-gray-500 text-sm">
          No win payments found for this status.
        </div>
      )}

      {!loading && !error && filteredPayments.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/60">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Auction</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Buyer</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Payment</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Status</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Submitted</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredPayments.map((p) => {
                const chip = getStatusChip(p.status || '');
                return (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                    <td className="px-4 py-3 align-top text-xs text-gray-800 dark:text-gray-100">
                      <div className="font-mono text-[11px]">{p.auction_id}</div>
                      {p.auction?.final_price != null && (
                        <div className="text-[11px] text-gray-500">Win: ₹{Number(p.auction.final_price).toLocaleString()}</div>
                      )}
                      {p.auction?.status && (
                        <div className="text-[11px] text-gray-500">Auction status: {p.auction.status}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-800 dark:text-gray-100">
                      <div>{p.buyer?.name || 'Buyer'}</div>
                      {p.buyer?.email && <div className="text-[11px] text-gray-500">{p.buyer.email}</div>}
                      {p.buyer?.phone && <div className="text-[11px] text-gray-500">{p.buyer.phone}</div>}
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-800 dark:text-gray-100">
                      <div className="font-semibold">₹{p.amount.toLocaleString()}</div>
                      <div className="text-[11px] text-gray-500">Method: {p.method}</div>
                      {p.reference_number && (
                        <div className="text-[11px] text-gray-500">Ref: {p.reference_number}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-800 dark:text-gray-100">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] ${chip.className}`}>
                        {chip.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-800 dark:text-gray-100">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(p.submitted_at).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-800 dark:text-gray-100">
                      <div className="flex flex-wrap gap-1">
                        {canTransition(p.status, 'approved') && (
                          <button
                            type="button"
                            disabled={inlineUpdatingId === p.id}
                            onClick={() => handleInlineStatusChange(p, 'approved')}
                            data-testid="admin-approve"
                            className="inline-flex items-center px-2 py-0.5 rounded-lg border border-emerald-500 text-[11px] text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
                          >
                            Approve
                          </button>
                        )}
                        {canTransition(p.status, 'partial_payment') && (
                          <button
                            type="button"
                            disabled={inlineUpdatingId === p.id}
                            onClick={() => handleInlineStatusChange(p, 'partial_payment')}
                            className="inline-flex items-center px-2 py-0.5 rounded-lg border border-indigo-500 text-[11px] text-indigo-700 hover:bg-indigo-50 disabled:opacity-60"
                          >
                            Mark partial
                          </button>
                        )}
                        {canTransition(p.status, 'rejected') && (
                          <button
                            type="button"
                            disabled={inlineUpdatingId === p.id}
                            onClick={() => setConfirmReject({ payment: p, notes: '' })}
                            data-testid="admin-reject"
                            className="inline-flex items-center px-2 py-0.5 rounded-lg border border-red-500 text-[11px] text-red-700 hover:bg-red-50 disabled:opacity-60"
                          >
                            Reject
                          </button>
                        )}
                        {canTransition(p.status, 'refund_in_progress') && (
                          <button
                            type="button"
                            disabled={inlineUpdatingId === p.id}
                            onClick={() => handleInlineStatusChange(p, 'refund_in_progress')}
                            className="inline-flex items-center px-2 py-0.5 rounded-lg border border-orange-500 text-[11px] text-orange-700 hover:bg-orange-50 disabled:opacity-60"
                          >
                            Start refund
                          </button>
                        )}
                        {canTransition(p.status, 'refunded') && (
                          <button
                            type="button"
                            disabled={inlineUpdatingId === p.id}
                            onClick={() => handleInlineStatusChange(p, 'refunded')}
                            className="inline-flex items-center px-2 py-0.5 rounded-lg border border-gray-500 text-[11px] text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                          >
                            Mark refunded
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openDetail(p)}
                          className="inline-flex items-center px-2 py-0.5 rounded-lg border border-gray-300 dark:border-gray-700 text-[11px] hover:bg-gray-50 dark:hover:bg-gray-900/40"
                        >
                          Review
                        </button>
                      </div>
                      <div className="mt-1">
                        <Link
                          to={`/admin/winners?auctionId=${encodeURIComponent(p.auction_id)}`}
                          className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800"
                        >
                          <Gavel className="h-3 w-3" />
                          View in Winners
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg w-full mx-4 p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-500" />
                Review payment
              </h2>
              <button
                type="button"
                onClick={closeDetail}
                className="p-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">
              <div>Payment ID: {selected.id}</div>
              <div>Auction ID: {selected.auction_id}</div>
              <div>Buyer ID: {selected.buyer_id}</div>
            </div>

            <div className="mb-3 text-xs text-gray-800 dark:text-gray-100">
              <div className="font-semibold mb-1">Amount: ₹{selected.amount.toLocaleString()}</div>
              <div className="mb-1">Method: {selected.method}</div>
              {selected.reference_number && <div className="mb-1">Reference: {selected.reference_number}</div>}
              {selected.notes && <div className="mb-1">Buyer notes: {selected.notes}</div>}
            </div>

            <div className="mb-4 text-xs">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-gray-800 dark:text-gray-100">Audit history</p>
              </div>
              {auditLoading && (
                <p className="text-[11px] text-gray-500">Loading audit history…</p>
              )}
              {!auditLoading && auditError && (
                <p className="text-[11px] text-red-600">{auditError}</p>
              )}
              {!auditLoading && !auditError && auditEntries.length === 0 && (
                <p className="text-[11px] text-gray-500">No audit entries yet for this payment.</p>
              )}
              {!auditLoading && !auditError && auditEntries.length > 0 && (
                <ul className="mt-1 space-y-1 max-h-40 overflow-y-auto pr-1">
                  {auditEntries.map((entry) => (
                    <li
                      key={entry.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-gray-50 dark:bg-gray-900/40"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-gray-800 dark:text-gray-100">
                          {entry.old_status || '—'} → {entry.new_status || '—'}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {new Date(entry.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[10px] text-gray-600 dark:text-gray-300">
                        {entry.admin?.name || entry.admin?.email
                          ? `By ${entry.admin?.name || entry.admin?.email}`
                          : 'By admin'}
                      </div>
                      {entry.note && (
                        <div className="mt-0.5 text-[10px] text-gray-600 dark:text-gray-300">
                          Note: {entry.note}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <form onSubmit={handleUpdate} className="space-y-3 mt-2 text-xs">
              <div>
                <label className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">Update status</label>
                <select
                  className="w-full px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-800 dark:text-gray-100"
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                >
                  {getAvailableTransitions(selected.status || '').map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">Admin notes (optional)</label>
                <textarea
                  className="w-full px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-800 dark:text-gray-100"
                  rows={3}
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  placeholder="Add any comments about this verification step…"
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  <span>
                    Approving marks this payment as verified and may move the auction to <span className="font-semibold">paid</span>.
                  </span>
                </p>
                <button
                  type="submit"
                  disabled={updating}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 disabled:opacity-60"
                >
                  {updating ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmReject && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-sm w-full mx-4 p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                Confirm rejection
              </h2>
              <button
                type="button"
                onClick={() => setConfirmReject(null)}
                className="p-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[11px] text-gray-600 dark:text-gray-300 mb-2">
              This will mark the payment as <span className="font-semibold">rejected</span>. You should only do this if the
              funds have not been received or the proof is invalid.
            </p>
            <label className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">Reason / notes (optional)</label>
            <textarea
              className="w-full px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-800 dark:text-gray-100 mb-3"
              rows={3}
              value={confirmReject.notes}
              onChange={(e) => setConfirmReject({ ...confirmReject, notes: e.target.value })}
              placeholder="Add a brief reason for rejection…"
            />
            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setConfirmReject(null)}
                className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900/40"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={inlineUpdatingId === confirmReject.payment.id}
                onClick={() => {
                  handleInlineStatusChange(confirmReject.payment, 'rejected', confirmReject.notes);
                  setConfirmReject(null);
                }}
                className="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 text-xs disabled:opacity-60"
              >
                Confirm reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWinPayments;
