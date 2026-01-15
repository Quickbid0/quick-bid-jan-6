import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';

interface InsuranceApplication {
  id: string;
  product_id: string;
  provider_id: string;
  user_id: string;
  status: string;
  premium_amount: number | null;
  policy_number?: string | null;
  policy_pdf_url?: string | null;
  partner_ref_id?: string | null;
  created_at: string;
  updated_at: string;
}

const statusLabels: Record<string, string> = {
  quote_provided: 'Quote provided',
  applied: 'Application submitted',
  purchased: 'Policy purchased',
  active: 'Policy active',
  expired: 'Policy expired',
  cancelled: 'Policy cancelled',
  rejected: 'Application rejected',
};

const InsuranceStatusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<InsuranceApplication | null>(null);
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
          setError('You must be logged in to view this insurance application.');
          return;
        }

        const resp = await fetch(`/api/v1/finance/insurance/${encodeURIComponent(id)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resp.ok) {
          const body = await resp.json().catch(() => ({}));
          const message = body?.error || body?.message || 'Failed to fetch insurance application';
          setError(message);
          return;
        }
        const body = (await resp.json()) as InsuranceApplication;
        setApp(body);
      } catch (e) {
        console.error('InsuranceStatusPage: load error', e);
        setError('Unexpected error while loading insurance application');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const humanStatus = app?.status ? statusLabels[app.status] || app.status : '';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Insurance status</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Track your insurance request with partner insurers. Status will update automatically when the partner sends an
        update.
      </p>

      {loading && <div className="text-sm text-gray-500">Loading…</div>}
      {error && !loading && <div className="text-sm text-red-600">{error}</div>}

      {!loading && !error && app && (
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Insurance application ID</p>
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
                <p className="text-gray-500 dark:text-gray-400">Premium amount</p>
                <p className="font-semibold">
                  {app.premium_amount != null ? `₹${app.premium_amount.toLocaleString()}` : 'Pending quote'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Policy number</p>
                <p className="font-semibold">{app.policy_number || 'Not issued yet'}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Partner reference</p>
                <p className="font-mono text-[11px] break-all">{app.partner_ref_id || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Policy document</p>
                {app.policy_pdf_url ? (
                  <a
                    href={app.policy_pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 underline"
                  >
                    Download policy PDF
                  </a>
                ) : (
                  <p className="font-semibold">Not uploaded yet</p>
                )}
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
              <li>Keep your KYC and vehicle documents handy for quick policy issuance.</li>
              <li>
                If your status is quote provided or applied, a partner may reach out to share final premium and policy
                terms.
              </li>
              <li>
                Once the policy is active, you can store the PDF and details in your records. For help, raise a support
                ticket and mention this Insurance application ID.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsuranceStatusPage;
