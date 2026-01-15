// Environment Badge Component
import React from 'react';
import { UserAccessLevel } from '../services/userAccessService';
import { ProductEnvironment } from '../services/productService';

interface EnvironmentBadgeProps {
  type: 'user' | 'product' | 'system';
  level?: UserAccessLevel;
  environment?: ProductEnvironment;
  className?: string;
}

export const EnvironmentBadge: React.FC<EnvironmentBadgeProps> = ({
  type,
  level,
  environment,
  className = ''
}) => {
  const getBadgeConfig = () => {
    if (type === 'user' && level) {
      switch (level) {
        case 'internal':
          return {
            text: 'Internal',
            bgColor: 'bg-purple-100',
            textColor: 'text-purple-800',
            borderColor: 'border-purple-200'
          };
        case 'beta':
          return {
            text: 'Beta User',
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-800',
            borderColor: 'border-blue-200'
          };
        case 'public':
          return {
            text: 'Public',
            bgColor: 'bg-gray-100',
            textColor: 'text-gray-800',
            borderColor: 'border-gray-200'
          };
      }
    }
    
    if (type === 'product' && environment) {
      if (environment.isRealProduct) {
        return {
          text: 'Live Product',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200'
        };
      } else {
        return {
          text: 'Demo Product',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200'
        };
      }
    }
    
    if (type === 'system') {
      return {
        text: environment?.environment === 'live' ? 'Live' : 'Beta',
        bgColor: environment?.environment === 'live' ? 'bg-green-100' : 'bg-blue-100',
        textColor: environment?.environment === 'live' ? 'text-green-800' : 'text-blue-800',
        borderColor: environment?.environment === 'live' ? 'border-green-200' : 'border-blue-200'
      };
    }
    
    return {
      text: 'Unknown',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-200'
    };
  };
  
  const config = getBadgeConfig();
  
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${config.bgColor} ${config.textColor} ${config.borderColor} border
        ${className}
      `}
      role="status"
      aria-label={`${config.text} badge`}
    >
      {config.text}
    </span>
  );
};
