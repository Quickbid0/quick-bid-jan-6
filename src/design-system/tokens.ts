// =============================================================================
// ENTERPRISE DESIGN SYSTEM - ₹1000 Crore Valuation Ready
// Series C Funded Platform | Automotive + Fintech Hybrid
// Trust-First UX | Investor-Ready Polish | Scalable to 1M+ Users
// =============================================================================

export const designTokens = {
  // 🎨 ENTERPRISE COLOR PALETTE - Trust & Authority
  colors: {
    // Primary - Deep Indigo (Trust & Authority)
    primary: {
      50: '#eff6ff',   // Soft indigo tint
      100: '#dbeafe',  // Light indigo
      200: '#bfdbfe',  // Pale indigo
      300: '#93c5fd',  // Light indigo
      400: '#60a5fa',  // Medium indigo
      500: '#1e293b',  // Deep Indigo (Primary) - Trust anchor
      600: '#1e40af',  // Royal indigo
      700: '#1e3a8a',  // Navy indigo
      800: '#1e293b',  // Dark indigo
      900: '#0f172a',  // Premium black
    },

    // Accent - Electric Orange (Bidding Urgency)
    accent: {
      50: '#fff7ed',   // Soft orange tint
      100: '#ffedd5',  // Light orange
      200: '#fed7aa',  // Pale orange
      300: '#fdba74',  // Light orange
      400: '#fb923c',  // Medium orange
      500: '#ea580c',  // Electric Orange (Accent) - Action driver
      600: '#dc2626',  // Dark orange
      700: '#c2410c',  // Deep orange
      800: '#9a3412',  // Dark deep orange
      900: '#7c2d12',  // Almost black
    },

    // Success - Emerald Green (Loan Approval)
    success: {
      50: '#f0fdf4',   // Soft green tint
      100: '#dcfce7',  // Light green
      200: '#bbf7d0',  // Pale green
      300: '#86efac',  // Light green
      400: '#4ade80',  // Medium green
      500: '#059669',  // Emerald Green (Success) - Trust signal
      600: '#047857',  // Dark emerald
      700: '#065f46',  // Forest emerald
      800: '#064e3b',  // Dark forest
      900: '#022c22',  // Premium black
    },

    // Danger - Red (Risk Alerts)
    danger: {
      50: '#fef2f2',   // Soft red tint
      100: '#fee2e2',  // Light red
      200: '#fecaca',  // Pale red
      300: '#fca5a5',  // Light red
      400: '#f87171',  // Medium red
      500: '#dc2626',  // Red (Danger) - Risk alerts
      600: '#dc2626',  // Dark red
      700: '#b91c1c',  // Deep red
      800: '#991b1b',  // Dark deep red
      900: '#7f1d1d',  // Almost black
    },

    // Neutral - Premium Gray Scale
    neutral: {
      0: '#ffffff',    // Pure white
      50: '#fafafa',   // Soft white
      100: '#f5f5f5',  // Light gray
      200: '#e5e5e5',  // Pale gray
      300: '#d4d4d4',  // Light gray
      400: '#a3a3a3',  // Medium gray
      500: '#737373',  // Gray (Body text)
      600: '#525252',  // Dark gray
      700: '#404040',  // Charcoal
      800: '#262626',  // Dark charcoal
      900: '#171717',  // Almost black
      950: '#0a0a0a',  // Premium black
    },

    // Semantic Colors - Enterprise Standards
    warning: '#f59e0b',    // Amber for warnings
    info: '#1e40af',       // Royal blue for info

    // Special States - Conversion Optimized
    bid: '#ea580c',        // Electric orange for bids
    urgent: '#dc2626',     // Red for urgency
    verified: '#059669',   // Emerald for trust
    ai: '#7c3aed',         // Purple for AI features
    premium: '#1e293b',    // Deep indigo for premium features
  },

  // 📐 ELITE SPACING - 8px System (Apple Precision)
  spacing: {
    0: '0',
    1: '0.25rem',    // 4px
    2: '0.5rem',     // 8px - Base unit
    3: '0.75rem',    // 12px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    8: '2rem',       // 32px
    10: '2.5rem',    // 40px
    12: '3rem',      // 48px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
    32: '8rem',      // 128px
  },

  // 🔤 ELITE TYPOGRAPHY - Inter Scale (Stripe Authority)
  typography: {
    fontFamily: {
      primary: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'monospace'],
    },

    // Elite Scale for ₹100 Crore Brand
    fontSize: {
      xs: '0.75rem',    // 12px - Micro copy
      sm: '0.875rem',   // 14px - Secondary text
      base: '1rem',     // 16px - Body text
      lg: '1.125rem',   // 18px - Large body
      xl: '1.25rem',    // 20px - H3 equivalent
      '2xl': '1.5rem',  // 24px - H2 equivalent
      '3xl': '1.875rem', // 30px - H1 equivalent
      '4xl': '2.25rem', // 36px - Hero headings
      '5xl': '3rem',    // 48px - Large hero
      '6xl': '3.75rem', // 60px - Massive impact
    },

    fontWeight: {
      thin: '100',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },

    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },

    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  // 🔄 ELITE ANIMATIONS - Smooth 250ms (Apple Polish)
  animation: {
    duration: {
      instant: '0ms',
      fast: '150ms',
      normal: '250ms',    // Primary duration
      slow: '350ms',
      slower: '500ms',
    },

    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },

    // Premium Micro-interactions
    micro: {
      hover: 'cubic-bezier(0.4, 0, 0.2, 1)',
      press: 'cubic-bezier(0.4, 0, 1, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  // 📦 ELITE ELEVATION - Soft Layered Shadows (Material Premium)
  elevation: {
    none: 'none',
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },

  // 🔘 ELITE BORDER RADIUS - 12-16px (Modern Premium)
  borderRadius: {
    none: '0',
    sm: '0.25rem',     // 4px
    base: '0.375rem',  // 6px
    md: '0.5rem',      // 8px
    lg: '0.75rem',     // 12px - Primary
    xl: '1rem',        // 16px - Large elements
    '2xl': '1.5rem',   // 24px - Hero elements
    '3xl': '2rem',     // 32px - Maximum
    full: '9999px',    // Fully rounded
  },

  // 📱 ELITE BREAKPOINTS - Mobile-First (Indian Market)
  breakpoints: {
    xs: '475px',   // Small phones
    sm: '640px',   // Large phones
    md: '768px',   // Tablets
    lg: '1024px',  // Small laptops
    xl: '1280px',  // Laptops
    '2xl': '1536px', // Large screens
  },

  // 📐 ELITE GRID - 12-Column System (Design System Standard)
  grid: {
    cols: 12,
    gap: {
      xs: '0.5rem',   // 8px
      sm: '1rem',     // 16px
      md: '1.5rem',   // 24px
      lg: '2rem',     // 32px
      xl: '3rem',     // 48px
    },
  },

  // 🎯 ENTERPRISE COMPONENT TOKENS - Premium Standards
  components: {
    // Cards - Elevated system with soft shadows
    card: {
      padding: '2rem',        // 32px
      borderRadius: '1rem',   // 16px - Premium feel
      elevation: 'md',
      background: '#ffffff',
      border: '1px solid #e2e8f0',
    },

    // Auction Card - Specialized component
    auctionCard: {
      height: 'auto',
      borderRadius: '1rem',
      elevation: 'sm',
      countdownBadge: {
        position: 'top-right',
        background: '#ea580c', // Electric orange
        color: '#ffffff',
        fontSize: '0.875rem',
        fontWeight: '600',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        animation: 'pulse',
      },
      verifiedDealerBadge: {
        icon: 'Shield',
        color: '#059669', // Emerald green
        background: '#f0fdf4',
        fontSize: '0.75rem',
        padding: '0.125rem 0.5rem',
      },
      emiPreviewTag: {
        color: '#1e293b', // Deep indigo
        background: '#eff6ff',
        fontSize: '0.875rem',
        fontWeight: '600',
        padding: '0.25rem 0.75rem',
        borderRadius: '0.5rem',
      },
      riskGradeBadge: {
        fontSize: '0.75rem',
        padding: '0.125rem 0.5rem',
        borderRadius: '0.375rem',
        variants: {
          A: { color: '#ffffff', background: '#059669' },
          B: { color: '#ffffff', background: '#1e40af' },
          C: { color: '#ffffff', background: '#f59e0b' },
          D: { color: '#ffffff', background: '#dc2626' },
        }
      }
    },

    // Buttons - Hierarchy system
    button: {
      height: {
        sm: '2.5rem',   // 40px
        md: '3rem',     // 48px
        lg: '3.5rem',   // 56px
      },
      borderRadius: '0.75rem', // 12px
      fontWeight: '600',
      variants: {
        primary: {
          background: '#1e293b', // Deep indigo
          color: '#ffffff',
          hover: '#1e40af',
        },
        secondary: {
          background: '#ffffff',
          color: '#1e293b',
          border: '1px solid #e2e8f0',
          hover: '#eff6ff',
        },
        accent: {
          background: '#ea580c', // Electric orange
          color: '#ffffff',
          hover: '#dc2626',
        },
        success: {
          background: '#059669', // Emerald green
          color: '#ffffff',
          hover: '#047857',
        },
        danger: {
          background: '#dc2626', // Red
          color: '#ffffff',
          hover: '#b91c1c',
        }
      }
    },

    // Inputs - Premium form elements
    input: {
      height: '3rem',         // 48px
      borderRadius: '0.75rem', // 12px
      padding: '0 1rem',      // 16px horizontal
      border: '1px solid #e2e8f0',
      focus: {
        borderColor: '#1e293b',
        ringColor: '#eff6ff',
      }
    },

    // Navigation - Enterprise layout
    nav: {
      height: '4rem',     // 64px
      logo: {
        width: '2rem',   // 32px
        height: '2rem',  // 32px
      },
      sidebar: {
        width: '16rem',  // 256px
        collapsedWidth: '4rem', // 64px
        background: '#ffffff',
        border: '1px solid #e2e8f0',
      }
    },
  },

  // 🧠 TRUST PSYCHOLOGY LAYER - Conversion Optimization
  psychology: {
    // Social Proof Signals
    socialProof: {
      color: '#059669',       // Emerald green
      icon: 'Shield',         // Trust icon
      text: '10,000+ Verified Auctions',
      badge: 'Verified Dealer',
      animation: 'fadeIn',
    },

    // Scarcity Triggers
    scarcity: {
      color: '#ea580c',       // Electric orange
      animation: 'pulse',     // Subtle animation
      text: 'Ending Soon',
      countdown: {
        color: '#dc2626',     // Red for urgency
        fontSize: '1.125rem',
        fontWeight: '700',
      }
    },

    // Authority Positioning
    authority: {
      color: '#1e293b',       // Deep indigo
      badge: 'AI Verified',   // Trust badge
      icon: 'CheckCircle',
      background: '#eff6ff',
      text: 'Bank-Grade Security',
    },

    // Loss Aversion
    lossAversion: {
      color: '#f59e0b',       // Warning amber
      text: 'Don\'t miss out',
      animation: 'fadeIn',
      background: '#fffbeb',
    },

    // Trust Indicators
    trustIndicators: {
      verifiedDealer: {
        icon: 'Shield',
        color: '#059669',
        background: '#f0fdf4',
        text: 'Verified Dealer',
      },
      inspectionScore: {
        icon: 'Star',
        color: '#1e293b',
        background: '#eff6ff',
        text: '85/100 Inspection Score',
      },
      secureTransaction: {
        icon: 'Lock',
        color: '#059669',
        background: '#f0fdf4',
        text: 'Secure Transaction',
      },
      loanPreApproved: {
        icon: 'CheckCircle',
        color: '#ffffff',
        background: '#059669',
        text: 'Loan Pre-approved',
      },
      realTimeBidders: {
        icon: 'Users',
        color: '#1e293b',
        background: '#eff6ff',
        text: '23 Active Bidders',
      }
    },

    // Conversion Drivers
    conversionDrivers: {
      bidUrgency: {
        color: '#ea580c',
        animation: 'scale',
        text: 'Bid Now',
      },
      loanSavings: {
        color: '#059669',
        icon: 'TrendingDown',
        text: 'Save ₹50,000 with EMI',
      },
      timePressure: {
        color: '#dc2626',
        animation: 'pulse',
        text: 'Auction ends in 2h 34m',
      },
      socialProof: {
        color: '#1e293b',
        icon: 'Users',
        text: 'Join 1,247 bidders',
      }
    }
  },

  // 🚀 Z-INDEX SCALE - Clean Layering
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
    toast: 1070,
  },
};

