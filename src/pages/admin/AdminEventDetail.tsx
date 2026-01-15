import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';

const AdminEventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [eventData, setEventData] = useState<any | null>(null);
  const [auctions, setAuctions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [attaching, setAttaching] = useState(false);
  const [creatingAuctionFor, setCreatingAuctionFor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data: evt, error: evtErr } = await supabase
          .from('auction_events')
          .select('id, name, event_type, start_at, end_at, status, rules, location_id')
          .eq('id', id)
          .single();
        if (evtErr) throw evtErr;
        setEventData(evt);

        const { data: aucts, error: aErr } = await supabase
          .from('auctions')
          .select('id, product_id, auction_type, start_date, end_date, status, current_price')
          .eq('event_id', id);
        if (aErr) throw aErr;
        setAuctions(aucts || []);

        const { data: eventProducts, error: epErr } = await supabase
          .from('event_products')
          .select('product_id')
          .eq('event_id', id);
        if (epErr) throw epErr;

        const productIds = (eventProducts || [])
          .map((row: any) => row.product_id)
          .filter(Boolean);

        if (productIds.length > 0) {
          const { data: prods, error: prodErr } = await supabase
            .from('products')
            .select('id, title, category, status, verification_status')
            .in('id', productIds);
          if (prodErr) throw prodErr;
          setProducts(prods || []);
        } else {
          setProducts([]);
        }

        const { data: candidateProducts, error: candErr } = await supabase
          .from('products')
          .select('id, title, category, status, verification_status')
          .eq('status', 'listed')
          .eq('verification_status', 'approved');
        if (candErr) throw candErr;

        const attachedIds = new Set(productIds);
        const filteredCandidates = (candidateProducts || []).filter((p: any) => !attachedIds.has(p.id));
        setAvailableProducts(filteredCandidates);
      } catch (e) {
        console.error('Error loading event detail', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAttachProduct = async () => {
    if (!id || !selectedProductId) return;
    setAttaching(true);
    try {
      const { error } = await supabase
        .from('event_products')
        .insert({ event_id: id, product_id: selectedProductId });
      if (error) throw error;
      setSelectedProductId('');
      const { data: eventProducts, error: epErr } = await supabase
        .from('event_products')
        .select('product_id')
        .eq('event_id', id);
      if (epErr) throw epErr;
      const productIds = (eventProducts || [])
        .map((row: any) => row.product_id)
        .filter(Boolean);
      if (productIds.length > 0) {
        const { data: prods, error: prodErr } = await supabase
          .from('products')
          .select('id, title, category, status, verification_status')
          .in('id', productIds);
        if (prodErr) throw prodErr;
        setProducts(prods || []);
      } else {
        setProducts([]);
      }
      const attachedIds = new Set(productIds);
      setAvailableProducts(prev => prev.filter((p: any) => !attachedIds.has(p.id)));
    } catch (e) {
      console.error('Error attaching product to event', e);
    } finally {
      setAttaching(false);
    }
  };

  const handleCreateAuctionForProduct = async (productId: string) => {
    if (!id || !eventData) return;
    setCreatingAuctionFor(productId);
    try {
      const payload: any = {
        product_id: productId,
        event_id: id,
        auction_type: eventData.event_type === 'timed' ? 'timed' : 'live',
        status: 'scheduled',
        start_date: eventData.start_at,
        end_date: eventData.end_at,
      };

      const { error } = await supabase.from('auctions').insert(payload);
      if (error) throw error;

      const { data: aucts, error: aErr } = await supabase
        .from('auctions')
        .select('id, product_id, auction_type, start_date, end_date, status, current_price')
        .eq('event_id', id);
      if (aErr) throw aErr;
      setAuctions(aucts || []);
    } catch (e) {
      console.error('Error creating auction for event product', e);
    } finally {
      setCreatingAuctionFor(null);
    }
  };

  if (loading || !eventData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{eventData.name}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {eventData.event_type} • {eventData.start_at && new Date(eventData.start_at).toLocaleString()} - {eventData.end_at && new Date(eventData.end_at).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-200">
          <div>
            <div className="text-xs uppercase text-gray-500">Type</div>
            <div className="capitalize">{eventData.event_type}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-gray-500">Status</div>
            <div className="capitalize">{eventData.status}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-gray-500">Auctions</div>
            <div>{auctions.length}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-gray-500">Lots (products)</div>
            <div>{products.length}</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Auctions in this event</h2>
        {auctions.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No auctions have been linked to this event yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Start</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">End</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {auctions.map((a) => (
                  <tr key={a.id}>
                    <td className="px-3 py-2 font-mono text-xs">
                      <Link
                        to={`/live-auction/${a.id}`}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        {a.id}
                      </Link>
                    </td>
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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5">
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Products / Lots in this event</h2>
          <div className="flex items-center gap-2 text-sm">
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
            >
              <option value="">Attach product…</option>
              {availableProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAttachProduct}
              disabled={!selectedProductId || attaching}
              className="px-3 py-1 rounded-md bg-indigo-600 text-white text-xs font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {attaching ? 'Attaching…' : 'Attach'}
            </button>
          </div>
        </div>

        {products.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No products have been attached to this event yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Verification</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="px-3 py-2">
                      <Link
                        to={`/admin/products/${p.id}`}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{p.category}</td>
                    <td className="px-3 py-2 capitalize">{p.status}</td>
                    <td className="px-3 py-2 capitalize">{p.verification_status}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleCreateAuctionForProduct(p.id)}
                        className="inline-flex items-center px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {creatingAuctionFor === p.id ? 'Creating…' : 'Create auction'}
                      </button>
                    </td>
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

export default AdminEventDetail;
