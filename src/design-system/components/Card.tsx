// Card Component - Enterprise Design System
import React, { CSSProperties } from 'react';
import { designTokens } from '../tokens';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  className = '',
  onClick,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return `
          background-color: ${designTokens.colors.neutral[0]};
          border: 1px solid ${designTokens.colors.neutral[200]};
          box-shadow: ${designTokens.elevation.md};
        `;
      
      case 'outlined':
        return `
          background-color: ${designTokens.colors.neutral[0]};
          border: 1px solid ${designTokens.colors.neutral[300]};
          box-shadow: ${designTokens.elevation.none};
        `;
      
      case 'default':
      default:
        return `
          background-color: ${designTokens.colors.neutral[0]};
          border: 1px solid ${designTokens.colors.neutral[200]};
          box-shadow: ${designTokens.elevation.sm};
        `;
    }
  };

  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return 'padding: 0;';
      case 'sm':
        return `padding: ${designTokens.spacing.md};`;
      case 'lg':
        return `padding: ${designTokens.spacing.xl};`;
      case 'md':
      default:
        return `padding: ${designTokens.spacing.lg};`;
    }
  };

  const baseStyles = `
    border-radius: ${designTokens.borderRadius.xl};
    transition: all ${designTokens.animation.duration.normal} ${designTokens.animation.easing.ease};
    position: relative;
    overflow: hidden;
    
    ${hover ? `
      &:hover {
        transform: translateY(-2px);
        box-shadow: ${designTokens.elevation.lg};
        border-color: ${designTokens.colors.primary[300]};
      }
    ` : ''}
    
    ${getVariantStyles()}
    ${getPaddingStyles()}
  `;

  return (
    <div
      className={className}
      style={{
        fontFamily: designTokens.typography.fontFamily.sans.join(', '),
        borderRadius: designTokens.borderRadius.xl,
        transition: `all ${designTokens.animation.duration.normal} ${designTokens.animation.easing.ease}`,
        position: 'relative',
        overflow: 'hidden',
        ...(hover && {
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: designTokens.elevation.lg,
            borderColor: designTokens.colors.primary[300],
          }
        }),
        ...(variant === 'elevated' && {
          boxShadow: designTokens.elevation.md,
        }),
        ...(variant === 'outlined' && {
          border: `2px solid ${designTokens.colors.neutral[200]}`,
        }),
        ...(padding === 'sm' && {
          padding: designTokens.spacing.sm,
        }),
        ...(padding === 'md' && {
          padding: designTokens.spacing.md,
        }),
        ...(padding === 'lg' && {
          padding: designTokens.spacing.lg,
        }),
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {children}
    </div>
  );
};

// Card Section Component
interface CardSectionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardSectionProps> = ({ children, className = '' }) => (
  <div
    className={className}
    style={{
      borderBottom: `1px solid ${designTokens.colors.neutral[200]}`,
      paddingBottom: designTokens.spacing.lg,
      marginBottom: designTokens.spacing.lg,
    }}
  >
    {children}
  </div>
);

export const CardBody: React.FC<CardSectionProps> = ({ children, className = '' }) => (
  <div className={className} style={{ marginBottom: designTokens.spacing.lg }}>
    {children}
  </div>
);

export const CardFooter: React.FC<CardSectionProps> = ({ children, className = '' }) => (
  <div
    className={className}
    style={{
      borderTop: `1px solid ${designTokens.colors.neutral[200]}`,
      paddingTop: designTokens.spacing.lg,
      marginTop: 'auto',
    }}
  >
    {children}
  </div>
);
