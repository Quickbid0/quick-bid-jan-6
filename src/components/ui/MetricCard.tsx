import React from 'react';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS, TRANSITIONS } from '../../config/designTokens';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  onClick?: () => void;
  loading?: boolean;
  variant?: 'default' | 'highlighted' | 'compact';
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  icon,
  trend,
  trendValue,
  onClick,
  loading = false,
  variant = 'default',
  color = 'primary',
}) => {
  const colorMap = {
    primary: COLORS.primary[900],
    success: COLORS.success,
    warning: COLORS.warning,
    danger: COLORS.danger,
    info: COLORS.info,
  };

  const containerStyle: React.CSSProperties = {
    background: COLORS.white,
    border: `1px solid ${COLORS.gray[200]}`,
    borderRadius: BORDER_RADIUS.lg,
    padding: variant === 'compact' ? SPACING[3] : SPACING[4],
    boxShadow: SHADOWS.md,
    cursor: onClick ? 'pointer' : 'default',
    transition: TRANSITIONS.base,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: variant === 'compact' ? '100px' : '140px',
  };

  if (onClick) {
    containerStyle['&:hover'] = {
      boxShadow: SHADOWS.lg,
      transform: 'translateY(-2px)',
    };
  }

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING[2],
  };

  const labelStyle: React.CSSProperties = {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
    color: COLORS.gray[600],
    textTransform: 'capitalize',
  };

  const iconStyle: React.CSSProperties = {
    fontSize: '24px',
    color: variant === 'highlighted' ? colorMap[color] : COLORS.gray[400],
    display: 'flex',
    alignItems: 'center',
  };

  const contentStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'baseline',
    gap: SPACING[1],
  };

  const valueStyle: React.CSSProperties = {
    fontSize: variant === 'compact' ? TYPOGRAPHY.fontSize.xl : TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: variant === 'highlighted' ? colorMap[color] : COLORS.gray[900],
    lineHeight: TYPOGRAPHY.lineHeight.tight,
  };

  const unitStyle: React.CSSProperties = {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
    color: COLORS.gray[600],
  };

  const trendStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING[1],
    marginTop: SPACING[2],
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  };

  const trendColorMap = {
    up: COLORS.success,
    down: COLORS.danger,
    neutral: COLORS.gray[600],
  };

  return (
    <div 
      style={containerStyle} 
      onClick={onClick}
      role="button"
      tabIndex={onClick ? 0 : -1}
    >
      <div>
        <div style={headerStyle}>
          <div style={labelStyle}>{label}</div>
          {icon && <div style={iconStyle}>{icon}</div>}
        </div>

        {loading ? (
          <div
            style={{
              ...valueStyle,
              background: COLORS.gray[200],
              height: '32px',
              borderRadius: BORDER_RADIUS.md,
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
        ) : (
          <div style={contentStyle}>
            <span style={valueStyle}>{value}</span>
            {unit && <span style={unitStyle}>{unit}</span>}
          </div>
        )}
      </div>

      {trend && trendValue && (
        <div style={{ ...trendStyle, color: trendColorMap[trend] }}>
          <span>{trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}</span>
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
};

// Add pulse animation
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;
document.head.appendChild(style);
