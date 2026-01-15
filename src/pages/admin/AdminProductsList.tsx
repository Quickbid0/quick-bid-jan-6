import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Link } from 'react-router-dom';

const AdminProductsList: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'pending_review' | 'approved' | 'live' | 'rejected' | 'archived'>('all');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('products')
          .select('id, title, category, status, verification_status, created_at')
          .order('created_at', { ascending: false });

        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        const { data, error } = await query;
        if (error) throw error;
        setProducts(data || []);
      } catch (e) {
        console.error('Error loading admin products list', e);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [statusFilter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const renderStatusBadge = (status?: string | null) => {
    if (!status) return <span className="inline-flex px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">-</span>;
    const base = 'inline-flex px-2 py-1 text-xs font-medium rounded-full ';
    switch (status) {
      case 'draft':
        return <span className={base + 'bg-gray-100 text-gray-700'}>Draft</span>;
      case 'pending_review':
        return <span className={base + 'bg-yellow-100 text-yellow-800'}>Pending review</span>;
      case 'approved':
        return <span className={base + 'bg-green-100 text-green-800'}>Approved</span>;
      case 'live':
        return <span className={base + 'bg-indigo-100 text-indigo-800'}>Live</span>;
      case 'rejected':
        return <span className={base + 'bg-red-100 text-red-800'}>Rejected</span>;
      case 'archived':
        return <span className={base + 'bg-gray-200 text-gray-700'}>Archived</span>;
      default:
        return <span className={base + 'bg-gray-100 text-gray-600'}>{status}</span>;
    }
  };

  const renderVerificationBadge = (status?: string | null) => {
    if (!status) return <span className="inline-flex px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">-</span>;
    const base = 'inline-flex px-2 py-1 text-xs font-medium rounded-full ';
    if (status === 'verified' || status === 'approved') {
      return <span className={base + 'bg-green-100 text-green-800'}>Verified</span>;
    }
    if (status === 'rejected') {
      return <span className={base + 'bg-red-100 text-red-800'}>Rejected</span>;
    }
    if (status === 'pending_review' || status === 'pending') {
      return <span className={base + 'bg-yellow-100 text-yellow-800'}>Pending</span>;
    }
    return <span className={base + 'bg-gray-100 text-gray-600'}>{status}</span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Manage all products on QuickMela</p>
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="pending_review">Pending review</option>
            <option value="approved">Approved</option>
            <option value="live">Live</option>
            <option value="rejected">Rejected</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No products found for the selected filter.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Verification</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-4 py-3 text-sm">
                    <Link
                      to={`/admin/products/${p.id}`}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      {p.title || '(Untitled)'}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{p.category || '-'}</td>
                  <td className="px-4 py-3 text-sm">{renderStatusBadge(p.status)}</td>
                  <td className="px-4 py-3 text-sm">{renderVerificationBadge(p.verification_status)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}
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

export default AdminProductsList;
