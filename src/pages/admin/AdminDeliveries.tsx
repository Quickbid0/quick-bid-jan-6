import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Truck, Clock, User, PackageSearch } from 'lucide-react';

interface DeliveryRow {
  id: string;
  product_id: string | null;
  product_title: string | null;
  winner_id: string | null;
  winner_name: string | null;
  seller_id: string | null;
  seller_name: string | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  tracking_updates: string[] | null;
}

const AdminDeliveries: React.FC = () => {
  const [rows, setRows] = useState<DeliveryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<DeliveryRow | null>(null);

  useEffect(() => {
    const loadDeliveries = async () => {
      try {
        setError(null);

        const { data, error: qError } = await supabase
          .from('deliveries')
          .select(`
            id,
            product_id,
            buyer_id,
            seller_id,
            status,
            created_at,
            updated_at,
            tracking_updates,
            product:products(id, title),
            buyer:profiles(id, name),
            seller:profiles(id, name)
          `)
          .order('created_at', { ascending: false })
          .limit(200);

        if (qError) {
          console.error('Error loading deliveries', qError);
          setError('Failed to load deliveries list');
          setLoading(false);
          return;
        }

        const mapped: DeliveryRow[] = (data || []).map((d: any) => ({
          id: d.id,
          product_id: d.product_id ?? null,
          product_title: d.product?.title ?? null,
          winner_id: d.buyer_id ?? null,
          winner_name: d.buyer?.name ?? null,
          seller_id: d.seller_id ?? null,
          seller_name: d.seller?.name ?? null,
          status: d.status || 'pending',
          created_at: d.created_at ?? null,
          updated_at: d.updated_at ?? null,
          tracking_updates: d.tracking_updates ?? null,
        }));

        setRows(mapped);
      } catch (e) {
        console.error('Unexpected error loading deliveries', e);
        setError('Unexpected error while loading deliveries');
      } finally {
        setLoading(false);
      }
    };

    loadDeliveries();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Truck className="h-6 w-6 text-indigo-500" />
            Deliveries
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Overview of items marked ready for dispatch and tracked via the deliveries table.
          </p>
        </div>
      </div>

      {loading && <div className="py-10 text-center text-gray-500">Loading deliveries…</div>}
      {!loading && error && <div className="py-4 text-sm text-red-600">{error}</div>}
      {!loading && !error && rows.length === 0 && (
        <div className="py-10 text-center text-gray-500 text-sm">
          No deliveries created yet. Set a winner to "Ready for dispatch" in the Winners screen to create deliveries.
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {/* Mobile Cards */}
          <div className="md:hidden">
            {rows.map((row) => (
              <div key={row.id} className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white line-clamp-1">
                      {row.product_title || '—'}
                    </div>
                    <div className="text-[11px] text-gray-500 font-mono">ID: {row.id.slice(0, 8)}...</div>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100">
                    {row.status || 'pending'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <div className="text-[11px] text-gray-500 mb-0.5">Buyer</div>
                    <div className="flex items-center gap-1 text-sm text-gray-800 dark:text-gray-100">
                      <User className="h-3 w-3" />
                      <span className="truncate">{row.winner_name || '—'}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-500 mb-0.5">Seller</div>
                    <div className="flex items-center gap-1 text-sm text-gray-800 dark:text-gray-100">
                      <User className="h-3 w-3" />
                      <span className="truncate">{row.seller_name || '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                  <div className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                    onClick={() => setSelected(row)}
                  >
                    <PackageSearch className="h-3 w-3" />
                    View tracking
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/60">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Delivery ID</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Product</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Buyer</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Seller</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Status</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Created / Updated</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                    <td className="px-4 py-3 align-top font-mono text-xs text-gray-800 dark:text-gray-200">
                      {row.id}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {row.product_title || '—'}
                      </div>
                      {row.product_id && (
                        <div className="text-[11px] text-gray-500">Product ID: {row.product_id}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center gap-1 text-gray-800 dark:text-gray-100 text-xs">
                        <User className="h-3 w-3" />
                        <span>{row.winner_name || '—'}</span>
                      </div>
                      {row.winner_id && (
                        <div className="text-[11px] text-gray-500">Buyer ID: {row.winner_id}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center gap-1 text-gray-800 dark:text-gray-100 text-xs">
                        <User className="h-3 w-3" />
                        <span>{row.seller_name || '—'}</span>
                      </div>
                      {row.seller_id && (
                        <div className="text-[11px] text-gray-500">Seller ID: {row.seller_id}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100">
                        {row.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {row.created_at ? new Date(row.created_at).toLocaleString() : '—'}
                        </span>
                      </div>
                      {row.updated_at && (
                        <div className="mt-0.5 text-[11px] text-gray-500">
                          Updated: {new Date(row.updated_at).toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-xs">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 underline"
                        onClick={() => setSelected(row)}
                      >
                        <PackageSearch className="h-3 w-3" />
                        View tracking
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Truck className="h-5 w-5 text-indigo-500" />
                  Delivery tracking
                </h2>
                <p className="text-xs text-gray-500">Delivery ID: {selected.id}</p>
                {selected.product_title && (
                  <p className="text-xs text-gray-500">Product: {selected.product_title}</p>
                )}
              </div>
              <button
                type="button"
                className="text-xs text-gray-500 hover:text-gray-800"
                onClick={() => setSelected(null)}
              >
                Close ✕
              </button>
            </div>

            <div className="mb-3 text-xs text-gray-800 dark:text-gray-100">
              <p className="font-semibold mb-1">Current status</p>
              <p>{selected.status || 'pending'}</p>
            </div>

            <div className="mb-3 text-xs text-gray-800 dark:text-gray-100">
              <p className="font-semibold mb-1">Tracking history</p>
              {selected.tracking_updates && selected.tracking_updates.length > 0 ? (
                <ul className="space-y-1 max-h-40 overflow-auto text-[11px]">
                  {selected.tracking_updates.map((t, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-gray-500">No tracking updates recorded yet.</p>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-2 text-xs">
              <button
                type="button"
                className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDeliveries;
