import React, { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { feeService } from '../services/feeService';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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

const DepositCheckout: React.FC = () => {
  const [processing, setProcessing] = useState(true);
  const [convenienceFee, setConvenienceFee] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const navigate = useNavigate();
  const { productId } = useParams();
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
        const params = new URLSearchParams(window.location.search);
        const amountParam = params.get('amount');
        const amount = amountParam ? parseInt(amountParam, 10) : 5000;
        // Validate productId; fallback to env-provided test UUID if configured
        const isUUID = (s: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(s);
        const envTestId = (import.meta as any).env?.VITE_TEST_PRODUCT_ID as string | undefined;
        const targetProductId = productId && isUUID(productId)
          ? productId
          : (envTestId && isUUID(envTestId) ? envTestId : undefined);
        if (!targetProductId) {
          toast.error('Invalid product id. Please pass a valid product UUID or set VITE_TEST_PRODUCT_ID.');
          navigate('/', { replace: true });
          return;
        }

        const ok = await loadRazorpay();
        if (!ok) throw new Error('Failed to load Razorpay');

        // Calculate convenience fee via fee engine
        const rule = await feeService.getActiveRule(null, null);
        const comps = feeService.calculateComponents(rule, { amountBase: amount });
        const conv = comps.convenience || 0;
        setConvenienceFee(conv);
        setTotalAmount(amount + conv);

        // Create order via Netlify function (amount in paise)
        await logSignal({ kind: 'payment_initiated', user_id: userId, value_json: { type: 'security', amount, convenience: conv, product_id: targetProductId } });
        const res = await fetch('/api/razorpay-create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: (amount + conv) * 100, notes: { type: 'security', user_id: userId, product_id: targetProductId, base_amount: amount, convenience: conv } })
        });
        const { order, key_id, error } = await res.json();
        if (error) throw new Error(error);

        const options = {
          key: key_id,
          amount: order.amount,
          currency: order.currency,
          name: 'QuickBid',
          description: 'Security Deposit',
          order_id: order.id,
          prefill: {},
          notes: { type: 'security', user_id: userId, product_id: targetProductId, amount, convenience: conv },
          handler: async () => {
            await logSignal({ kind: 'payment_success', user_id: userId, value_json: { type: 'security', amount, convenience: conv, product_id: targetProductId } });
            // Record fee application for convenience
            try {
              if (conv > 0) {
                await feeService.recordApplication(rule?.id || null, { orderId: order.id, productId: targetProductId, amountBase: amount }, { convenience: conv }, `user:${userId}`);
              }
            } catch (_) {}
            const back = (location.state as any)?.back || '/';
            navigate(`/payment/success?type=security&back=${encodeURIComponent(back)}`, { replace: true });
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', async (resp: any) => {
          console.error(resp);
          await logSignal({ kind: 'payment_failed', user_id: userId, value_json: { type: 'security', amount, product_id: targetProductId, reason: resp?.error?.reason } });
          const back = (location.state as any)?.back || '/';
          navigate(`/payment/failed?type=security&back=${encodeURIComponent(back)}`, { replace: true });
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
  }, [navigate, productId, location.state]);

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold mb-2 text-center">Confirm Your Security Deposit</h1>
      <p className="text-sm text-gray-600 text-center mb-3">
        This refundable deposit allows you to participate in bidding for this asset. Review the breakdown below before
        we open the secure Razorpay payment window.
      </p>
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded p-4">
        <div className="flex items-center justify-between text-sm mb-1"><span>Base amount</span><span>₹{new URLSearchParams(window.location.search).get('amount') || 5000}</span></div>
        <div className="flex items-center justify-between text-sm mb-1"><span>Convenience fee</span><span>₹{convenienceFee}</span></div>
        <div className="border-t mt-2 pt-2 flex items-center justify-between font-medium"><span>Total</span><span>₹{totalAmount}</span></div>
      </div>
      <p className="text-gray-600 text-center mt-3 text-xs">
        On the next screen you will complete the payment on Razorpay. Your deposit is securely held and is refunded if
        you do not win the auction, subject to platform terms.
      </p>
      {processing && (<div className="mt-6 animate-pulse h-10 bg-gray-200 rounded" />)}
    </div>
  );
};

export default DepositCheckout;
