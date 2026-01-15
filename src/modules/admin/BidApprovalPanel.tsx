import { useState } from 'react';
import { useAdminAuctionSocket } from '../../hooks/useAdminAuctionSocket';

interface BidApprovalPanelProps {
  auctionId: string;
  token?: string;
}

export function BidApprovalPanel({ auctionId, token }: BidApprovalPanelProps) {
  const [overrideAmount, setOverrideAmount] = useState<Record<string, string>>({});

  const {
    connected,
    pendingBids,
    adminActions,
    approveBid,
    rejectBid,
    overrideBid,
  } = useAdminAuctionSocket({ auctionId, token });

  const handleOverride = (bidId: string) => {
    const raw = overrideAmount[bidId];
    const value = Number(raw);
    if (!raw || Number.isNaN(value) || value <= 0) return;
    const cents = Math.round(value * 100);
    overrideBid(bidId, cents);
  };

  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-gray-800 bg-neutral-950/70 p-4 text-sm text-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Pending bids
          </div>
          <div className="text-[11px] text-gray-500">
            Review and accept, reject, or override bids for this live auction.
          </div>
        </div>
        <span className="text-[11px] text-gray-500">
          Socket: {connected ? 'Connected' : 'Connecting...'}
        </span>
      </div>

      <div className="max-h-72 overflow-y-auto rounded-lg border border-gray-800 bg-neutral-950">
        {pendingBids.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-gray-500">
            No pending bids right now.
          </div>
        ) : (
          <table className="min-w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-800 bg-neutral-900/80 text-[11px] uppercase tracking-wide text-gray-400">
                <th className="px-3 py-2 text-left">Bidder</th>
                <th className="px-3 py-2 text-right">Amount</th>
                <th className="px-3 py-2 text-right">Override</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingBids.map(bid => (
                <tr key={bid.id} className="border-b border-gray-900/70 hover:bg-neutral-900/60">
                  <td className="px-3 py-2 align-middle">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-medium">{bid.username || 'Bidder'}</span>
                      <span className="text-[10px] text-gray-500">#{bid.id.slice(0, 6)}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right align-middle font-semibold">
                    {typeof bid.amountCents === 'number'
                      ? `₹${(bid.amountCents / 100).toLocaleString('en-IN')}`
                      : '—'}
                  </td>
                  <td className="px-3 py-2 text-right align-middle">
                    <div className="flex items-center justify-end gap-1">
                      <input
                        type="number"
                        min="0"
                        className="w-20 rounded-md border border-gray-700 bg-neutral-900 px-2 py-1 text-[11px] text-gray-100 outline-none focus:border-emerald-500"
                        placeholder="₹"
                        value={overrideAmount[bid.id] || ''}
                        onChange={e =>
                          setOverrideAmount(prev => ({ ...prev, [bid.id]: e.target.value }))
                        }
                      />
                      <button
                        type="button"
                        onClick={() => handleOverride(bid.id)}
                        className="rounded-md bg-amber-500 px-2 py-1 text-[10px] font-semibold text-black hover:bg-amber-400"
                      >
                        Override
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right align-middle">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => rejectBid(bid.id)}
                        className="rounded-md border border-red-500/70 px-2 py-1 text-[10px] font-semibold text-red-300 hover:bg-red-500/10"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => approveBid(bid.id)}
                        className="rounded-md bg-emerald-500 px-2 py-1 text-[10px] font-semibold text-black hover:bg-emerald-400"
                      >
                        Accept
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-2 space-y-1 text-[11px] text-gray-500">
        <div className="font-semibold uppercase tracking-wide text-gray-400">Recent admin actions</div>
        {adminActions.length === 0 ? (
          <div className="text-[11px] text-gray-600">No recent actions.</div>
        ) : (
          <ul className="max-h-28 overflow-y-auto space-y-0.5">
            {adminActions.map((entry, idx) => (
              <li key={idx} className="flex items-center justify-between text-[11px]">
                <span className="text-gray-300">{entry.action.type}</span>
                {entry.action.bidId && (
                  <span className="text-gray-500">#{entry.action.bidId.slice(0, 6)}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
