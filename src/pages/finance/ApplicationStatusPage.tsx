import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';

interface LoanApplication {
  id: string;
  product_id: string;
  provider_id: string;
  status: string;
  requested_amount: number | null;
  approved_amount?: number | null;
  interest_rate_annual?: number | null;
  tenure_months?: number | null;
  emi?: number | null;
  partner_ref_id?: string | null;
  created_at: string;
  updated_at: string;
}

const statusLabels: Record<string, string> = {
  submitted: 'Submitted to partner',
  in_review: 'Under review',
  approved: 'Approved',
  disbursed: 'Disbursed',
  rejected: 'Rejected',
  docs_pending: 'Documents pending',
};

const ApplicationStatusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        if (!token) {
          setError('You must be logged in to view this application.');
          return;
        }

        const resp = await fetch(`/api/v1/finance/loans/${encodeURIComponent(id)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resp.ok) {
          const body = await resp.json().catch(() => ({}));
          const message = body?.error || body?.message || 'Failed to fetch application';
          setError(message);
          return;
        }
        const body = (await resp.json()) as LoanApplication;
        setApp(body);
      } catch (e) {
        console.error('ApplicationStatusPage: load error', e);
        setError('Unexpected error while loading application');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const humanStatus = app?.status ? statusLabels[app.status] || app.status : '';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Loan application status</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Track your application with partner banks / NBFCs. Status will update automatically when the partner sends an
        update.
      </p>

      {loading && <div className="text-sm text-gray-500">Loading…</div>}
      {error && !loading && <div className="text-sm text-red-600">{error}</div>}

      {!loading && !error && app && (
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Application ID</p>
                <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">{app.id}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                <p className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100">
                  {humanStatus || 'Unknown'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-gray-700 dark:text-gray-300 mt-3">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Requested amount</p>
                <p className="font-semibold">
                  {app.requested_amount != null ? `₹${app.requested_amount.toLocaleString()}` : '—'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Tenor</p>
                <p className="font-semibold">{app.tenor_months ? `${app.tenor_months} months` : '—'}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Approved amount</p>
                <p className="font-semibold">
                  {app.approved_amount != null ? `₹${app.approved_amount.toLocaleString()}` : 'Pending decision'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Interest (annual)</p>
                <p className="font-semibold">
                  {app.interest_rate_annual != null ? `${app.interest_rate_annual}% p.a.` : '—'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Estimated EMI</p>
                <p className="font-semibold">{app.emi != null ? `₹${app.emi.toLocaleString()}` : '—'}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Partner reference</p>
                <p className="font-mono text-[11px] break-all">{app.partner_ref_id || '—'}</p>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-gray-500 dark:text-gray-400">
              <p>
                Created at: {new Date(app.created_at).toLocaleString()} · Last updated:{' '}
                {new Date(app.updated_at).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-3 text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900">
            <p className="font-semibold mb-1">Next steps</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Keep your KYC documents handy in case the partner asks for additional proof.</li>
              <li>
                If your status is approved, a QuickMela teammate or the partner may reach out with final agreement and
                disbursement details.
              </li>
              <li>
                For any clarification, you can raise a support ticket from the Support section and mention this
                Application ID.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationStatusPage;
