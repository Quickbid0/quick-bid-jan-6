// Input Component - Enterprise Design System
import React, { forwardRef } from 'react';
import { designTokens } from '../tokens';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  variant = 'default',
  size = 'md',
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  ...props
}, ref) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return `
          background-color: transparent;
          border: 2px solid ${error ? designTokens.colors.error[500] : designTokens.colors.neutral[300]};
          border-radius: ${designTokens.borderRadius.lg};
          
          &:focus {
            border-color: ${designTokens.colors.primary[500]};
            box-shadow: 0 0 0 3px ${designTokens.colors.primary[100]};
          }
          
          &:focus:not(:focus-visible) {
            outline: none;
          }
        `;
      
      case 'default':
      default:
        return `
          background-color: ${designTokens.colors.neutral[0]};
          border: 1px solid ${error ? designTokens.colors.error[500] : designTokens.colors.neutral[300]};
          border-radius: ${designTokens.borderRadius.md};
          
          &:focus {
            border-color: ${designTokens.colors.primary[500]};
            box-shadow: 0 0 0 3px ${designTokens.colors.primary[100]};
          }
          
          &:focus:not(:focus-visible) {
            outline: none;
          }
        `;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return `
          padding: ${designTokens.spacing.sm} ${designTokens.spacing.md};
          font-size: ${designTokens.typography.fontSize.sm};
          min-height: 2rem;
        `;
      
      case 'lg':
        return `
          padding: ${designTokens.spacing.md} ${designTokens.spacing.lg};
          font-size: ${designTokens.typography.fontSize.lg};
          min-height: 3rem;
        `;
      
      case 'md':
      default:
        return `
          padding: ${designTokens.spacing.sm} ${designTokens.spacing.lg};
          font-size: ${designTokens.typography.fontSize.base};
          min-height: 2.5rem;
        `;
    }
  };

  const inputStyles = `
    width: ${fullWidth ? '100%' : 'auto'};
    font-family: ${designTokens.typography.fontFamily.sans.join(', ')};
    font-size: ${designTokens.typography.fontSize.base};
    line-height: ${designTokens.typography.lineHeight.normal};
    color: ${designTokens.colors.neutral[900]};
    transition: all ${designTokens.animation.duration.normal} ${designTokens.animation.easing.ease};
    outline: none;
    
    &::placeholder {
      color: ${designTokens.colors.neutral[500]};
    }
    
    &:disabled {
      background-color: ${designTokens.colors.neutral[100]};
      color: ${designTokens.colors.neutral[400]};
      cursor: not-allowed;
    }
    
    ${getVariantStyles()}
    ${getSizeStyles()}
  `;

  const containerStyles = `
    display: flex;
    flex-direction: column;
    gap: ${designTokens.spacing.xs};
    ${fullWidth ? 'width: 100%;' : ''}
  `;

  return (
    <div style={{ containerStyles }}>
      {label && (
        <label
          style={{
            fontFamily: designTokens.typography.fontFamily.sans.join(', '),
            fontSize: designTokens.typography.fontSize.sm,
            fontWeight: designTokens.typography.fontWeight.medium,
            color: error ? designTokens.colors.error[700] : designTokens.colors.neutral[700],
            marginBottom: designTokens.spacing.xs,
          }}
        >
          {label}
        </label>
      )}
      
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {leftIcon && (
          <div
            style={{
              position: 'absolute',
              left: designTokens.spacing.md,
              display: 'flex',
              alignItems: 'center',
              color: designTokens.colors.neutral[500],
              pointerEvents: 'none',
            }}
          >
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          className={className}
          style={{
            ...inputStyles.split(';').reduce((acc, style) => {
              const [property, value] = style.split(':').map(s => s.trim());
              if (property && value) {
                acc[property] = value;
              }
              return acc;
            }, {} as React.CSSProperties),
            paddingLeft: leftIcon ? '2.5rem' : undefined,
            paddingRight: rightIcon ? '2.5rem' : undefined,
          }}
          {...props}
        />
        
        {rightIcon && (
          <div
            style={{
              position: 'absolute',
              right: designTokens.spacing.md,
              display: 'flex',
              alignItems: 'center',
              color: designTokens.colors.neutral[500],
              pointerEvents: 'none',
            }}
          >
            {rightIcon}
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <div
          style={{
            fontFamily: designTokens.typography.fontFamily.sans.join(', '),
            fontSize: designTokens.typography.fontSize.xs,
            color: error ? designTokens.colors.error[600] : designTokens.colors.neutral[600],
            marginTop: designTokens.spacing.xs,
          }}
        >
          {error || helperText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';
