import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ENHANCED DESIGN SYSTEM COMPONENTS
 * Version: 1.0
 * 
 * These components implement the comprehensive UI/UX redesign
 * specifications from COMPREHENSIVE_UI_UX_REDESIGN_AUDIT.md
 */

// ============================================================================
// 1. KPI CARD - Large, Clear Metrics Display
// ============================================================================

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: number; // percentage change
  trendDirection?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  subtext?: string;
  comparison?: string;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  trend,
  trendDirection = 'neutral',
  icon: Icon,
  subtext,
  comparison,
  color = 'blue',
  onClick
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    amber: 'bg-amber-50 border-amber-200 text-amber-600',
    red: 'bg-red-50 border-red-200 text-red-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600'
  };

  const trendColor = trendDirection === 'up' ? 'text-green-600' : trendDirection === 'down' ? 'text-red-600' : 'text-gray-600';
  const TrendIcon = trendDirection === 'up' ? ArrowUpRight : ArrowDownRight;

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-lg border-2 p-6 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-105',
        colorClasses[color],
        onClick && 'cursor-pointer'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          
          {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
        </div>
        
        {Icon && (
          <Icon className="w-8 h-8 text-gray-400 ml-4" />
        )}
      </div>

      {(trend !== undefined || comparison) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {trend !== undefined && (
            <div className="flex items-center gap-1 mb-1">
              <TrendIcon className={cn('w-4 h-4', trendColor)} />
              <span className={cn('text-sm font-semibold', trendColor)}>
                {Math.abs(trend)}% {trendDirection === 'up' ? 'increase' : 'decrease'}
              </span>
            </div>
          )}
          {comparison && <p className="text-xs text-gray-600">{comparison}</p>}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 2. AUCTION CARD - For Buyers & Dealers
// ============================================================================

interface AuctionCardProps {
  type: 'buyer' | 'seller' | 'dealer';
  id: string;
  title: string;
  image: string;
  currentBid: number;
  myBid?: number;
  startingPrice?: number;
  timeLeft: string;
  timeLeftMs?: number; // milliseconds remaining
  status?: 'winning' | 'outbid' | 'leading' | 'active' | 'ending-soon' | 'ended';
  bidCount?: number;
  viewCount?: number;
  sellerName?: string;
  sellerRating?: number;
  trendSparkling?: number[]; // last 5 prices for sparkline
  onClick?: () => void;
  onBidClick?: () => void;
  badge?: string;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({
  type,
  id,
  title,
  image,
  currentBid,
  myBid,
  startingPrice,
  timeLeft,
  timeLeftMs,
  status = 'active',
  bidCount = 0,
  viewCount = 0,
  sellerName,
  sellerRating,
  trendSparkling,
  onClick,
  onBidClick,
  badge
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'winning': return 'bg-green-100 text-green-800 border-green-300';
      case 'outbid': return 'bg-red-100 text-red-800 border-red-300';
      case 'leading': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ending-soon': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'ended': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getUrgencyColor = () => {
    if (timeLeftMs) {
      if (timeLeftMs < 3600000) return 'text-red-600'; // < 1 hour
      if (timeLeftMs < 86400000) return 'text-amber-600'; // < 24 hours
    }
    return 'text-gray-600';
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gray-100 aspect-video">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        
        {/* Status Badge */}
        {status && (
          <div className={cn('absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold border', getStatusColor(status))}>
            {status === 'winning' && '✓ Winning'}
            {status === 'outbid' && '✗ Outbid'}
            {status === 'leading' && '♔ Leading'}
            {status === 'ending-soon' && '⏰ Ending Soon'}
            {status === 'ended' && 'Ended'}
            {status === 'active' && 'Active'}
          </div>
        )}

        {/* Premium Badge */}
        {badge && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
            {badge}
          </div>
        )}

        {/* Time Remaining Badge */}
        <div className={cn('absolute bottom-2 left-2 px-3 py-1 bg-black bg-opacity-70 text-white text-xs font-semibold rounded-full', getUrgencyColor())}>
          ⏱ {timeLeft}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 hover:text-blue-600">{title}</h3>

        {/* Price Section */}
        <div className="mb-4 pb-4 border-b border-gray-100">
          <p className="text-xs text-gray-600 mb-1">Current Bid</p>
          <p className="text-2xl font-bold text-gray-900">₹{currentBid.toLocaleString('en-IN')}</p>
          
          {type === 'buyer' && myBid && (
            <div className="mt-2 pt-2">
              <p className="text-xs text-gray-600">Your Bid</p>
              <p className="text-lg font-semibold text-blue-600">₹{myBid.toLocaleString('en-IN')}</p>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="space-y-2 mb-4">
          {sellerName && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Seller</span>
              <span className="font-semibold text-gray-900">{sellerName}</span>
            </div>
          )}
          
          {bidCount !== undefined && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Bids</span>
              <span className="font-semibold text-gray-900">{bidCount}</span>
            </div>
          )}

          {viewCount !== undefined && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Views</span>
              <span className="font-semibold text-gray-900">{viewCount}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        {type === 'buyer' && status !== 'ended' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBidClick?.();
            }}
            className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Place Bid
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 3. STATUS BADGE COMPONENT
// ============================================================================

interface StatusBadgeProps {
  status: 'active' | 'pending' | 'completed' | 'disputed' | 'archived' | 'success' | 'warning' | 'error' | 'info' | 'premium';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'md' }) => {
  const statusConfig = {
    active: { bg: 'bg-green-100', text: 'text-green-800', icon: '●' },
    pending: { bg: 'bg-amber-100', text: 'text-amber-800', icon: '○' },
    completed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '✓' },
    disputed: { bg: 'bg-red-100', text: 'text-red-800', icon: '⚠' },
    archived: { bg: 'bg-gray-100', text: 'text-gray-800', icon: '📦' },
    success: { bg: 'bg-green-100', text: 'text-green-800', icon: '✓' },
    warning: { bg: 'bg-amber-100', text: 'text-amber-800', icon: '⚠' },
    error: { bg: 'bg-red-100', text: 'text-red-800', icon: '✗' },
    info: { bg: 'bg-blue-100', text: 'text-blue-800', icon: 'ℹ' },
    premium: { bg: 'bg-yellow-100', text: 'text-yellow-900', icon: '👑' }
  };

  const config = statusConfig[status];
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={cn('inline-flex items-center gap-1 font-semibold rounded-full border', config.bg, config.text, sizeClasses[size])}>
      <span>{config.icon}</span>
      {label || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// ============================================================================
// 4. ACTION MENU COMPONENT
// ============================================================================

interface ActionItem {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'success' | 'warning';
}

interface ActionMenuProps {
  actions: ActionItem[];
  position?: 'left' | 'right';
  trigger?: React.ReactNode;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({ actions, position = 'right', trigger = '⋯' }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const getVariantColor = (variant?: string) => {
    switch (variant) {
      case 'danger': return 'text-red-600 hover:bg-red-50';
      case 'success': return 'text-green-600 hover:bg-green-50';
      case 'warning': return 'text-amber-600 hover:bg-amber-50';
      default: return 'text-gray-700 hover:bg-gray-50';
    }
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        {trigger}
      </button>

      {isOpen && (
        <div className={cn('absolute top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-48 z-50', position === 'left' ? 'left-0' : 'right-0')}>
          {actions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className={cn('w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-b last:border-b-0', getVariantColor(action.variant))}
              >
                <Icon className="w-4 h-4" />
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 5. ENHANCED DATA TABLE COMPONENT
// ============================================================================

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => React.ReactNode;
  width?: string;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  selectable?: boolean;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onSelectionChange?: (selected: string[]) => void;
  bulkActions?: Array<{ label: string; action: string }>;
  pageSize?: number;
  isLoading?: boolean;
  subtitle?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  selectable = false,
  onSort,
  onSelectionChange,
  bulkActions = [],
  pageSize = 10,
  isLoading = false,
  subtitle
}) => {
  const [selected, setSelected] = React.useState<string[]>([]);
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [page, setPage] = React.useState(0);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    onSort?.(column, sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const handleSelectAll = () => {
    if (selected.length === data.length) {
      setSelected([]);
      onSelectionChange?.([]);
    } else {
      const allIds = data.map((_, i) => i.toString());
      setSelected(allIds);
      onSelectionChange?.(allIds);
    }
  };

  const handleSelectRow = (idx: string) => {
    const newSelected = selected.includes(idx)
      ? selected.filter(id => id !== idx)
      : [...selected, idx];
    setSelected(newSelected);
    onSelectionChange?.(newSelected);
  };

  const paginatedData = data.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(data.length / pageSize);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      {(selected.length > 0 || subtitle) && (
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-200">
          {selected.length > 0 ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-700">{selected.length} selected</span>
              {bulkActions.length > 0 && (
                <div className="flex gap-2">
                  {bulkActions.map(action => (
                    <button
                      key={action.action}
                      className="px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <span className="text-sm text-gray-600">{subtitle}</span>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {selectable && (
                <th className="px-6 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={selected.length === data.length && data.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded"
                  />
                </th>
              )}
              {columns.map(col => (
                <th
                  key={col.key}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-semibold text-gray-700 select-none',
                    col.sortable && 'cursor-pointer hover:text-gray-900',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right'
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                  style={{ width: col.width }}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {col.sortable && sortColumn === col.key && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={selectable ? columns.length + 1 : columns.length} className="px-6 py-8 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  {selectable && (
                    <td className="px-6 py-3 w-12">
                      <input
                        type="checkbox"
                        checked={selected.includes(idx.toString())}
                        onChange={() => handleSelectRow(idx.toString())}
                        className="w-4 h-4 rounded"
                      />
                    </td>
                  )}
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-6 py-3 text-sm text-gray-900',
                        col.align === 'center' && 'text-center',
                        col.align === 'right' && 'text-right'
                      )}
                      style={{ width: col.width }}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <span className="text-sm text-gray-600">
            Page {page + 1} of {totalPages} • {data.length} total items
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 6. STAT COUNTER COMPONENT
// ============================================================================

interface StatCounterProps {
  label: string;
  value: number | string;
  unit?: string;
  icon?: LucideIcon;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatCounter: React.FC<StatCounterProps> = ({
  label,
  value,
  unit,
  icon: Icon,
  color = 'bg-blue-100 text-blue-700',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4'
  };

  return (
    <div className={cn('rounded-lg', color, sizeClasses[size])}>
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-6 h-6" />}
        <div>
          <p className="text-xs font-medium opacity-75">{label}</p>
          <p className="text-2xl font-bold">
            {value}
            {unit && <span className="text-lg ml-1">{unit}</span>}
          </p>
        </div>
      </div>
    </div>
  );
};

export default {
  KPICard,
  AuctionCard,
  StatusBadge,
  ActionMenu,
  DataTable,
  StatCounter
};
