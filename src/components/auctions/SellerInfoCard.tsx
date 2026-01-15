import React, { useEffect, useState } from 'react';

export interface SellerInfo {
  sellerId: string;
  name: string | null;
  rating: number | null;
  totalAuctions: number;
  totalItemsSold: number;
  kycStatus: string;
  location: string | null;
  joinedAt: string | null;
  avatarUrl: string | null;
}

interface SellerInfoCardProps {
  sellerId: string;
}

export const SellerInfoCard: React.FC<SellerInfoCardProps> = ({ sellerId }) => {
  const [seller, setSeller] = useState<SellerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadSeller = async () => {
      try {
        const res = await fetch(`/api/sellers/${sellerId}`);
        if (!res.ok) {
          throw new Error(`Failed to load seller info: ${res.status}`);
        }
        const data = (await res.json()) as SellerInfo;
        if (!cancelled) setSeller(data);
      } catch (e) {
        if (!cancelled) setSeller(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (sellerId) {
      loadSeller();
    }

    return () => {
      cancelled = true;
    };
  }, [sellerId]);

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!seller) return null;

  const joinedLabel = seller.joinedAt ? new Date(seller.joinedAt).toLocaleDateString() : null;
  const kycLabel = seller.kycStatus?.toUpperCase?.() || 'PENDING';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-3">
        <img
          src={seller.avatarUrl || 'https://via.placeholder.com/48'}
          alt={seller.name || 'Seller'}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {seller.name || 'Verified Seller'}
            </h3>
            {kycLabel === 'VERIFIED' && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-100">
                KYC VERIFIED
              </span>
            )}
          </div>
          {seller.location && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{seller.location}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Rating</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {seller.rating !== null ? `${seller.rating.toFixed(1)} / 5` : '—'}
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Auctions Completed</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{seller.totalAuctions}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Items Sold</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{seller.totalItemsSold}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Joined</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{joinedLabel || '—'}</p>
        </div>
      </div>
    </div>
  );
};

export default SellerInfoCard;
