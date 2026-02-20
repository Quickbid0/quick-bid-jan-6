// Design Tokens – QuickMela Premium Fintech Design System

export const COLORS = {
  // Primary Navy Brand
  primary: {
    900: '#0F2557',  // Navy Blue (Primary)
    700: '#1A3A7A',  // Accent Navy
    100: '#E8EDF5',  // Light Navy background
  },

  // Semantic Colors
  success: '#10B981',    // Trust Green
  warning: '#F59E0B',    // Amber
  danger: '#EF4444',     // Soft Red
  info: '#3B82F6',       // Sky Blue

  // Neutral Scale
  gray: {
    950: '#030712',
    900: '#111827',
    800: '#1F2937',
    700: '#374151',
    600: '#4B5563',
    500: '#6B7280',
    400: '#9CA3AF',
    300: '#D1D5DB',
    200: '#E5E7EB',
    100: '#F3F4F6',
    50: '#F9FAFB',
  },

  white: '#FFFFFF',
  black: '#000000',
};

export const TYPOGRAPHY = {
  fontFamily: {
    base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'Menlo, Monaco, Consolas, "Liberation Mono", monospace',
  },

  fontSize: {
    xs: '11px',
    sm: '13px',
    base: '15px',
    lg: '18px',
    xl: '24px',
    '2xl': '32px',
  },

  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

export const SPACING = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
};

export const BORDER_RADIUS = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
};

export const SHADOWS = {
  subtle: '0 1px 3px rgba(0, 0, 0, 0.1)',
  sm: '0 4px 6px rgba(0, 0, 0, 0.1)',
  md: '0 10px 15px rgba(0, 0, 0, 0.1)',
  lg: '0 20px 25px rgba(0, 0, 0, 0.15)',
};

export const Z_INDEX = {
  hide: -1,
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modal: 400,
  toast: 500,
  tooltip: 600,
};

export const BREAKPOINTS = {
  xs: '375px',
  sm: '414px',
  md: '768px',
  lg: '1024px',
  xl: '1200px',
  '2xl': '1400px',
};

export const TRANSITIONS = {
  fast: '150ms ease-in-out',
  base: '200ms ease-in-out',
  slow: '300ms ease-in-out',
};

// Component-specific tokens

export const CARD = {
  padding: SPACING[4],
  borderRadius: BORDER_RADIUS.lg,
  shadow: SHADOWS.md,
  border: `1px solid ${COLORS.gray[200]}`,
  background: COLORS.white,
  hover: {
    shadow: SHADOWS.lg,
  },
};

export const BADGE = {
  padding: `${SPACING[1]} ${SPACING[3]}`,
  borderRadius: BORDER_RADIUS.full,
  fontSize: TYPOGRAPHY.fontSize.sm,
  fontWeight: TYPOGRAPHY.fontWeight.semibold,
  variants: {
    verified: {
      background: COLORS.primary[900],
      color: COLORS.white,
    },
    escrow: {
      background: COLORS.success,
      color: COLORS.white,
    },
    inspected: {
      background: COLORS.info,
      color: COLORS.white,
    },
    premium: {
      background: '#FCD34D',
      color: COLORS.primary[900],
    },
  },
};

export const BUTTON = {
  primary: {
    background: COLORS.primary[900],
    color: COLORS.white,
    padding: `${SPACING[3]} ${SPACING[4]}`,
    borderRadius: BORDER_RADIUS.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    border: 'none',
    cursor: 'pointer',
    transition: TRANSITIONS.base,
    ':hover': {
      background: COLORS.primary[700],
    },
    ':disabled': {
      background: COLORS.gray[300],
      color: COLORS.gray[500],
      cursor: 'not-allowed',
    },
  },

  secondary: {
    background: COLORS.white,
    color: COLORS.primary[900],
    border: `2px solid ${COLORS.primary[900]}`,
    padding: `${SPACING[3]} ${SPACING[4]}`,
    borderRadius: BORDER_RADIUS.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    cursor: 'pointer',
    transition: TRANSITIONS.base,
    ':hover': {
      background: COLORS.primary[100],
    },
  },

  danger: {
    background: COLORS.danger,
    color: COLORS.white,
    padding: `${SPACING[3]} ${SPACING[4]}`,
    borderRadius: BORDER_RADIUS.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    border: 'none',
    cursor: 'pointer',
    transition: TRANSITIONS.base,
    ':hover': {
      background: '#DC2626',
    },
  },
};

export const INPUT = {
  border: `1px solid ${COLORS.gray[300]}`,
  borderRadius: BORDER_RADIUS.md,
  padding: `${SPACING[2]} ${SPACING[3]}`,
  fontSize: TYPOGRAPHY.fontSize.base,
  fontFamily: TYPOGRAPHY.fontFamily.base,
  transition: TRANSITIONS.fast,
  ':focus': {
    outline: 'none',
    borderColor: COLORS.primary[900],
    boxShadow: `0 0 0 3px ${COLORS.primary[100]}`,
  },
  ':disabled': {
    background: COLORS.gray[100],
    cursor: 'not-allowed',
  },
};

export const LAYOUT = {
  containerMaxWidth: '1200px',
  sidebarWidth: '280px',
  sidebarWidthCollapsed: '80px',
  headerHeight: '64px',
  footerHeight: '80px',
};
