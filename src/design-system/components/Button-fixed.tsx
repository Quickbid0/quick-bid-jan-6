// Button Component - Enterprise Design System (TypeScript Fixed)
import React from 'react';
import { designTokens } from '../tokens-fixed';
import { ButtonVariant, ButtonSize } from '../types';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className = '',
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: designTokens.colors.primary[600],
          color: 'white',
          border: `1px solid ${designTokens.colors.primary[600]}`,
        };
      
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          color: designTokens.colors.primary[600],
          border: `1px solid ${designTokens.colors.primary[600]}`,
        };
      
      case 'tertiary':
        return {
          backgroundColor: designTokens.colors.neutral[100],
          color: designTokens.colors.neutral[700],
          border: `1px solid ${designTokens.colors.neutral[200]}`,
        };
      
      case 'text':
      default:
        return {
          backgroundColor: 'transparent',
          color: designTokens.colors.primary[600],
          border: '1px solid transparent',
        };
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return {
          padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
          fontSize: designTokens.typography.fontSize.sm,
          borderRadius: designTokens.borderRadius.md,
          minHeight: '2rem',
        };
      
      case 'md':
      default:
        return {
          padding: `${designTokens.spacing.sm} ${designTokens.spacing.xl}`,
          fontSize: designTokens.typography.fontSize.base,
          borderRadius: designTokens.borderRadius.lg,
          minHeight: '2.5rem',
        };
      
      case 'lg':
        return {
          padding: `${designTokens.spacing.md} ${designTokens.spacing['2xl']}`,
          fontSize: designTokens.typography.fontSize.lg,
          borderRadius: designTokens.borderRadius.xl,
          minHeight: '3rem',
        };
    }
  };

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: designTokens.typography.fontFamily.sans.join(', '),
    fontWeight: designTokens.typography.fontWeight.medium,
    lineHeight: designTokens.typography.lineHeight.tight,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: `all ${designTokens.animation.duration.normal} ${designTokens.animation.easing.ease}`,
    whiteSpace: 'nowrap',
    position: 'relative',
    overflow: 'hidden',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled || loading ? 0.5 : 1,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    pointerEvents: disabled || loading ? 'none' : 'auto',
    ...getVariantStyles(),
    ...getSizeStyles(),
  };

  return (
    <button
      className={className}
      style={baseStyles}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            top: 0,
            left: 0,
          }}
        >
          <div
            style={{
              width: '1rem',
              height: '1rem',
              border: '2px solid currentColor',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: `spin ${designTokens.animation.duration.slower} linear infinite`,
            }}
          />
        </div>
      )}
      
      <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.sm }}>
        {leftIcon && (
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {leftIcon}
          </span>
        )}
        
        <span>{children}</span>
        
        {rightIcon && (
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {rightIcon}
          </span>
        )}
      </div>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};
