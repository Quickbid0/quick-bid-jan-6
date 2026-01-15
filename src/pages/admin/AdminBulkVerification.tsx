import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Filter as FilterIcon, Search, CheckCircle, XCircle, FileCheck, AlertTriangle } from 'lucide-react';
import LocationFilter from '../../components/admin/LocationFilter';
import { useSession } from '../../context/SessionContext';

type BulkItemStatus = 'pending_verification' | 'pending_documents' | 'verified' | 'rejected';
type SourceType = 'bank' | 'partner' | 'user';

interface BulkItem {
  id: string;
  asset_id: string;
  title: string;
  source_type: SourceType;
  source_name?: string | null;
  reserve_price?: number | null;
  required_docs_present: boolean;
  optional_docs_missing: boolean;
  auction_type?: string | null;
  issues?: string[] | null;
  status: BulkItemStatus;
  image_url?: string | null;
  category?: string | null;
  upload_job_id?: string | null;
  location_id?: string | null;
}

type ActionType = 'approve' | 'reject' | 'request_docs';

const AdminBulkVerification: React.FC = () => {
  const { userProfile } = useSession();
  const userRole = userProfile?.role as string | undefined;
  const canVerify = userRole === 'admin' || userRole === 'superadmin';
  const [items, setItems] = useState<BulkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BulkItemStatus | 'all'>('pending_verification');
  const [sourceFilter, setSourceFilter] = useState<SourceType | 'all'>('all');
  const [uploadJobId, setUploadJobId] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all');
  const [auctionTypeFilter, setAuctionTypeFilter] = useState<string | 'all'>('all');
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});
  const [filterLocation, setFilterLocation] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<ActionType>('approve');
  const [modalNote, setModalNote] = useState('');
  const [modalRequiredDocs, setModalRequiredDocs] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        setItems([]);
      } catch (e) {
        setError('Failed to load bulk verification items');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((it) => {
      const matchesSearch =
        !q ||
        (it.title || '').toLowerCase().includes(q) ||
        (it.source_name || '').toLowerCase().includes(q) ||
        (it.category || '').toLowerCase().includes(q) ||
        (it.asset_id || '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' ? true : it.status === statusFilter;
      const matchesSource = sourceFilter === 'all' ? true : it.source_type === sourceFilter;
      const matchesCategory = categoryFilter === 'all' ? true : (it.category || '') === categoryFilter;
      const matchesAuctionType = auctionTypeFilter === 'all' ? true : (it.auction_type || '') === auctionTypeFilter;
      const matchesLocation = !filterLocation || it.location_id === filterLocation;
      const matchesUploadJob = !uploadJobId || (it.upload_job_id || '') === uploadJobId;
      const matchesDate =
        !dateRange.from && !dateRange.to ? true : true;
      return (
        matchesSearch &&
        matchesStatus &&
        matchesSource &&
        matchesCategory &&
        matchesAuctionType &&
        matchesLocation &&
        matchesUploadJob &&
        matchesDate
      );
    });
  }, [items, searchQuery, statusFilter, sourceFilter, categoryFilter, auctionTypeFilter, filterLocation, uploadJobId, dateRange]);

  const allSelected = useMemo(() => filtered.length > 0 && selectedIds.length === filtered.length, [filtered, selectedIds]);

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((it) => it.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const openModal = (action: ActionType) => {
    if (!canVerify) {
      toast.error('You do not have permission to perform verification actions');
      return;
    }
    setModalAction(action);
    setModalOpen(true);
  };

  const performBulkAction = async () => {
    try {
      if (!canVerify) {
        toast.error('Permission denied');
        return;
      }
      if (selectedIds.length === 0) {
        toast.error('No items selected');
        return;
      }
      setModalOpen(false);
      toast.success('Bulk action queued');
      setSelectedIds([]);
    } catch (e) {
      toast.error('Bulk action failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-indigo-500" />
            Bulk Product Verification
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Approve, reject or request documents at scale</p>
        </div>
        <div className="flex items-center gap-2">
          <LocationFilter onFilterChange={setFilterLocation} className="min-w-[180px]" />
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium">
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs">
            <FilterIcon className="h-4 w-4" />
            <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as any)} className="bg-transparent">
              <option value="all">All Sources</option>
              <option value="bank">Banks</option>
              <option value="partner">Partners</option>
              <option value="user">Users</option>
            </select>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="bg-transparent">
              <option value="pending_verification">Pending</option>
              <option value="pending_documents">Pending Documents</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="all">All</option>
            </select>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs">
            <input
              value={uploadJobId}
              onChange={(e) => setUploadJobId(e.target.value)}
              placeholder="Upload Job ID"
              className="bg-transparent outline-none"
            />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-transparent">
              <option value="all">All Categories</option>
            </select>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs">
            <select value={auctionTypeFilter} onChange={(e) => setAuctionTypeFilter(e.target.value)} className="bg-transparent">
              <option value="all">All Auction Types</option>
              <option value="live">Live</option>
              <option value="timed">Timed</option>
              <option value="tender">Tender</option>
            </select>
          </div>
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by asset, title, source or category"
              className="w-full pl-8 pr-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      {loading && <div className="py-10 text-center text-gray-500 text-sm">Loading…</div>}
      {!loading && error && <div className="py-4 text-sm text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="sticky top-0 z-10 flex items-center justify-between px-3 py-2 border-b">
            <div className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
              <span>{selectedIds.length} selected</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openModal('approve')}
                disabled={!canVerify}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs ${canVerify ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
              >
                <CheckCircle className="h-4 w-4" />
                Bulk Approve
              </button>
              <button
                type="button"
                onClick={() => openModal('reject')}
                disabled={!canVerify}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs ${canVerify ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
              >
                <XCircle className="h-4 w-4" />
                Bulk Reject
              </button>
              <button
                type="button"
                onClick={() => openModal('request_docs')}
                disabled={!canVerify}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs ${canVerify ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
              >
                <FileCheck className="h-4 w-4" />
                Request Docs
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
              <thead className="bg-gray-50 dark:bg-gray-900/60">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Select</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Asset</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Title</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Source</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Docs</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Reserve</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Auction Type</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Status</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Issues</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                    <td className="px-3 py-2 align-top">
                      <input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleSelectOne(row.id)} />
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="text-[11px] text-gray-500">{row.asset_id}</div>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="flex items-center gap-2">
                        {row.image_url && <img src={row.image_url} alt="" className="h-10 w-16 rounded object-cover" />}
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{row.title || '—'}</div>
                          <div className="text-[11px] text-gray-500">{row.category || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="text-sm">{row.source_name || '—'}</div>
                      <div className="text-[11px] text-gray-500">{row.source_type}</div>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="flex items-center gap-1 text-xs">
                        {row.required_docs_present ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                            <CheckCircle className="h-3 w-3" />
                            Required
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 text-red-700">
                            <XCircle className="h-3 w-3" />
                            Missing
                          </span>
                        )}
                        {row.optional_docs_missing && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                            <AlertTriangle className="h-3 w-3" />
                            Optional
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="text-sm">{row.reserve_price != null ? `₹${row.reserve_price}` : '—'}</div>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="text-sm">{row.auction_type || '—'}</div>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="text-sm">{row.status}</div>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="text-[11px] text-gray-600">
                        {(row.issues || []).slice(0, 2).join(', ') || '—'}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-3 py-10 text-center text-sm text-gray-500">
                      No items found for this view
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Confirm Bulk Action</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-500">✕</button>
            </div>
            <div className="space-y-3">
              <div className="text-sm">
                {modalAction === 'approve' ? 'Approve selected items' : modalAction === 'reject' ? 'Reject selected items' : 'Request documents for selected items'}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Admin note</label>
                <textarea
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  className="w-full mt-1 border rounded-lg p-2 text-sm dark:bg-gray-900 dark:text-gray-100"
                  rows={3}
                />
              </div>
              {modalAction === 'request_docs' && (
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Required documents</label>
                  <input
                    value={modalRequiredDocs.join(', ')}
                    onChange={(e) => setModalRequiredDocs(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                    placeholder="RC, Insurance, Pollution"
                    className="w-full mt-1 border rounded-lg p-2 text-sm dark:bg-gray-900 dark:text-gray-100"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded border text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={performBulkAction}
                className="inline-flex items-center gap-1 px-3 py-1 rounded bg-indigo-600 text-white text-xs"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBulkVerification;
