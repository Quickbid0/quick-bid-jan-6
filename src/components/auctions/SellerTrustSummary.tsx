import React from 'react';
import { Shield, Star, Users } from 'lucide-react';

export interface SellerTrustSummaryProps {
  name: string;
  avatarUrl?: string | null;
  verified?: boolean;
  verificationLabelVerified?: string;
  verificationLabelPending?: string;
  rating?: number | null;
  totalSales?: number | null; // legacy prop, kept for compatibility
  auctionsCount?: number | null;
  totalSalesAmount?: number | null;
  profileHref?: string | null;
  profileLabel?: string;
  size?: 'sm' | 'md';
}

const SellerTrustSummary: React.FC<SellerTrustSummaryProps> = ({
  name,
  avatarUrl,
  verified,
  verificationLabelVerified = 'Trusted / KYC verified seller',
  verificationLabelPending = 'Seller verification in progress',
  rating,
  totalSales,
  auctionsCount,
  totalSalesAmount,
  profileHref,
  profileLabel = 'View seller profile',
  size = 'md',
}) => {
  const avatarSize = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';

  const metricsAuctions = typeof auctionsCount === 'number' ? auctionsCount : null;
  const metricsSales =
    typeof totalSalesAmount === 'number'
      ? totalSalesAmount
      : typeof totalSales === 'number'
        ? totalSales
        : null;

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
      <span className="inline-flex items-center gap-2">
        <img
          src={avatarUrl || 'https://via.placeholder.com/32'}
          alt={name}
          className={`${avatarSize} rounded-full object-cover`}
        />
        <span className="font-medium text-gray-800 dark:text-gray-100">{name}</span>
      </span>
      {typeof verified === 'boolean' && (
        <span
          className={
            verified
              ? 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 border border-gray-200'
          }
        >
          <Shield className="h-3 w-3" />
          {verified ? verificationLabelVerified : verificationLabelPending}
        </span>
      )}
      {typeof rating === 'number' && !Number.isNaN(rating) && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          <Star className="h-3 w-3" />
          <span>Rating: {rating.toFixed(1)} / 5</span>
        </span>
      )}
      {(metricsAuctions !== null || metricsSales !== null) && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          <Star className="h-3 w-3" />
          <span>
            {metricsAuctions !== null && `${metricsAuctions} auctions`}
            {metricsAuctions !== null && metricsSales !== null && ' · '}
            {metricsSales !== null && `₹${metricsSales.toLocaleString()} sold`}
          </span>
        </span>
      )}
      {profileHref && (
        <a
          href={profileHref}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
        >
          <Users className="h-3 w-3" />
          {profileLabel}
        </a>
      )}
    </div>
  );
};

export default SellerTrustSummary;
