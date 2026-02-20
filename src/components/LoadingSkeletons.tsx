import React from 'react';

/**
 * Loading Skeleton Components
 * Used while data is being fetched to show placeholder UI
 */

// Utility skeleton component
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gray-300 animate-pulse rounded ${className}`} />
  );
}

// ============================================================================
// AUCTION DETAIL SKELETON
// ============================================================================

export function AuctionDetailSkeleton() {
  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 px-4 md:px-6 py-3">
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-4 md:p-6">
        {/* LEFT: Gallery */}
        <div className="md:col-span-2 space-y-4">
          {/* Main Image */}
          <Skeleton className="w-full aspect-square" />
          
          {/* Thumbnails */}
          <div className="flex gap-2">
            <Skeleton className="w-16 h-16 flex-shrink-0" />
            <Skeleton className="w-16 h-16 flex-shrink-0" />
            <Skeleton className="w-16 h-16 flex-shrink-0" />
            <Skeleton className="w-16 h-16 flex-shrink-0" />
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* CENTER: Price */}
        <div className="md:col-span-2 space-y-4">
          {/* Price */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-40" />
          </div>

          {/* Countdown */}
          <Skeleton className="h-24 w-full" />

          {/* Trust Signals */}
          <Skeleton className="h-32 w-full" />

          {/* Item Details */}
          <Skeleton className="h-40 w-full" />
        </div>

        {/* RIGHT: Bid Panel */}
        <div className="md:col-span-1 space-y-4">
          {/* Current Bid */}
          <Skeleton className="h-24 w-full" />

          {/* Bid Input */}
          <Skeleton className="h-32 w-full" />

          {/* Wallet */}
          <Skeleton className="h-20 w-full" />

          {/* Seller */}
          <Skeleton className="h-24 w-full" />

          {/* Watch Button */}
          <Skeleton className="h-12 w-full" />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-t border-gray-200 px-4 md:px-6 py-6">
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

// ============================================================================
// AUCTION LIST SKELETON
// ============================================================================

export function AuctionListSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-lg overflow-hidden border border-gray-200">
          <div className="flex gap-4 p-4">
            {/* Image */}
            <Skeleton className="w-24 h-24 flex-shrink-0" />

            {/* Content */}
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>

            {/* Price */}
            <div className="text-right">
              <Skeleton className="h-6 w-24 ml-auto" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// DASHBOARD SKELETON
// ============================================================================

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>

      {/* Active Bids Section */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>

      {/* Won Auctions & Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SEARCH RESULTS SKELETON
// ============================================================================

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-56 w-full" />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// SELLER PROFILE SKELETON
// ============================================================================

export function SellerProfileSkeleton() {
  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex gap-4 items-start">
        <Skeleton className="w-24 h-24 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>

      {/* Listings */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// GENERIC CARD SKELETON
// ============================================================================

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-10 w-32 mt-4" />
    </div>
  );
}

// ============================================================================
// TABLE SKELETON
// ============================================================================

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex gap-4 pb-4 border-b border-gray-200">
        <Skeleton className="h-4 w-24 flex-1" />
        <Skeleton className="h-4 w-24 flex-1" />
        <Skeleton className="h-4 w-24 flex-1" />
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-4 border-b border-gray-100">
          <Skeleton className="h-4 w-24 flex-1" />
          <Skeleton className="h-4 w-24 flex-1" />
          <Skeleton className="h-4 w-24 flex-1" />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// TEXT SKELETON (Paragraph)
// ============================================================================

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 w-full ${i === lines - 1 ? 'w-3/4' : ''}`}
        />
      ))}
    </div>
  );
}

// ============================================================================
// LIST SKELETON
// ============================================================================

export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded">
          <Skeleton className="w-4 h-4 flex-shrink-0 mt-1" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );
}
