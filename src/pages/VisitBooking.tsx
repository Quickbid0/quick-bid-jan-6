import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../config/supabaseClient';

declare global { interface Window { Razorpay?: any } }

const loadRazorpay = () => new Promise<boolean>((resolve) => {
  if (window.Razorpay) return resolve(true);
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

const deviceHash = () => {
  try {
    const nav = navigator as any;
    const parts = [
      nav.userAgent,
      nav.language,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen.width + 'x' + screen.height,
    ].join('|');
    let h = 0;
    for (let i = 0; i < parts.length; i++) h = (h * 31 + parts.charCodeAt(i)) >>> 0;
    return 'd-' + h.toString(16);
  } catch { return 'd-unknown'; }
};

const logSignal = async (payload: any) => {
  try {
    await fetch('/api/log-fraud-signal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, device_hash: deviceHash() })
    });
  } catch (_) {}
};

const VisitBooking: React.FC = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const location = useLocation();
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [village, setVillage] = useState('');
  const [amount, setAmount] = useState<number>(199);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const amountParam = params.get('amount');
    if (amountParam) {
      const v = parseInt(amountParam, 10);
      if (!Number.isNaN(v) && v > 0) setAmount(v);
    }
  }, []);

  const startPayment = async () => {
    try {
      setSubmitting(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        toast.error('Please login');
        navigate('/login');
        return;
      }
      const userId = session.user.id;

      const ok = await loadRazorpay();
      if (!ok) throw new Error('Failed to load Razorpay');

      await logSignal({ kind: 'payment_initiated', user_id: userId, value_json: { type: 'visit', amount, product_id: productId || null, state, district, city, village } });
      const res = await fetch('/api/razorpay-create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount * 100,
          notes: { type: 'visit', user_id: userId, product_id: productId || null, amount, state, district, city, village }
        })
      });
      const { order, key_id, error } = await res.json();
      if (error) throw new Error(error);

      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'QuickBid',
        description: 'Inspection Visit Entry Fee',
        order_id: order.id,
        prefill: {},
        notes: { type: 'visit', user_id: userId, product_id: productId || null, amount, state, district, city, village },
        handler: async () => {
          await logSignal({ kind: 'payment_success', user_id: userId, value_json: { type: 'visit', amount, product_id: productId || null, state, district, city, village } });
          const back = (location.state as any)?.back || '/';
          navigate(`/payment/success?type=visit&back=${encodeURIComponent(back)}`, { replace: true });
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async (resp: any) => {
        await logSignal({ kind: 'payment_failed', user_id: userId, value_json: { type: 'visit', amount, product_id: productId || null, state, district, city, village, reason: resp?.error?.reason } });
        const back = (location.state as any)?.back || '/';
        navigate(`/payment/failed?type=visit&back=${encodeURIComponent(back)}`, { replace: true });
      });
      rzp.open();
    } catch (e: any) {
      toast.error(e.message || 'Failed to start payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Book Inspection Visit</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input value={state} onChange={(e) => setState(e.target.value)} placeholder="State" className="border rounded px-3 py-2" />
        <input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="District" className="border rounded px-3 py-2" />
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="border rounded px-3 py-2" />
        <input value={village} onChange={(e) => setVillage(e.target.value)} placeholder="Village" className="border rounded px-3 py-2" />
        <div className="sm:col-span-2">
          <label className="text-sm text-gray-600">Entry Fee (₹)</label>
          <input type="number" min={1} value={amount} onChange={(e) => setAmount(parseInt(e.target.value || '0', 10))} className="border rounded px-3 py-2 w-full" />
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-4">
        This small entry fee helps us coordinate serious inspection visits and avoid no-shows. You will complete the
        payment on Razorpay on the next screen.
      </p>
      <button
        onClick={startPayment}
        disabled={submitting}
        className="mt-6 w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700"
      >
        {submitting ? 'Processing…' : 'Pay & Book Visit'}
      </button>
    </div>
  );
};

export default VisitBooking;
