interface DepositBannerProps {
  minDepositCents: number | null;
  onOpenFlow: () => void;
  onDismiss?: () => void;
}

export function DepositBanner({ minDepositCents, onOpenFlow, onDismiss }: DepositBannerProps) {
  const amount = typeof minDepositCents === 'number' ? minDepositCents / 100 : null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-500/60 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
      <div className="flex flex-1 flex-col gap-0.5">
        <div className="font-semibold uppercase tracking-wide text-amber-200">
          Deposit required
        </div>
        <div className="text-[11px] text-amber-100/80">
          {amount
            ? `You need a minimum verified deposit of ₹${amount.toLocaleString('en-IN')} to bid in this auction.`
            : 'You need a verified security deposit to place live bids in this auction.'}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-md border border-transparent px-2 py-1 text-[11px] text-amber-100/80 hover:text-amber-50"
          >
            Later
          </button>
        )}
        <button
          type="button"
          onClick={onOpenFlow}
          className="rounded-md bg-amber-400 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-black hover:bg-amber-300"
        >
          Add deposit
        </button>
      </div>
    </div>
  );
}
