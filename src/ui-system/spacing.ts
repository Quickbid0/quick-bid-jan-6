// UI System - Spacing
// Consistent spacing scale based on 8px grid system

export const spacing = {
  // Base spacing units (8px grid)
  xs: '0.25rem',   // 4px - tiny gaps
  sm: '0.5rem',    // 8px - small gaps, padding
  md: '1rem',      // 16px - medium gaps, component padding
  lg: '1.5rem',    // 24px - large gaps, section spacing
  xl: '2rem',      // 32px - extra large gaps
  '2xl': '3rem',   // 48px - section separators
  '3xl': '4rem',   // 64px - major section breaks
  '4xl': '6rem',   // 96px - page breaks

  // Component-specific spacing
  component: {
    padding: {
      xs: '0.5rem',    // 8px - small buttons, inputs
      sm: '0.75rem',   // 12px - medium components
      md: '1rem',      // 16px - large components
      lg: '1.5rem',    // 24px - cards, modals
      xl: '2rem',      // 32px - major containers
    },
    gap: {
      xs: '0.25rem',   // 4px - icon + text
      sm: '0.5rem',    // 8px - related elements
      md: '1rem',      // 16px - component sections
      lg: '1.5rem',    // 24px - major sections
    },
    margin: {
      xs: '0.25rem',   // 4px
      sm: '0.5rem',    // 8px
      md: '1rem',      // 16px
      lg: '1.5rem',    // 24px
      xl: '2rem',      // 32px
    },
  },

  // Layout spacing
  layout: {
    container: {
      maxWidth: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      padding: {
        mobile: '1rem',    // 16px on mobile
        tablet: '2rem',    // 32px on tablet
        desktop: '3rem',   // 48px on desktop
      },
    },
    sidebar: {
      width: '280px',       // Fixed sidebar width
      collapsed: '64px',    // Collapsed width
    },
    header: {
      height: '64px',       // Fixed header height
    },
  },

  // Card and modal spacing
  surface: {
    card: {
      padding: '1.5rem',    // 24px
      gap: '1rem',          // 16px between elements
      borderRadius: '0.75rem', // 12px
    },
    modal: {
      padding: '2rem',      // 32px
      gap: '1.5rem',        // 24px
      borderRadius: '1rem', // 16px
    },
    tooltip: {
      padding: '0.5rem',    // 8px
      gap: '0.25rem',       // 4px
    },
  },
};

// Spacing utility functions
export const getSpacing = (size: keyof typeof spacing) => {
  return spacing[size];
};

export const getComponentSpacing = (
  type: keyof typeof spacing.component,
  size: string
) => {
  return spacing.component[type][size as keyof typeof spacing.component[typeof type]];
};

export const getLayoutSpacing = (
  type: keyof typeof spacing.layout,
  property: string
) => {
  return spacing.layout[type][property as keyof typeof spacing.layout[typeof type]];
};

export const getSurfaceSpacing = (
  type: keyof typeof spacing.surface,
  property: string
) => {
  return spacing.surface[type][property as keyof typeof spacing.surface[typeof type]];
};

// CSS Custom Properties for runtime theming
export const spacingCSS = {
  '--spacing-xs': spacing.xs,
  '--spacing-sm': spacing.sm,
  '--spacing-md': spacing.md,
  '--spacing-lg': spacing.lg,
  '--spacing-xl': spacing.xl,
  '--spacing-2xl': spacing['2xl'],
  '--spacing-3xl': spacing['3xl'],
  '--spacing-4xl': spacing['4xl'],
};

export default spacing;
