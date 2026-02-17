import type { BidOverlayEvent } from '../../hooks/useLiveAuctionSocket';

interface BidOverlayManagerProps {
  overlays: BidOverlayEvent[];
}

export function BidOverlayManager({ overlays }: BidOverlayManagerProps) {
  return (
    <div className="pointer-events-none fixed inset-0 flex flex-col items-end justify-end gap-2 p-4 sm:items-center sm:justify-start sm:p-8">
      <Fragment>
        {overlays.map((overlay, index) => (
          <div
            key={`${overlay.username}-${overlay.amountCents}-${index}-${Date.now()}`}
}
}
}
}
            className="pointer-events-auto rounded-full bg-black/70 px-4 py-2 text-sm text-white shadow-lg backdrop-blur"
          >
            <span className="font-semibold">{overlay.username}</span>
            <span className="mx-2 text-xs text-gray-300">placed bid</span>
            <span className="font-bold">₹{(overlay.amountCents / 100).toLocaleString('en-IN')}</span>
            {overlay.flags?.type === 'admin_override' && (
              <span className="ml-2 rounded-full bg-amber-500/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                Admin Adjusted
              </span>
            )}
          </div>
        ))}
      </Fragment>
    </div>
  );
}
