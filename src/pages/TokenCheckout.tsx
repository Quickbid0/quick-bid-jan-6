import React, { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { feeService } from '../services/feeService';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

declare global {
  interface Window { Razorpay?: any }
}

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

const TokenCheckout: React.FC = () => {
  const [processing, setProcessing] = useState(true);
  const [baseAmount] = useState<number>(100);
  const [convenienceFee, setConvenienceFee] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(100);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const run = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) {
          toast.error('Please login');
          navigate('/login');
          return;
        }
        const userId = session.user.id;

        const ok = await loadRazorpay();
        if (!ok) throw new Error('Failed to load Razorpay');

        // Calculate fees (convenience fee applied to token)
        const rule = await feeService.getActiveRule(null, null);
        const comps = feeService.calculateComponents(rule, { amountBase: baseAmount });
        const conv = comps.convenience || 0;
        setConvenienceFee(conv);
        setTotalAmount(baseAmount + conv);

        // Create order via Netlify function (amount in paise)
        await logSignal({ kind: 'payment_initiated', user_id: userId, value_json: { type: 'token', amount: baseAmount, convenience: conv } });
        const res = await fetch('/api/razorpay-create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: (baseAmount + conv) * 100, notes: { type: 'token', user_id: userId, base_amount: baseAmount, convenience: conv } })
        });
        const { order, key_id, error } = await res.json();
        if (error) throw new Error(error);

        const options = {
          key: key_id,
          amount: order.amount,
          currency: order.currency,
          name: 'QuickBid',
          description: 'Token Fee',
          order_id: order.id,
          prefill: {},
          notes: { type: 'token', user_id: userId, amount: baseAmount, convenience: conv },
          handler: async () => {
            await logSignal({ kind: 'payment_success', user_id: userId, value_json: { type: 'token', amount: baseAmount, convenience: conv } });
            // Record fee application (convenience only for token)
            try {
              if (conv > 0) {
                await feeService.recordApplication(rule?.id || null, { orderId: order.id, amountBase: baseAmount }, { convenience: conv }, `user:${userId}`);
              }
            } catch (_) {}
            const back = (location.state as any)?.back || '/';
            navigate(`/payment/success?type=token&back=${encodeURIComponent(back)}`, { replace: true });
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', async (resp: any) => {
          console.error(resp);
          await logSignal({ kind: 'payment_failed', user_id: userId, value_json: { type: 'token', reason: resp?.error?.reason } });
          const back = (location.state as any)?.back || '/';
          navigate(`/payment/failed?type=token&back=${encodeURIComponent(back)}`, { replace: true });
        });
        rzp.open();
      } catch (e: any) {
        console.error(e);
        toast.error(e.message || 'Failed to start payment');
        navigate('/', { replace: true });
      } finally {
        setProcessing(false);
      }
    };
    run();
  }, [navigate, location.state]);

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold mb-2 text-center">Confirm Your One-Time Token Fee</h1>
      <p className="text-sm text-gray-600 text-center mb-3">
        This small one-time fee helps us keep Quick Mela safe and filter out fake accounts. Review the total before we
        open the secure Razorpay payment window.
      </p>
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded p-4">
        <div className="flex items-center justify-between text-sm mb-1"><span>Base amount</span><span>₹{baseAmount}</span></div>
        <div className="flex items-center justify-between text-sm mb-1"><span>Convenience fee</span><span>₹{convenienceFee}</span></div>
        <div className="border-t mt-2 pt-2 flex items-center justify-between font-medium"><span>Total</span><span>₹{totalAmount}</span></div>
      </div>
      <p className="text-gray-600 text-center mt-3 text-xs">
        You will complete this payment on Razorpay. After success, you can pay refundable security deposits and join
        higher value auctions.
      </p>
      {processing && (<div className="mt-6 animate-pulse h-10 bg-gray-200 rounded" />)}
    </div>
  );
};

export default TokenCheckout;
