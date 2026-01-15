import { useEffect, useState } from 'react';
import { useLiveAuctionSocket } from '../../hooks/useLiveAuctionSocket';
import { BidOverlayManager } from './BidOverlayManager';
import { DepositBanner } from './DepositBanner';
import { DepositFlowModal } from './DepositFlowModal';
import LiveWinnerReveal from '../../components/live/LiveWinnerReveal';
import { StatusStrip } from '@/components';

interface LiveAuctionRoomProps {
  auctionId: string;
  token?: string;
}

export function LiveAuctionRoom({ auctionId, token }: LiveAuctionRoomProps) {
  const [bidAmount, setBidAmount] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWinnerReveal, setShowWinnerReveal] = useState(false);

  const {
    connected,
    overlays,
    lastError,
    depositRequired,
    clearDepositRequired,
    placeBid,
    auctionEnded,
  } = useLiveAuctionSocket({
    auctionId,
    token,
  });

  useEffect(() => {
    if (auctionEnded) {
      setShowWinnerReveal(true);
    }
  }, [auctionEnded]);

  const handlePlaceBid = () => {
    const cents = Math.round(Number(bidAmount || '0') * 100);
    if (!cents || Number.isNaN(cents)) return;

    const idempotencyKey = `${auctionId}-${Date.now()}`;
    placeBid(cents, idempotencyKey);
    setBidAmount('');
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Live Stream Auction</h1>
        <span className="text-xs font-medium text-gray-500">
          Socket: {connected ? 'Connected' : 'Connecting...'}
        </span>
      </div>

      <div className="w-full">
        <StatusStrip
          phoneVerified={true}
          kycVerified={true}
          tokenActive={true}
          depositPaid={!depositRequired}
          walletBalance={null}
          requiredDeposit={
            depositRequired?.minDepositCents
              ? depositRequired.minDepositCents / 100
              : 5000
          }
          yardRequiresToken={false}
          onPayDeposit={() => setShowDepositModal(true)}
          compact
          showWallet={false}
        />
      </div>

      {depositRequired && (
        <DepositBanner
          minDepositCents={depositRequired.minDepositCents}
          onOpenFlow={() => setShowDepositModal(true)}
          onDismiss={clearDepositRequired}
        />
      )}

      <div className="grid flex-1 gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
        {/* Video / stream area */}
        <div className="relative flex min-h-[220px] items-center justify-center rounded-xl border border-gray-800 bg-black text-gray-400 overflow-hidden">
          <span className="text-sm">Video stream placeholder</span>
          <LiveWinnerReveal
            auctionId={auctionId}
            itemTitle="Live auction"
            itemImageUrl="/placeholder-auction.jpg"
            open={showWinnerReveal}
            onComplete={() => setShowWinnerReveal(false)}
          />
        </div>

        {/* Right panel: bidding controls (MVP) */}
        <div className="flex flex-col gap-3 rounded-xl border border-gray-800 bg-neutral-950/60 p-4">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-gray-400">Place your bid</div>
            <div className="flex gap-2">
              <input
                type="number"
                className="w-full rounded-md border border-gray-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                placeholder="Enter amount (₹)"
                value={bidAmount}
                onChange={e => setBidAmount(e.target.value)}
                min="0"
              />
              <button
                type="button"
                onClick={handlePlaceBid}
                className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-40"
              >
                Bid
              </button>
            </div>
            {lastError && (
              <div className="text-xs text-red-400">Bid error: {lastError}</div>
            )}
          </div>

          {/* TODO: show current price, timer, vehicle details using existing Supabase hooks */}
        </div>
      </div>

      <BidOverlayManager overlays={overlays} />

      <DepositFlowModal
        open={showDepositModal}
        onClose={() => {
          setShowDepositModal(false);
          clearDepositRequired();
        }}
        auctionId={auctionId}
        minDepositCents={depositRequired?.minDepositCents ?? null}
      />
    </div>
  );
}
