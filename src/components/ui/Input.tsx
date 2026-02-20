import React from 'react';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, TRANSITIONS, INPUT } from '../../config/designTokens';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  help?: string;
  variant?: 'default' | 'filled' | 'flushed';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  disabled?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      help,
      variant = 'default',
      size = 'md',
      icon,
      disabled = false,
      className,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        padding: `${SPACING[1]} ${SPACING[2]}`,
        height: '32px',
      },
      md: {
        fontSize: TYPOGRAPHY.fontSize.base,
        padding: `${SPACING[2]} ${SPACING[3]}`,
        height: '40px',
      },
      lg: {
        fontSize: TYPOGRAPHY.fontSize.lg,
        padding: `${SPACING[3]} ${SPACING[4]}`,
        height: '48px',
      },
    };

    const variantStyles = {
      default: {
        border: `1px solid ${COLORS.gray[300]}`,
        background: COLORS.white,
      },
      filled: {
        border: `1px solid transparent`,
        background: COLORS.gray[100],
      },
      flushed: {
        border: 'none',
        borderBottom: `2px solid ${COLORS.gray[300]}`,
        background: 'transparent',
        borderRadius: '0',
      },
    };

    const sizeStyle = sizeClasses[size];
    const variantStyle = variantStyles[variant];

    const containerStyle: React.CSSProperties = {
      marginBottom: help || error ? SPACING[3] : undefined,
      display: 'flex',
      flexDirection: 'column',
    };

    const labelStyle: React.CSSProperties = {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      color: COLORS.gray[700],
      marginBottom: SPACING[2],
      display: label ? 'block' : 'none',
    };

    const inputWrapperStyle: React.CSSProperties = {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    };

    const inputStyle: React.CSSProperties = {
      ...sizeStyle,
      ...variantStyle,
      fontFamily: TYPOGRAPHY.fontFamily.base,
      borderRadius: BORDER_RADIUS.md,
      transition: TRANSITIONS.fast,
      width: '100%',
      boxSizing: 'border-box',
      paddingLeft: icon ? `${parseInt(SPACING[4]) + 32}px` : undefined,
      opacity: disabled ? 0.6 : 1,
      cursor: disabled ? 'not-allowed' : 'auto',
      color: COLORS.gray[900],
    };

    const iconStyle: React.CSSProperties = {
      position: 'absolute',
      left: SPACING[2],
      display: icon ? 'flex' : 'none',
      alignItems: 'center',
      pointerEvents: 'none',
      color: COLORS.gray[500],
    };

    const errorStyle: React.CSSProperties = {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.danger,
      marginTop: SPACING[1],
    };

    const helpStyle: React.CSSProperties = {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: COLORS.gray[600],
      marginTop: SPACING[1],
      display: !error ? 'block' : 'none',
    };

    return (
      <div style={containerStyle}>
        {label && <label style={labelStyle}>{label}</label>}
        <div style={inputWrapperStyle}>
          {icon && <div style={iconStyle}>{icon}</div>}
          <input
            ref={ref}
            disabled={disabled}
            style={inputStyle}
            {...props}
          />
        </div>
        {error && <div style={errorStyle}>{error}</div>}
        {help && !error && <div style={helpStyle}>{help}</div>}
      </div>
    );
  }
);

Input.displayName = 'Input';
