import React from 'react';
import { Skeleton } from './skeleton';

export const TableSkeleton = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => {
  return (
    <div className="w-full space-y-4">
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-8 w-full" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={`row-${i}`} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={`cell-${i}-${j}`} className="h-12 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const KPICardSkeleton = () => {
  return (
    <div className="p-4 border rounded-lg space-y-3 bg-card text-card-foreground shadow-sm">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      <Skeleton className="h-8 w-[120px]" />
      <Skeleton className="h-4 w-[80px]" />
    </div>
  );
};

export const AuctionCardSkeleton = () => {
  return (
    <div className="border rounded-lg overflow-hidden space-y-3 bg-card shadow-sm">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-[150px]" />
          <Skeleton className="h-6 w-[80px]" />
        </div>
        <Skeleton className="h-4 w-full" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
      </div>
    </div>
  );
};
