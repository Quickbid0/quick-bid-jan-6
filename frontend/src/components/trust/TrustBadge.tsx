// src/components/trust/TrustBadge.tsx
import React from 'react';
import { Shield, CheckCircle, Star, Award, Lock, Eye, EyeOff } from 'lucide-react';

interface TrustBadgeProps {
  level: 'basic' | 'verified' | 'trusted' | 'premium' | 'institutional';
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  animated?: boolean;
  verifiedFeatures?: string[];
  className?: string;
}

const TrustBadge: React.FC<TrustBadgeProps> = ({
  level,
  size = 'md',
  showTooltip = true,
  animated = false,
  verifiedFeatures = [],
  className = '',
}) => {
  const levelConfig = {
    basic: {
      name: 'Basic',
      color: '#6B7280',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-700',
      icon: Shield,
      description: 'Basic account verification completed',
    },
    verified: {
      name: 'Verified',
      color: '#059669',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      icon: CheckCircle,
      description: 'Full identity verification completed',
    },
    trusted: {
      name: 'Trusted',
      color: '#0891B2',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      textColor: 'text-cyan-700',
      icon: Award,
      description: 'Established account with financial verification',
    },
    premium: {
      name: 'Premium',
      color: '#7C3AED',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      icon: Star,
      description: 'Elite user with proven reliability and high reputation',
    },
    institutional: {
      name: 'Institutional',
      color: '#DC2626',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      icon: Award,
      description: 'Institutionally verified entity with full compliance',
    },
  };

  const config = levelConfig[level];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`
          inline-flex items-center gap-1.5 rounded-full font-medium
          ${sizeClasses[size]} ${config.bgColor} ${config.borderColor} border
          ${config.textColor}
          ${animated ? 'animate-pulse' : ''}
          transition-all duration-200 hover:scale-105 hover:shadow-md
        `}
        style={{ borderColor: config.color }}
      >
        <Icon className={`${iconSizes[size]} ${animated ? 'animate-bounce' : ''}`} />
        <span>{config.name}</span>

        {/* Verification Checkmarks */}
        {verifiedFeatures.length > 0 && (
          <div className="flex gap-0.5 ml-1">
            {verifiedFeatures.slice(0, 3).map((_, index) => (
              <CheckCircle key={index} className={`${iconSizes[size]} opacity-80`} />
            ))}
          </div>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 max-w-xs">
          <div className="font-medium mb-1">{config.name} Trust Level</div>
          <div className="text-xs opacity-90 mb-2">{config.description}</div>
          {verifiedFeatures.length > 0 && (
            <div className="text-xs">
              <div className="font-medium mb-1">Verified Features:</div>
              <ul className="list-disc list-inside space-y-0.5">
                {verifiedFeatures.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default TrustBadge;
