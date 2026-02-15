// Enhanced Typography System - Gaming Excitement + Fintech Precision + SaaS Clarity
// Combines energetic gaming fonts with trustworthy fintech typography and intelligent SaaS spacing

export const typography = {
  // Gaming Energy Fonts (IPL-style excitement)
  gaming: {
    display: {
      fontFamily: '"Inter Display", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      fontSize: {
        '4xl': ['3.5rem', { lineHeight: '1', letterSpacing: '-0.02em' }],     // 56px - Hero titles
        '3xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],     // 48px - Auction titles
        '2xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],  // 36px - Section headers
        xl: ['1.875rem', { lineHeight: '1.3', letterSpacing: '0' }],          // 30px - Card titles
        lg: ['1.5rem', { lineHeight: '1.4', letterSpacing: '0' }],            // 24px - Large text
        base: ['1.125rem', { lineHeight: '1.5', letterSpacing: '0' }],        // 18px - Body text
        sm: ['0.875rem', { lineHeight: '1.6', letterSpacing: '0.01em' }],     // 14px - Small text
        xs: ['0.75rem', { lineHeight: '1.7', letterSpacing: '0.02em' }],      // 12px - Micro text
      }
    },
    mono: {
      fontFamily: '"JetBrains Mono", "SF Mono", "Monaco", "Inconsolata", "Fira Code", monospace',
      fontSize: {
        lg: ['1.125rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],    // Code blocks
        base: ['0.875rem', { lineHeight: '1.5', letterSpacing: '0' }],        // Inline code
        sm: ['0.75rem', { lineHeight: '1.6', letterSpacing: '0.01em' }],      // Small code
      }
    }
  },

  // Fintech Precision Typography (Stripe/Razorpay style)
  fintech: {
    primary: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      fontSize: {
        '4xl': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],   // Trust headlines
        '3xl': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],      // Section headers
        '2xl': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],    // Card titles
        xl: ['1.25rem', { lineHeight: '1.4', letterSpacing: '0' }],           // Large body
        lg: ['1.125rem', { lineHeight: '1.5', letterSpacing: '0' }],          // Body text
        base: ['1rem', { lineHeight: '1.6', letterSpacing: '0' }],            // Standard text
        sm: ['0.875rem', { lineHeight: '1.7', letterSpacing: '0.01em' }],     // Small text
        xs: ['0.75rem', { lineHeight: '1.8', letterSpacing: '0.02em' }],      // Micro text
      }
    },
    numbers: {
      fontFamily: '"Inter", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      fontWeight: '600',
      fontFeatureSettings: '"tnum"', // Tabular numbers for financial data
      fontSize: {
        '4xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.03em' }],       // Large money amounts
        '3xl': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],  // Bid amounts
        '2xl': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }], // KPI numbers
        xl: ['1.5rem', { lineHeight: '1.3', letterSpacing: '0' }],            // Medium numbers
        lg: ['1.25rem', { lineHeight: '1.4', letterSpacing: '0' }],           // Standard numbers
        base: ['1rem', { lineHeight: '1.5', letterSpacing: '0' }],            // Small numbers
      }
    }
  },

  // SaaS Intelligence Typography (Notion/Shopify style)
  saas: {
    primary: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      fontSize: {
        '5xl': ['4rem', { lineHeight: '1', letterSpacing: '-0.04em' }],       // Hero titles
        '4xl': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],   // Page titles
        '3xl': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],      // Section titles
        '2xl': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],    // Component titles
        xl: ['1.25rem', { lineHeight: '1.4', letterSpacing: '0' }],           // Large text
        lg: ['1.125rem', { lineHeight: '1.5', letterSpacing: '0' }],          // Body text
        base: ['1rem', { lineHeight: '1.6', letterSpacing: '0' }],            // Standard text
        sm: ['0.875rem', { lineHeight: '1.7', letterSpacing: '0.01em' }],     // Small text
        xs: ['0.75rem', { lineHeight: '1.8', letterSpacing: '0.02em' }],      // Micro text
      }
    },
    code: {
      fontFamily: '"JetBrains Mono", "SF Mono", "Monaco", "Inconsolata", "Fira Code", monospace',
      fontSize: {
        base: ['0.875rem', { lineHeight: '1.5', letterSpacing: '0' }],
        sm: ['0.75rem', { lineHeight: '1.6', letterSpacing: '0.01em' }],
      }
    }
  },

  // Real-time Typography (Live updates)
  realTime: {
    live: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      fontWeight: '600',
      fontSize: {
        xl: ['1.25rem', { lineHeight: '1.2', letterSpacing: '0.02em' }],      // Live status
        lg: ['1.125rem', { lineHeight: '1.3', letterSpacing: '0.01em' }],     // Active indicators
        base: ['1rem', { lineHeight: '1.4', letterSpacing: '0' }],           // Real-time data
        sm: ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],    // Small updates
      }
    },
    countdown: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      fontWeight: '700',
      fontSize: {
        '4xl': ['3.5rem', { lineHeight: '0.9', letterSpacing: '-0.05em' }],   // Large countdown
        '3xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.03em' }],       // Medium countdown
        '2xl': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }], // Small countdown
      }
    }
  },

  // Emotional Typography States
  emotions: {
    exciting: {
      fontWeight: '700',
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
      fontSize: '0.875rem',
    },
    urgent: {
      fontWeight: '800',
      letterSpacing: '0.02em',
      textTransform: 'uppercase' as const,
      fontSize: '1rem',
    },
    calm: {
      fontWeight: '500',
      letterSpacing: '0',
      fontSize: '1rem',
    },
    winning: {
      fontWeight: '700',
      letterSpacing: '0.01em',
      fontSize: '1.125rem',
      color: '#22c55e',
    },
    losing: {
      fontWeight: '600',
      letterSpacing: '0.02em',
      fontSize: '1rem',
      color: '#ef4444',
    }
  }
};

