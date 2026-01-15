import React from 'react';

export type AuctionType = 'live' | 'timed' | 'flash' | 'tender';

interface AuctionTypeBadgeProps {
  type: AuctionType;
  className?: string;
}

export const AuctionTypeBadge: React.FC<AuctionTypeBadgeProps> = ({ type, className }) => {
  const base = 'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium';

  const colorClasses =
    type === 'live'
      ? 'bg-red-100 text-red-800'
      : type === 'timed'
      ? 'bg-blue-100 text-blue-800'
      : type === 'flash'
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-purple-100 text-purple-800';

  const label =
    type === 'live'
      ? 'LIVE AUCTION'
      : type === 'timed'
      ? 'TIMED AUCTION'
      : type === 'flash'
      ? 'FLASH AUCTION'
      : 'TENDER AUCTION';

  return <span className={`${base} ${colorClasses} ${className || ''}`.trim()}>{label}</span>;
};

export default AuctionTypeBadge;
