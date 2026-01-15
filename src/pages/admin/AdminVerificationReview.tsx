import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../config/supabaseClient';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, ShieldCheck, Search } from 'lucide-react';
import LocationFilter from '../../components/admin/LocationFilter';
import { Tooltip } from '../../components/ui/Tooltip';
import { useSession } from '../../context/SessionContext';

interface VerificationRow {
  id: string;
  product_id: string;
  seller_id: string;
  vtype: string;
  category: string;
  price: number;
  status: string;
  ownership_status: string;
  requested_at: string | null;
  product_title: string | null;
  product_category: string | null;
  product_image: string | null;
  seller_name: string | null;
  location_id?: string | null;
}

const AdminVerificationReview: React.FC = () => {
  const [rows, setRows] = useState<VerificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [actingId, setActingId] = useState<string | null>(null);
  const [filterLocation, setFilterLocation] = useState<string | null>(null);
  const { userProfile } = useSession();
  const userRole = userProfile?.role || 'user';
  // Staff can view, but only Admin/Superadmin can approve/reject
  const canManage = ['admin', 'superadmin'].includes(userRole);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        setLoading(true);
        const { data, error: qError } = await supabase
          .from('verification')
          .select(`
            id,
            product_id,
            seller_id,
            vtype,
            category,
            price,
            status,
            ownership_status,
            requested_at,
            product:products(id, title, category, image_url, location_id),
            seller:profiles(id, name)
          `)
          .order('requested_at', { ascending: false })
          .limit(200);

        if (qError) {
          console.error('Error loading verification rows', qError);
          setError('Failed to load verification requests');
          setRows([]);
        } else {
          const mapped: VerificationRow[] = (data || []).map((row: any) => ({
            id: row.id,
            product_id: row.product_id,
            seller_id: row.seller_id,
            vtype: row.vtype,
            category: row.category,
            price: row.price,
            status: row.status,
            ownership_status: row.ownership_status,
            requested_at: row.requested_at,
            product_title: row.product?.title ?? null,
            product_category: row.product?.category ?? null,
            product_image: row.product?.image_url ?? null,
            seller_name: row.seller?.name ?? null,
            location_id: row.product?.location_id ?? null,
          }));
          setRows(mapped);
        }
      } catch (e) {
        console.error('Unexpected error loading verification rows', e);
        setError('Unexpected error while loading verification requests');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const matchesFilter =
        filter === 'all'
          ? true
          : filter === 'pending'
          ? r.status === 'in_progress' || r.ownership_status === 'in_review' || r.status === 'pending_payment'
          : filter === 'approved'
          ? r.status === 'verified' || r.ownership_status === 'verified'
          : r.status === 'rejected' || r.ownership_status === 'rejected';

      const q = search.trim().toLowerCase();
      const matchesSearch = !q
        ? true
        : (r.product_title || '').toLowerCase().includes(q) ||
          (r.product_category || '').toLowerCase().includes(q) ||
          (r.seller_name || '').toLowerCase().includes(q) ||
          r.vtype.toLowerCase().includes(q);
      
      const matchesLocation = !filterLocation || r.location_id === filterLocation;

      return matchesFilter && matchesSearch && matchesLocation;
    });
  }, [rows, filter, search, filterLocation]);

  const handleDecision = async (row: VerificationRow, decision: 'approved' | 'rejected') => {
    try {
      setActingId(row.id);
      const newStatus = decision === 'approved' ? 'verified' : 'rejected';
      const newOwnership = decision === 'approved' ? 'verified' : 'rejected';

      const { error: vErr } = await supabase
        .from('verification')
        .update({ status: newStatus, ownership_status: newOwnership })
        .eq('id', row.id);

      if (vErr) throw vErr;

      const { error: pErr } = await supabase
        .from('products')
        .update({
          ownership_status: newOwnership,
          verification_status: decision === 'approved' ? 'approved' : 'rejected',
        })
        .eq('id', row.product_id);

      if (pErr) throw pErr;

      setRows((prev) =>
        prev.map((r) =>
          r.id === row.id
            ? { ...r, status: newStatus, ownership_status: newOwnership }
            : r,
        ),
      );

      toast.success(`Verification ${decision === 'approved' ? 'approved' : 'rejected'} for product`);
    } catch (e: any) {
      console.error('Error updating verification status', e);
      toast.error(e?.message || 'Failed to update verification');
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-indigo-500" />
            Verification Review
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Approve or reject pending ownership/authenticity checks across vehicles, antiques and creative items.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-xs">
          {['pending', 'approved', 'rejected', 'all'].map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`px-3 py-1 ${
                filter === key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200'
              }`}
            >
              {key === 'pending'
                ? 'Pending'
                : key === 'approved'
                ? 'Approved'
                : key === 'rejected'
                ? 'Rejected'
                : 'All'}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-[200px] flex items-center gap-2">
          <LocationFilter onFilterChange={setFilterLocation} className="min-w-[150px]" />
          <div className="relative w-full">
            <Search className="h-4 w-4 text-gray-400 absolute left-2 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product, seller, category or type"
              className="w-full pl-8 pr-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      {loading && <div className="py-10 text-center text-gray-500 text-sm">Loading verification requests…</div>}
      {!loading && error && <div className="py-4 text-sm text-red-600">{error}</div>}

      {!loading && !error && filteredRows.length === 0 && (
        <div className="py-10 text-center text-gray-500 text-sm">
          <p className="mb-1">No verification requests found for this view.</p>
          <p className="text-xs text-gray-400">Try switching the status filter above or check again after new verification payments are received.</p>
        </div>
      )}

      {!loading && !error && filteredRows.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
            <thead className="bg-gray-50 dark:bg-gray-900/60">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Product</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Seller</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Type</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Category</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Price</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Status</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Requested</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredRows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                  <td className="px-3 py-2 align-top">
                    <div className="flex items-center gap-2">
                      {row.product_image && (
                        <img
                          src={row.product_image}
                          alt={row.product_title || ''}
                          className="h-9 w-9 rounded object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-xs">
                          {row.product_title || 'Untitled product'}
                        </div>
                        {row.product_category && (
                          <div className="text-[11px] text-gray-500">{row.product_category}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 align-top text-xs text-gray-700 dark:text-gray-200">
                    {row.seller_name || '—'}
                  </td>
                  <td className="px-3 py-2 align-top text-xs text-gray-700 dark:text-gray-200">
                    {row.vtype}
                  </td>
                  <td className="px-3 py-2 align-top text-xs text-gray-700 dark:text-gray-200">
                    {row.category}
                  </td>
                  <td className="px-3 py-2 align-top text-xs text-gray-900 dark:text-white">
                    ₹{row.price.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 align-top text-xs">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] ${
                        row.ownership_status === 'verified'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : row.status === 'in_progress' || row.ownership_status === 'in_review'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : row.ownership_status === 'rejected'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}
                    >
                      {row.ownership_status === 'verified'
                        ? 'Ownership verified'
                        : row.status === 'in_progress' || row.ownership_status === 'in_review'
                        ? 'In review'
                        : row.ownership_status === 'rejected'
                        ? 'Rejected'
                        : row.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-top text-[11px] text-gray-500 dark:text-gray-400">
                    {row.requested_at
                      ? new Date(row.requested_at).toLocaleString()
                      : '—'}
                  </td>
                  <td className="px-3 py-2 align-top text-[11px]">
                    <div className="flex flex-wrap gap-1">
                      <Tooltip content={!canManage ? "You don't have permission" : "Approve verification"}>
                        <button
                          type="button"
                          disabled={actingId === row.id || !canManage}
                          onClick={() => handleDecision(row, 'approved')}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Approve
                        </button>
                      </Tooltip>
                      <Tooltip content={!canManage ? "You don't have permission" : "Reject verification"}>
                        <button
                          type="button"
                          disabled={actingId === row.id || !canManage}
                          onClick={() => handleDecision(row, 'rejected')}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <XCircle className="h-3 w-3" />
                          Reject
                        </button>
                      </Tooltip>
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

export default AdminVerificationReview;
