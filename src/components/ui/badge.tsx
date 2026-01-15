import * as React from 'react';
import { colors, spacing, typography, radii } from '@/design-system';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

const variantStyles: Record<BadgeVariant, { background: string; text: string; border: string }> = {
  success: { background: colors.success, text: colors.surface, border: colors.success },
  warning: { background: colors.warning, text: colors.surface, border: colors.warning },
  error: { background: colors.error, text: colors.surface, border: colors.error },
  info: { background: colors.secondary, text: colors.surface, border: colors.secondary },
  neutral: { background: colors.surface, text: colors.muted, border: colors.border },
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>((props, ref) => {
  const { variant = 'neutral', className = '', icon, children, ...rest } = props;
  const { background, text, border } = variantStyles[variant];
  const baseClasses = `inline-flex items-center gap-[${spacing.xs}px] rounded-[${radii.md}] border border-[${border}] bg-[${background}] px-[${spacing.md}px] py-[${spacing.xs}px] text-[${typography.caption.fontSize}px] font-semibold`;

  return (
    <span
      ref={ref}
      role="status"
      aria-label={rest['aria-label'] ?? `${variant} status`}
      className={`${baseClasses} ${className}`.trim()}
      {...rest}
    >
      {icon && <span className="flex items-center justify-center">{icon}</span>}
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

/**
 * Usage examples:
 * <Badge variant="success">Ready to bid</Badge>
 * <Badge variant="warning" icon={<span aria-hidden="true">!</span>}>KYC pending</Badge>
 * <Badge variant="error">Deposit required</Badge>
 */
