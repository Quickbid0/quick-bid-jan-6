// Skeleton Component - Consistent Loading States
import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'image' | 'card' | 'button' | 'input';
  className?: string;
  lines?: number;
  height?: string;
  width?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  className = '',
  lines = 1,
  height,
  width
}) => {
  const baseClass = 'animate-pulse bg-gray-200 rounded';
  
  const getVariantClass = () => {
    switch (variant) {
      case 'text':
        return baseClass;
      case 'image':
        return `${baseClass} w-full h-full`;
      case 'card':
        return `${baseClass} w-full h-48`;
      case 'button':
        return `${baseClass} h-10 w-24`;
      case 'input':
        return `${baseClass} h-10 w-full`;
      default:
        return baseClass;
    }
  };

  const getStyle = () => {
    const style: React.CSSProperties = {};
    if (height) style.height = height;
    if (width) style.width = width;
    return style;
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClass} h-4`}
            style={{ width: index === lines - 1 ? '75%' : '100%' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${getVariantClass()} ${className}`}
      style={getStyle()}
    />
  );
};
