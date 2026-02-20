import React from 'react';

/**
 * FIX 24: Add Skeleton Loaders
 * Prevents pages from flashing ₹0 or empty tables while data loads
 */

export const StatCardSkeleton: React.FC = () => (
  <div className="animate-pulse bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-gray-100 rounded w-2/3"></div>
  </div>
);

export const TableRowSkeleton: React.FC = () => (
  <tr className="animate-pulse border-b border-gray-200">
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
  </tr>
);

export const AuctionCardSkeleton: React.FC = () => (
  <div className="animate-pulse bg-white rounded-lg overflow-hidden shadow-md">
    {/* Image placeholder */}
    <div className="w-full h-48 bg-gray-200"></div>
    
    {/* Content placeholder */}
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="flex justify-between">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Stats row */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array(4)
        .fill(0)
        .map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
    </div>

    {/* Table */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <tbody>
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <TableRowSkeleton key={i} />
              ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
