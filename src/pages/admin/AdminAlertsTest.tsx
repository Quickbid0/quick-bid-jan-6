import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { notificationService } from '../../services/notificationService';

const AdminAlertsTest: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [productId, setProductId] = useState('');
  const [startsAt, setStartsAt] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: profiles } = await supabase.from('profiles').select('id, full_name').limit(50);
        setUsers(profiles || []);
        const { data: prods } = await supabase.from('products').select('id, title').limit(50);
        setProducts(prods || []);
      } catch (e) {}
    };
    load();
  }, []);

  const testOutbid = async () => {
    setStatus('');
    try {
      if (!productId) { setStatus('Select a product'); return; }
      // Enqueue outbid events for all previous bidders (simulated amount 99999, newBidderId self)
      const self = userId || (users[0]?.id || '');
      await notificationService.enqueueOutbidEvents(productId, 99999, self);
      setStatus('Outbid events enqueued (if subscribers exist)');
    } catch (e: any) {
      setStatus(e.message || 'Failed to enqueue outbid events');
    }
  };

  const testAuctionStarting = async () => {
    setStatus('');
    try {
      if (!productId || !startsAt) { setStatus('Select a product and start time'); return; }
      // Find watchers/bidders and enqueue auction starting events via service
      const startsIso = new Date(startsAt).toISOString();
      const { data: bids } = await supabase.from('bids').select('user_id').eq('product_id', productId);
      const userIds = Array.from(new Set((bids || []).map(b => (b as any).user_id)));
      await notificationService.enqueueAuctionStarting(productId, startsIso, userIds);
      setStatus('Auction starting events enqueued');
    } catch (e: any) {
      setStatus(e.message || 'Failed to enqueue auction starting');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Alerts Test</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-sm mb-1">Select User (optional for outbid new bidder)</label>
          <select className="w-full border rounded px-3 py-2" value={userId} onChange={e => setUserId(e.target.value)}>
            <option value="">(auto)</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.full_name || u.id}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Select Product</label>
          <select className="w-full border rounded px-3 py-2" value={productId} onChange={e => setProductId(e.target.value)}>
            <option value="">-- choose --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.title || p.id}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <button onClick={testOutbid} className="px-4 py-2 bg-indigo-600 text-white rounded">Test Outbid Enqueue</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end mb-6">
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Auction Starts At</label>
          <input type="datetime-local" className="w-full border rounded px-3 py-2" value={startsAt} onChange={e => setStartsAt(e.target.value)} />
        </div>
        <button onClick={testAuctionStarting} className="px-4 py-2 bg-green-600 text-white rounded">Enqueue Auction Starting</button>
      </div>

      {status && <div className="text-sm text-gray-700 dark:text-gray-300">{status}</div>}

      <p className="text-xs text-gray-500 mt-6">Note: Delivery to providers is handled by a separate worker. These buttons only enqueue events respecting user consent.</p>
    </div>
  );
};

export default AdminAlertsTest;
