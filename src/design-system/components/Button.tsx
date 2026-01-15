// Button Component - Enterprise Design System
import React from 'react';
import { designTokens } from '../design-system/tokens';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'text';
  size?: 'sm' | 'md' | 'lg';
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
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return `
          background-color: ${designTokens.colors.primary[600]};
          color: white;
          border: 1px solid ${designTokens.colors.primary[600]};
          
          &:hover:not(:disabled) {
            background-color: ${designTokens.colors.primary[700]};
            border-color: ${designTokens.colors.primary[700]};
            box-shadow: ${designTokens.elevation.md};
          }
          
          &:active:not(:disabled) {
            background-color: ${designTokens.colors.primary[800]};
            border-color: ${designTokens.colors.primary[800]};
          }
          
          &:focus-visible {
            outline: 2px solid ${designTokens.colors.primary[500]};
            outline-offset: 2px;
          }
        `;
      
      case 'secondary':
        return `
          background-color: transparent;
          color: ${designTokens.colors.primary[600]};
          border: 1px solid ${designTokens.colors.primary[600]};
          
          &:hover:not(:disabled) {
            background-color: ${designTokens.colors.primary[50]};
            box-shadow: ${designTokens.elevation.sm};
          }
          
          &:active:not(:disabled) {
            background-color: ${designTokens.colors.primary[100]};
          }
          
          &:focus-visible {
            outline: 2px solid ${designTokens.colors.primary[500]};
            outline-offset: 2px;
          }
        `;
      
      case 'tertiary':
        return `
          background-color: ${designTokens.colors.neutral[100]};
          color: ${designTokens.colors.neutral[700]};
          border: 1px solid ${designTokens.colors.neutral[200]};
          
          &:hover:not(:disabled) {
            background-color: ${designTokens.colors.neutral[200]};
            box-shadow: ${designTokens.elevation.sm};
          }
          
          &:active:not(:disabled) {
            background-color: ${designTokens.colors.neutral[300]};
          }
          
          &:focus-visible {
            outline: 2px solid ${designTokens.colors.primary[500]};
            outline-offset: 2px;
          }
        `;
      
      case 'text':
        return `
          background-color: transparent;
          color: ${designTokens.colors.primary[600]};
          border: 1px solid transparent;
          
          &:hover:not(:disabled) {
            background-color: ${designTokens.colors.primary[50]};
            border-color: ${designTokens.colors.primary[50]};
          }
          
          &:active:not(:disabled) {
            background-color: ${designTokens.colors.primary[100]};
          }
          
          &:focus-visible {
            outline: 2px solid ${designTokens.colors.primary[500]};
            outline-offset: 2px;
          }
        `;
      
      default:
        return '';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return `
          padding: ${designTokens.spacing.sm} ${designTokens.spacing.lg};
          font-size: ${designTokens.typography.fontSize.sm};
          border-radius: ${designTokens.borderRadius.md};
          min-height: 2rem;
        `;
      
      case 'md':
        return `
          padding: ${designTokens.spacing.sm} ${designTokens.spacing.xl};
          font-size: ${designTokens.typography.fontSize.base};
          border-radius: ${designTokens.borderRadius.lg};
          min-height: 2.5rem;
        `;
      
      case 'lg':
        return `
          padding: ${designTokens.spacing.md} ${designTokens.spacing['2xl']};
          font-size: ${designTokens.typography.fontSize.lg};
          border-radius: ${designTokens.borderRadius.xl};
          min-height: 3rem;
        `;
      
      default:
        return '';
    }
  };

  const baseStyles = `
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: ${designTokens.typography.fontFamily.sans.join(', ')};
    font-weight: ${designTokens.typography.fontWeight.medium};
    line-height: ${designTokens.typography.lineHeight.tight};
    text-decoration: none;
    cursor: pointer;
    transition: all ${designTokens.animation.duration.normal} ${designTokens.animation.easing.ease};
    white-space: nowrap;
    position: relative;
    overflow: hidden;
    
    ${fullWidth ? 'width: 100%;' : ''}
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }
    
    ${getVariantStyles()}
    ${getSizeStyles()}
  `;

  return (
    <button
      className={`${className}`}
      style={{
        ...React.CSSProperties.parse(baseStyles),
      }}
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
              animation: `spin ${designTokens.animation.duration.slow} linear infinite`,
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
      
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};