// Text Styles for Different Contexts
export const textStyles = {
  // Gaming Context
  gaming: {
    hero: {
      fontFamily: typography.gaming.display.fontFamily,
      fontSize: typography.gaming.display.fontSize['4xl'][0],
      fontWeight: typography.gaming.display.fontWeight.extrabold,
      lineHeight: typography.gaming.display.fontSize['4xl'][1].lineHeight,
      letterSpacing: typography.gaming.display.fontSize['4xl'][1].letterSpacing,
      textTransform: 'uppercase' as const,
      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)',
      backgroundClip: 'text' as const,
      WebkitBackgroundClip: 'text' as const,
      WebkitTextFillColor: 'transparent',
      backgroundSize: '200% 200%',
      animation: 'gradient-shift 3s ease-in-out infinite',
    },
    live: {
      fontFamily: typography.realTime.live.fontFamily,
      fontSize: typography.realTime.live.fontSize.xl[0],
      fontWeight: typography.realTime.live.fontWeight,
      lineHeight: typography.realTime.live.fontSize.xl[1].lineHeight,
      letterSpacing: typography.realTime.live.fontSize.xl[1].letterSpacing,
      color: '#ef4444',
      textTransform: 'uppercase' as const,
      animation: 'pulse-live 2s infinite',
    },
    countdown: {
      fontFamily: typography.realTime.countdown.fontFamily,
      fontSize: typography.realTime.countdown.fontSize['4xl'][0],
      fontWeight: typography.realTime.countdown.fontWeight,
      lineHeight: typography.realTime.countdown.fontSize['4xl'][1].lineHeight,
      letterSpacing: typography.realTime.countdown.fontSize['4xl'][1].letterSpacing,
      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)',
      backgroundClip: 'text' as const,
      WebkitBackgroundClip: 'text' as const,
      WebkitTextFillColor: 'transparent',
      animation: 'countdown-pulse 1s ease-in-out infinite',
    }
  },

  // Fintech Context
  fintech: {
    balance: {
      fontFamily: typography.fintech.numbers.fontFamily,
      fontSize: typography.fintech.numbers.fontSize['4xl'][0],
      fontWeight: typography.fintech.numbers.fontWeight,
      lineHeight: typography.fintech.numbers.fontSize['4xl'][1].lineHeight,
      letterSpacing: typography.fintech.numbers.fontSize['4xl'][1].letterSpacing,
      fontFeatureSettings: typography.fintech.numbers.fontFeatureSettings,
      color: '#1d4ed8',
    },
    trust: {
      fontFamily: typography.fintech.primary.fontFamily,
      fontSize: typography.fintech.primary.fontSize.sm[0],
      fontWeight: typography.fintech.primary.fontWeight.medium,
      lineHeight: typography.fintech.primary.fontSize.sm[1].lineHeight,
      letterSpacing: typography.fintech.primary.fontSize.sm[1].letterSpacing,
      color: '#10b981',
    },
    secure: {
      fontFamily: typography.fintech.primary.fontFamily,
      fontSize: typography.fintech.primary.fontSize.xs[0],
      fontWeight: typography.fintech.primary.fontWeight.semibold,
      lineHeight: typography.fintech.primary.fontSize.xs[1].lineHeight,
      letterSpacing: typography.fintech.primary.fontSize.xs[1].letterSpacing,
      color: '#3b82f6',
      textTransform: 'uppercase' as const,
    }
  },

  // SaaS Context
  saas: {
    insight: {
      fontFamily: typography.saas.primary.fontFamily,
      fontSize: typography.saas.primary.fontSize.base[0],
      fontWeight: typography.saas.primary.fontWeight.medium,
      lineHeight: typography.saas.primary.fontSize.base[1].lineHeight,
      letterSpacing: typography.saas.primary.fontSize.base[1].letterSpacing,
      color: '#8b5cf6',
    },
    metric: {
      fontFamily: typography.fintech.numbers.fontFamily,
      fontSize: typography.fintech.numbers.fontSize.xl[0],
      fontWeight: typography.fintech.numbers.fontWeight,
      lineHeight: typography.fintech.numbers.fontSize.xl[1].lineHeight,
      letterSpacing: typography.fintech.numbers.fontSize.xl[1].letterSpacing,
      fontFeatureSettings: typography.fintech.numbers.fontFeatureSettings,
      color: '#64748b',
    },
    recommendation: {
      fontFamily: typography.saas.primary.fontFamily,
      fontSize: typography.saas.primary.fontSize.sm[0],
      fontWeight: typography.saas.primary.fontWeight.medium,
      lineHeight: typography.saas.primary.fontSize.sm[1].lineHeight,
      letterSpacing: typography.saas.primary.fontSize.sm[1].letterSpacing,
      color: '#eab308',
      fontStyle: 'italic' as const,
    }
  }
};

// Color mappings for text
export const textColors = {
  gaming: {
    primary: '#f97316',
    secondary: '#ea580c',
    accent: '#dc2626',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  fintech: {
    primary: '#3b82f6',
    secondary: '#1d4ed8',
    trust: '#10b981',
    secure: '#059669',
    neutral: '#64748b',
  },
  saas: {
    primary: '#64748b',
    secondary: '#475569',
    insight: '#8b5cf6',
    accent: '#eab308',
    neutral: '#737373',
  },
  realTime: {
    live: '#ef4444',
    active: '#22c55e',
    pending: '#f59e0b',
    offline: '#6b7280',
  }
};

// Utility functions
export const getTypography = (context: 'gaming' | 'fintech' | 'saas' | 'realTime', type: string) => {
  return typography[context]?.[type] || typography.saas.primary;
};

export const getTextStyle = (context: 'gaming' | 'fintech' | 'saas', style: string) => {
  return textStyles[context]?.[style] || {};
};

export const getTextColor = (context: 'gaming' | 'fintech' | 'saas' | 'realTime', type: string) => {
  return textColors[context]?.[type] || '#64748b';
};

export default typography;
