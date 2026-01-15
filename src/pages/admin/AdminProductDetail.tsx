import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
import { toast } from 'react-hot-toast';
import { useSession } from '../../context/SessionContext';
import { Tooltip } from '../../components/ui/Tooltip';

const AdminProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { userProfile } = useSession();
  const canManage = ['admin', 'superadmin'].includes(userProfile?.role || '');
  const [product, setProduct] = useState<any | null>(null);
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [basePrice, setBasePrice] = useState<string>('');
  const [reservePrice, setReservePrice] = useState<string>('');
  const [status, setStatus] = useState<string>('draft');
  const [verificationStatus, setVerificationStatus] = useState<string>('unverified');
  const [adminNotes, setAdminNotes] = useState('');
  const [shippingInfo, setShippingInfo] = useState<any>({});

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data: prod, error: prodErr } = await supabase
          .from('products')
          .select('*, seller:profiles(id, name, email, is_verified)')
          .eq('id', id)
          .single();
        if (prodErr) throw prodErr;

        const { data: aucts, error: auctErr } = await supabase
          .from('auctions')
          .select('id, auction_type, start_date, end_date, status, current_price')
          .eq('product_id', id);
        if (auctErr) throw auctErr;

        setProduct(prod);
        setAuctions(aucts || []);

        setTitle(prod.title || '');
        setDescription(prod.description || '');
        setCategory(prod.category || '');
        setBasePrice(prod.base_price != null ? String(prod.base_price) : '');
        setReservePrice(prod.reserve_price != null ? String(prod.reserve_price) : '');
        setStatus(prod.status || 'draft');
        setVerificationStatus(prod.verification_status || 'unverified');
        setAdminNotes(prod.admin_notes || '');
        setShippingInfo(prod.shipping_info || {});
      } catch (e) {
        console.error('Error loading admin product detail', e);
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleSaveOverview = async () => {
    if (!id) return;
    try {
      const { error } = await supabase
        .from('products')
        .update({ title, description, category })
        .eq('id', id);
      if (error) throw error;
      toast.success('Overview updated');
    } catch (e) {
      console.error('Error saving overview', e);
      toast.error('Failed to save overview');
    }
  };

  const handleSavePricing = async () => {
    if (!id) return;
    try {
      const base = basePrice ? Number(basePrice) : null;
      const reserve = reservePrice ? Number(reservePrice) : null;
      const { error } = await supabase
        .from('products')
        .update({ base_price: base, reserve_price: reserve })
        .eq('id', id);
      if (error) throw error;
      toast.success('Pricing updated');
    } catch (e) {
      console.error('Error saving pricing', e);
      toast.error('Failed to save pricing');
    }
  };

  const handleSaveStatus = async () => {
    if (!id) return;
    try {
      const { error } = await supabase
        .from('products')
        .update({ status, verification_status: verificationStatus, admin_notes: adminNotes })
        .eq('id', id);
      if (error) throw error;
      toast.success('Status & verification updated');
    } catch (e) {
      console.error('Error saving status', e);
      toast.error('Failed to save status & verification');
    }
  };

  const handleSaveShipping = async () => {
    if (!id) return;
    try {
      const { error } = await supabase
        .from('products')
        .update({ shipping_info: shippingInfo })
        .eq('id', id);
      if (error) throw error;
      toast.success('Shipping info updated');
    } catch (e) {
      console.error('Error saving shipping info', e);
      toast.error('Failed to save shipping info');
    }
  };

  if (loading || !product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const seller = product.seller;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{product.title || 'Product'}</h1>
          <p className="text-gray-500 text-sm">
            Created {product.created_at ? new Date(product.created_at).toLocaleString() : '-'}
          </p>
        </div>
      </div>

      {/* Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-3">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            {seller && (
              <div className="mt-3 text-sm text-gray-700 dark:text-gray-200">
                <p className="font-medium">Seller: {seller.name}</p>
                <p className="text-xs text-gray-500">{seller.email}</p>
                <p className="text-xs mt-1">
                  {seller.is_verified ? (
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-800">Verified seller</span>
                  ) : (
                    <span className="px-2 py-1 rounded-full bg-red-100 text-red-800">Unverified seller</span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSaveOverview}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            Save overview
          </button>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Base price (₹)</label>
            <input
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reserve price (₹)</label>
            <input
              type="number"
              value={reservePrice}
              onChange={(e) => setReservePrice(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSavePricing}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            Save pricing
          </button>
        </div>
      </div>

      {/* Status & Verification */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Status & Verification</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="pending_review">Pending review</option>
              <option value="approved">Approved</option>
              <option value="live">Live</option>
              <option value="rejected">Rejected</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Verification</label>
            <select
              value={verificationStatus}
              onChange={(e) => setVerificationStatus(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="unverified">Unverified</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Admin notes</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Tooltip content={!canManage ? "Only Admins can change verification status" : "Update status & verification"}>
            <button
              type="button"
              data-testid="approve-product"
              disabled={!canManage}
              onClick={handleSaveStatus}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save status & verification
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Shipping */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Shipping</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Method</label>
            <input
              type="text"
              value={shippingInfo.method || ''}
              onChange={(e) => setShippingInfo({ ...shippingInfo, method: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estimated days</label>
            <input
              type="number"
              value={shippingInfo.estimated_days || ''}
              onChange={(e) => setShippingInfo({ ...shippingInfo, estimated_days: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="inline-flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                className="mr-2"
                checked={!!shippingInfo.pickup_allowed}
                onChange={(e) => setShippingInfo({ ...shippingInfo, pickup_allowed: e.target.checked })}
              />
              Pickup allowed
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Shipping charge (₹)</label>
            <input
              type="number"
              value={shippingInfo.shipping_charge || ''}
              onChange={(e) => setShippingInfo({ ...shippingInfo, shipping_charge: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSaveShipping}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            Save shipping info
          </button>
        </div>
      </div>

      {/* Auctions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Auctions</h2>
        {auctions.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No auctions found for this product.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Start</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">End</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {auctions.map((a) => (
                  <tr key={a.id}>
                    <td className="px-3 py-2 font-mono text-xs text-gray-600 dark:text-gray-300">{a.id}</td>
                    <td className="px-3 py-2 capitalize">{a.auction_type}</td>
                    <td className="px-3 py-2">{a.start_date ? new Date(a.start_date).toLocaleString() : '-'}</td>
                    <td className="px-3 py-2">{a.end_date ? new Date(a.end_date).toLocaleString() : '-'}</td>
                    <td className="px-3 py-2 capitalize">{a.status}</td>
                    <td className="px-3 py-2">{a.current_price != null ? `₹${a.current_price.toLocaleString()}` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductDetail;
