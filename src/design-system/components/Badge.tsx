// Badge Component - Enterprise Design System
import React from 'react';
import { designTokens } from '../tokens';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return `
          background-color: ${designTokens.colors.primary[100]};
          color: ${designTokens.colors.primary[800]};
          border: 1px solid ${designTokens.colors.primary[200]};
        `;
      
      case 'success':
        return `
          background-color: ${designTokens.colors.success[100]};
          color: ${designTokens.colors.success[800]};
          border: 1px solid ${designTokens.colors.success[200]};
        `;
      
      case 'warning':
        return `
          background-color: ${designTokens.colors.warning[100]};
          color: ${designTokens.colors.warning[800]};
          border: 1px solid ${designTokens.colors.warning[200]};
        `;
      
      case 'error':
        return `
          background-color: ${designTokens.colors.error[100]};
          color: ${designTokens.colors.error[800]};
          border: 1px solid ${designTokens.colors.error[200]};
        `;
      
      case 'default':
      default:
        return `
          background-color: ${designTokens.colors.neutral[100]};
          color: ${designTokens.colors.neutral[700]};
          border: 1px solid ${designTokens.colors.neutral[200]};
        `;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return `
          padding: ${designTokens.spacing.xs} ${designTokens.spacing.sm};
          font-size: ${designTokens.typography.fontSize.xs};
          border-radius: ${designTokens.borderRadius.full};
        `;
      
      case 'lg':
        return `
          padding: ${designTokens.spacing.sm} ${designTokens.spacing.md};
          font-size: ${designTokens.typography.fontSize.base};
          border-radius: ${designTokens.borderRadius.full};
        `;
      
      case 'md':
      default:
        return `
          padding: ${designTokens.spacing.xs} ${designTokens.spacing.md};
          font-size: ${designTokens.typography.fontSize.sm};
          border-radius: ${designTokens.borderRadius.full};
        `;
    }
  };

  const baseStyles = `
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: ${designTokens.typography.fontFamily.sans.join(', ')};
    font-weight: ${designTokens.typography.fontWeight.medium};
    line-height: ${designTokens.typography.lineHeight.tight};
    white-space: nowrap;
    transition: all ${designTokens.animation.duration.fast} ${designTokens.animation.easing.ease};
    
    ${getVariantStyles()}
    ${getSizeStyles()}
  `;

  return (
    <span
      className={className}
      style={{
        ...baseStyles.split(';').reduce((acc, style) => {
          const [property, value] = style.split(':').map(s => s.trim());
          if (property && value) {
            acc[property] = value;
          }
          return acc;
        }, {} as React.CSSProperties),
      }}
    >
      {children}
    </span>
  );
};
