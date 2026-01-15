import { useState } from 'react';
import { initiateDeposit, getDepositStatus } from '../../services/depositService';

interface DepositFlowModalProps {
  open: boolean;
  onClose: () => void;
  auctionId: string;
  minDepositCents: number | null;
}

// NOTE: This is a mock payment/deposit flow for MVP. It simulates
// a successful deposit without integrating a real gateway.
export function DepositFlowModal({ open, onClose, auctionId, minDepositCents }: DepositFlowModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollAttempts, setPollAttempts] = useState(0);

  if (!open) return null;

  const amount = typeof minDepositCents === 'number' ? minDepositCents / 100 : null;

  const loadRazorpaySdk = () =>
    new Promise<boolean>((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const pollForVerification = async (depositId: string) => {
    let status: string = 'pending';
    const start = Date.now();
    let attempts = 0;

    while (status === 'pending' && Date.now() - start < 30000) {
      attempts += 1;
      setPollAttempts(attempts);
      const delay = Math.min(5000, Math.round(1500 * Math.pow(1.25, attempts - 1)));
      await new Promise(resolve => setTimeout(resolve, delay));

      const result = await getDepositStatus(depositId);
      status = result.status;
    }

    if (status !== 'verified') {
      const msg = attempts
        ? `Verification still pending after ${attempts} checks. We will keep polling but please retry if it continues to fail.`
        : 'Deposit could not be verified. Please try again.';
      throw new Error(msg);
    }
  };

  const handlePay = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const amountCents =
        typeof minDepositCents === 'number' && minDepositCents > 0
          ? minDepositCents
          : 0;

      const { depositId, order, key_id } = await initiateDeposit({
        amountCents,
        auctionId,
      });
      const sdkLoaded = await loadRazorpaySdk();
      if (!sdkLoaded) {
        throw new Error('Unable to load Razorpay payment window. Please refresh and try again.');
      }

      await new Promise<void>((resolve, reject) => {
        const options = {
          key: key_id,
          amount: order.amount,
          currency: order.currency,
          name: 'QuickBid',
          description: 'Security deposit',
          order_id: order.id,
          prefill: {},
          handler: async () => {
            try {
              await pollForVerification(depositId);
              setSuccess(true);
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: {
            ondismiss: () => {
              reject(new Error('Payment window closed. Please try again.'));
            },
          },
        } as any;

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', () => reject(new Error('Payment failed. Please try again.')));
        rzp.open();
      });
    } catch (e: any) {
      setError(e.message || 'Failed to process deposit. Please try again or contact support if the issue persists.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-700 bg-neutral-950 p-4 text-sm text-gray-100 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Security deposit for live bidding</h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-xs text-gray-400 hover:text-gray-200"
          >
            Close
          </button>
        </div>

        {!success ? (
          <>
            <p className="mb-3 text-xs text-gray-300">
              To participate in this live auction, you need a verified security deposit that will be
              held in escrow while you bid. This protects sellers and keeps the auction fair.
            </p>
            <div className="mb-3 rounded-lg bg-neutral-900 p-3 text-xs">
              <div className="mb-1 text-gray-400">Auction ID</div>
              <div className="mb-2 font-mono text-[11px] text-gray-200">{auctionId}</div>
              <div className="flex items-baseline gap-1">
                <span className="text-gray-400">Required deposit:</span>
                <span className="text-sm font-semibold text-emerald-400">
                  {amount
                    ? `₹${amount.toLocaleString('en-IN')}`
                    : 'Shown in payment step'}
                </span>
              </div>
            </div>

            {error && <div className="mb-2 text-xs text-red-400">{error}</div>}

            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md border border-gray-700 px-3 py-1 text-gray-300 hover:bg-neutral-900"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePay}
                className="rounded-md bg-emerald-500 px-3 py-1 font-semibold text-black hover:bg-emerald-400 disabled:opacity-40"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Pay & Verify Deposit'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-3 rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-100">
              <div className="font-semibold">Deposit verified for this auction</div>
              <div className="mt-1 text-emerald-100/90">
                You can now place live bids. Your deposit will remain locked in escrow according to
                QuickMela auction policies.
              </div>
            </div>
            <div className="flex justify-end text-xs">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md bg-emerald-500 px-3 py-1 font-semibold text-black hover:bg-emerald-400"
              >
                Back to auction
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
