// src/components/trust/StatusIndicator.tsx
import React from 'react';
import { Wifi, Loader, CheckCircle, Clock, AlertTriangle, AlertCircle, XCircle } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'online' | 'processing' | 'verified' | 'pending' | 'error' | 'warning' | 'offline';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  showMessage?: boolean;
  animated?: boolean;
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  message,
  size = 'md',
  showMessage = true,
  animated = true,
  className = '',
}) => {
  const statusConfig = {
    online: {
      color: '#10B981',
      icon: Wifi,
      label: 'Active',
      pulse: false,
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
    },
    processing: {
      color: '#3B82F6',
      icon: Loader,
      label: 'Processing',
      pulse: true,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
    },
    verified: {
      color: '#059669',
      icon: CheckCircle,
      label: 'Verified',
      pulse: false,
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
    },
    pending: {
      color: '#F59E0B',
      icon: Clock,
      label: 'Pending',
      pulse: false,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
    },
    error: {
      color: '#EF4444',
      icon: XCircle,
      label: 'Error',
      pulse: true,
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
    },
    warning: {
      color: '#F59E0B',
      icon: AlertTriangle,
      label: 'Warning',
      pulse: false,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
    },
    offline: {
      color: '#6B7280',
      icon: AlertCircle,
      label: 'Offline',
      pulse: false,
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div
          className={`${sizeClasses[size]} rounded-full`}
          style={{ backgroundColor: config.color }}
        />
        {animated && config.pulse && (
          <div
            className={`absolute inset-0 ${sizeClasses[size]} rounded-full animate-ping opacity-30`}
            style={{ backgroundColor: config.color }}
          />
        )}
      </div>

      {showMessage && (
        <div className="flex flex-col">
          <span className={`${textSizes[size]} font-medium ${config.textColor}`}>
            {message || config.label}
          </span>
          {message && config.label !== message && (
            <span className="text-xs opacity-75">{config.label}</span>
          )}
        </div>
      )}
    </div>
  );
};

// Inline Status Badge
interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'processing';
  children: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  children,
  size = 'md',
  className = '',
}) => {
  const statusConfig = {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    processing: 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span className={`
      inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
      ${statusConfig[status]} ${sizeClasses[size]} ${className}
    `}>
      {status === 'processing' && (
        <Loader className="h-3 w-3 mr-1 animate-spin" />
      )}
      {children}
    </span>
  );
};

export default StatusIndicator;
