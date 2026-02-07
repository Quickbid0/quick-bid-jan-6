import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Zap, ShoppingBag, Users, Gavel } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white'
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    >
      <Loader2 className="h-full w-full" />
    </motion.div>
  );
};

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';

  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full'
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

interface PageSkeletonProps {
  variant?: 'dashboard' | 'product-list' | 'product-detail' | 'form';
}

export const PageSkeleton: React.FC<PageSkeletonProps> = ({ variant = 'dashboard' }) => {
  if (variant === 'dashboard') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton variant="rectangular" width={120} height={40} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <Skeleton variant="text" width={100} height={16} />
                <Skeleton variant="circular" width={32} height={32} />
              </div>
              <Skeleton variant="text" width={60} height={24} className="mt-2" />
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <Skeleton variant="text" width={150} height={24} className="mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton variant="circular" width={40} height={40} />
                <div className="flex-1">
                  <Skeleton variant="text" width={200} height={16} />
                  <Skeleton variant="text" width={150} height={14} className="mt-1" />
                </div>
                <Skeleton variant="rectangular" width={80} height={32} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'product-list') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <Skeleton variant="rectangular" width="100%" height={200} />
            <div className="p-4 space-y-3">
              <Skeleton variant="text" width={150} height={20} />
              <Skeleton variant="text" width={100} height={16} />
              <div className="flex justify-between items-center">
                <Skeleton variant="text" width={80} height={18} />
                <Skeleton variant="rectangular" width={60} height={28} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'product-detail') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton variant="rectangular" width="100%" height={400} />
          <div className="flex space-x-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" width={80} height={80} />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg space-y-4">
            <Skeleton variant="text" width={200} height={28} />
            <Skeleton variant="text" width={150} height={20} />
            <Skeleton variant="text" width={100} height={32} />
            <Skeleton variant="rectangular" width="100%" height={48} />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'form') {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Skeleton variant="text" width={200} height={28} />
          <Skeleton variant="text" width={300} height={16} />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton variant="text" width={100} height={14} />
              <Skeleton variant="rectangular" width="100%" height={40} />
            </div>
          ))}

          <Skeleton variant="rectangular" width="100%" height={48} />
        </div>
      </div>
    );
  }

  return <Skeleton variant="rectangular" width="100%" height={200} />;
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  variant?: 'default' | 'minimal' | 'card';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  variant = 'default'
}) => {
  const variants = {
    default: 'py-16 text-center',
    minimal: 'py-8 text-center',
    card: 'py-12 text-center bg-white dark:bg-gray-800 rounded-lg shadow-sm'
  };

  return (
    <motion.div
      className={variants[variant]}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {icon && (
        <motion.div
          className="mx-auto mb-4 text-gray-400"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {icon}
        </motion.div>
      )}

      <motion.h3
        className="text-lg font-medium text-gray-900 dark:text-white mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        {title}
      </motion.h3>

      <motion.p
        className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        {description}
      </motion.p>

      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
};

// Preset empty states for common scenarios
export const EmptyStates = {
  NoAuctions: () => (
    <EmptyState
      icon={<Gavel className="h-12 w-12" />}
      title="No auctions found"
      description="There are currently no active auctions. Check back later or create your own auction."
      action={
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Gavel className="h-4 w-4 mr-2" />
          Browse Categories
        </button>
      }
    />
  ),

  NoBids: () => (
    <EmptyState
      icon={<Zap className="h-12 w-12" />}
      title="No bids yet"
      description="Be the first to place a bid on this auction and potentially win at a great price."
      action={
        <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          Place First Bid
        </button>
      }
    />
  ),

  NoOrders: () => (
    <EmptyState
      icon={<ShoppingBag className="h-12 w-12" />}
      title="No orders yet"
      description="You haven't won any auctions yet. Start bidding to build your order history."
      action={
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <ShoppingBag className="h-4 w-4 mr-2" />
          Start Shopping
        </button>
      }
    />
  ),

  NoWatchlist: () => (
    <EmptyState
      icon={<Users className="h-12 w-12" />}
      title="Watchlist is empty"
      description="Add auctions to your watchlist to get notified about price changes and bidding activity."
    />
  ),

  SearchNoResults: ({ query }: { query: string }) => (
    <EmptyState
      icon={<Search className="h-12 w-12" />}
      title="No results found"
      description={`We couldn't find any auctions matching "${query}". Try adjusting your search terms or browse our categories.`}
      action={
        <button className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
          Browse All Auctions
        </button>
      }
    />
  )
};

interface MicroInteractionProps {
  children: React.ReactNode;
  onClick?: () => void;
  scale?: number;
  className?: string;
}

export const MicroInteraction: React.FC<MicroInteractionProps> = ({
  children,
  onClick,
  scale = 0.95,
  className = ''
}) => {
  return (
    <motion.div
      className={className}
      whileTap={{ scale }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};