// Utility Classes Generator
export const createUtilityClasses = () => {
  const utilities: Record<string, string> = {};

  // Spacing utilities
  Object.entries(designTokens.spacing).forEach(([key, value]) => {
    utilities[`p-${key}`] = `padding: ${value};`;
    utilities[`m-${key}`] = `margin: ${value};`;
    utilities[`px-${key}`] = `padding-left: ${value}; padding-right: ${value};`;
    utilities[`py-${key}`] = `padding-top: ${value}; padding-bottom: ${value};`;
    utilities[`mx-${key}`] = `margin-left: ${value}; margin-right: ${value};`;
    utilities[`my-${key}`] = `margin-top: ${value}; margin-bottom: ${value};`;
  });

  // Typography utilities
  Object.entries(designTokens.typography.fontSize).forEach(([key, value]) => {
    utilities[`text-${key}`] = `font-size: ${value};`;
  });

  Object.entries(designTokens.typography.fontWeight).forEach(([key, value]) => {
    utilities[`font-${key}`] = `font-weight: ${value};`;
  });

  // Color utilities
  Object.entries(designTokens.colors.primary).forEach(([key, value]) => {
    utilities[`bg-primary-${key}`] = `background-color: ${value};`;
    utilities[`text-primary-${key}`] = `color: ${value};`;
  });

  return utilities;
};

export default designTokens;
