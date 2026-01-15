import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';

interface InspectionProduct {
  id: string;
  title: string | null;
  category: string | null;
  brand: string | null;
  model: string | null;
  year: number | null;
}

interface InspectionRow {
  id: string;
  product_type: string;
  status: string;
  final_status: string | null;
  final_grade: string | null;
  final_decision: string | null;
  ai_report: any | null;
  created_at: string;
  assigned_inspector_id: string | null;
  company_id: string | null;
  product: InspectionProduct | null;
}

const statusLabel = (status: string | null | undefined) => {
  if (!status) return 'pending';
  return status.replace('_', ' ');
};

const statusClasses = (status: string | null | undefined) => {
  const s = (status || '').toLowerCase();
  if (s === 'approved') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (s === 'rejected') return 'bg-rose-50 text-rose-700 border-rose-200';
  if (s === 'awaiting_review' || s === 'ai_reviewed') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-gray-50 text-gray-700 border-gray-200';
};

const InspectionsList: React.FC = () => {
  const { userProfile, loading: sessionLoading, isAuthenticated } = useSession();
  const [rows, setRows] = useState<InspectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionLoading) return;
    if (!isAuthenticated || !userProfile?.id) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = `/.netlify/functions/inspector-inspections?inspectorId=${encodeURIComponent(
          userProfile.id,
        )}`;
        const resp = await fetch(url);
        const json = await resp.json();

        if (!resp.ok || !json.ok) {
          setError(json.error || 'Failed to load inspections');
          setRows([]);
          return;
        }

        setRows(json.inspections || []);
      } catch (e: any) {
        console.error('Error loading inspector inspections', e);
        setError(e.message || 'Unexpected error while loading inspections');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [sessionLoading, isAuthenticated, userProfile?.id]);

  const handleRowClick = (id: string) => {
    navigate(`/inspector/inspections/${id}`);
  };

  const now = new Date();
  const newThresholdMs = 24 * 60 * 60 * 1000; // last 24 hours
  const newInspectionsCount = rows.filter((row) => {
    if (!row.created_at) return false;
    const createdAt = new Date(row.created_at).getTime();
    const ageMs = now.getTime() - createdAt;
    const status = (row.final_status || row.status || '').toLowerCase();
    const isPending = status === 'pending' || status === 'awaiting_review' || status === 'ai_reviewed' || !status;
    return isPending && ageMs >= 0 && ageMs <= newThresholdMs;
  }).length;

  const isRowNew = (row: InspectionRow) => {
    if (!row.created_at) return false;
    const createdAt = new Date(row.created_at).getTime();
    const ageMs = now.getTime() - createdAt;
    const status = (row.final_status || row.status || '').toLowerCase();
    const isPending = status === 'pending' || status === 'awaiting_review' || status === 'ai_reviewed' || !status;
    return isPending && ageMs >= 0 && ageMs <= newThresholdMs;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inspector Inspections</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            View all inspections assigned to you, with AI summaries and review status.
          </p>
        </div>
        {rows.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
            <span>
              Total: <span className="font-semibold">{rows.length}</span>
            </span>
            {newInspectionsCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                New: {newInspectionsCount}
              </span>
            )}
          </div>
        )}
      </div>

      {loading && (
        <div className="py-10 text-center text-gray-500">Loading inspections</div>
      )}

      {!loading && error && (
        <div className="py-4 text-sm text-red-600">{error}</div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="py-10 text-center text-gray-500">No inspections assigned yet.</div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/60">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Product</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Category</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">AI confidence</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Status</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Created</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {rows.map((row) => {
                const overallScore = row.ai_report?.scores?.overall ?? null;
                const status = row.final_status || row.status;
                const product = row.product;
                const created = row.created_at
                  ? new Date(row.created_at).toLocaleString()
                  : '';

                return (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/40 cursor-pointer"
                    onClick={() => handleRowClick(row.id)}
                  >
                    <td className="px-4 py-3 align-top">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {product?.title || 'Untitled product'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {product?.brand || product?.model
                          ? [product?.brand, product?.model].filter(Boolean).join(' ')
                          : 'Product ID: ' + (product?.id || row.product_type)}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-700 dark:text-gray-200">
                      {product?.category || row.product_type}
                    </td>
                    <td className="px-4 py-3 align-top">
                      {overallScore != null ? (
                        <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-200">
                          <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-1.5 bg-indigo-500 rounded-full"
                              style={{ width: `${Math.round(overallScore * 100)}%` }}
                            />
                          </div>
                          <span>{Math.round(overallScore * 100)}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Not analyzed</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span
                        className={
                          'inline-flex items-center px-2 py-0.5 rounded-full border text-xs capitalize ' +
                          statusClasses(status)
                        }
                      >
                        {statusLabel(status)}
                        {isRowNew(row) && (
                          <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px]">
                            New
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-600 dark:text-gray-300">
                      {created}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Link
                        to={`/inspector/inspections/${row.id}`}
                        className="inline-flex items-center px-2 py-1 rounded bg-indigo-600 text-white text-xs hover:bg-indigo-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Review
                      </Link>
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

export default InspectionsList;
