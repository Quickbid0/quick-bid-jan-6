import React from 'react';
import { useLiveCountdown } from '../hooks/useLiveCountdown';

interface CountdownDisplayProps {
  auctionId: string;
  className?: string;
}

export function CountdownDisplay({ auctionId, className = '' }: CountdownDisplayProps) {
  const {
    formattedTime,
    timeComponents,
    isActive,
    isEndingSoon,
    isCritical,
    urgencyColor,
    warnings,
    extension,
    isLoading
  } = useLiveCountdown(auctionId);

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-8 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className={`text-gray-500 text-lg font-medium ${className}`}>
        Auction Ended
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main countdown display */}
      <div className={`text-2xl font-bold px-4 py-2 rounded-lg border-2 transition-all duration-300 ${urgencyColor}`}>
        {formattedTime}
      </div>

      {/* Time components breakdown */}
      <div className="flex gap-2 mt-2 text-sm text-gray-600">
        {timeComponents.days > 0 && (
          <span className="bg-gray-100 px-2 py-1 rounded">
            {timeComponents.days}d
          </span>
        )}
        {timeComponents.hours > 0 && (
          <span className="bg-gray-100 px-2 py-1 rounded">
            {timeComponents.hours}h
          </span>
        )}
        {timeComponents.minutes > 0 && (
          <span className="bg-gray-100 px-2 py-1 rounded">
            {timeComponents.minutes}m
          </span>
        )}
        <span className={`px-2 py-1 rounded ${
          isCritical ? 'bg-red-100 text-red-600' : 'bg-gray-100'
        }`}>
          {timeComponents.seconds}s
        </span>
      </div>

      {/* Warnings */}
      {warnings.map((warning, index) => (
        <div
          key={index}
          className="absolute top-full left-0 right-0 mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm animate-bounce z-10"
        >
          ⚠️ {warning.message}
        </div>
      ))}

      {/* Extension notification */}
      {extension && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm animate-pulse z-10">
          ⏰ Auction extended by {extension.extensionMinutes} minutes!
        </div>
      )}

      {/* Visual indicator for critical time */}
      {isCritical && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
      )}
    </div>
  );
}

// Compact version for smaller spaces
export function CompactCountdown({ auctionId, className = '' }: CountdownDisplayProps) {
  const {
    formattedTime,
    isActive,
    isEndingSoon,
    isCritical,
    urgencyColor,
    isLoading
  } = useLiveCountdown(auctionId);

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className={`text-gray-500 text-sm font-medium ${className}`}>
        Ended
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className={`text-lg font-semibold px-3 py-1 rounded border transition-all duration-300 ${urgencyColor}`}>
        {formattedTime}
      </div>
      
      {/* Critical indicator */}
      {isCritical && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
      )}
    </div>
  );
}

// Badge version for lists
export function CountdownBadge({ auctionId, className = '' }: CountdownDisplayProps) {
  const {
    formattedTime,
    isActive,
    isEndingSoon,
    isCritical,
    urgencyColor,
    isLoading
  } = useLiveCountdown(auctionId);

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-12"></div>
      </div>
    );
  }

  if (!isActive) {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${className}`}>
        Ended
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${urgencyColor} ${className}`}>
      {formattedTime}
      {isCritical && (
        <div className="ml-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
      )}
    </span>
  );
}
