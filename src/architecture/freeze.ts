// Architecture Freeze - Final Implementation Rules
import { UserRole } from '../design-system/types';

// ARCHITECTURE FREEZE RULES
export const ARCHITECTURE_RULES = {
  // UXGuard is the ONLY access control layer
  UX_GUARD_ONLY: true,
  
  // SmartImage is MANDATORY for all images
  SMART_IMAGE_MANDATORY: true,
  
  // UXStates are REQUIRED for state management
  UX_STATES_REQUIRED: true,
  
  // Design tokens ONLY - no inline styles
  DESIGN_TOKENS_ONLY: true,
  
  // No other role checks allowed in UI
  ROLE_CHECKS_FORBIDDEN: true,
  
  // No component may bypass these rules
  BYPASS_FORBIDDEN: true
} as const;

// Validation helpers for architecture compliance
export const validateArchitecture = {
  // Check if component uses only UXGuard for access control
  validateAccessControl: (componentName: string, hasRoleChecks: boolean, hasUXGuard: boolean): boolean => {
    if (hasRoleChecks && !hasUXGuard) {
      console.error(`Architecture violation in ${componentName}: Direct role checks detected. Use UXGuard only.`);
      return false;
    }
    return true;
  },

  // Check if component uses SmartImage for images
  validateImageHandling: (componentName: string, hasImgTag: boolean, hasSmartImage: boolean): boolean => {
    if (hasImgTag && !hasSmartImage) {
      console.error(`Architecture violation in ${componentName}: Direct <img> usage detected. Use SmartImage only.`);
      return false;
    }
    return true;
  },

  // Check if component uses UXStates for state management
  validateStateManagement: (componentName: string, hasAdHocStates: boolean, hasUXStates: boolean): boolean => {
    if (hasAdHocStates && !hasUXStates) {
      console.error(`Architecture violation in ${componentName}: Ad-hoc state management detected. Use UXStates only.`);
      return false;
    }
    return true;
  },

  // Check if component uses design tokens only
  validateDesignTokens: (componentName: string, hasInlineStyles: boolean, hasDesignTokens: boolean): boolean => {
    if (hasInlineStyles && !hasDesignTokens) {
      console.error(`Architecture violation in ${componentName}: Inline styles detected. Use design tokens only.`);
      return false;
    }
    return true;
  }
};

// Runtime enforcement
export const enforceArchitecture = {
  // Fail fast in development if architecture is violated
  enforceInDevelopment: (): void => {
    if (process.env.NODE_ENV === 'development') {
      // Override console.error to throw in development
      const originalError = console.error;
      console.error = (...args: any[]) => {
        originalError(...args);
        if (args[0] && typeof args[0] === 'string' && args[0].includes('Architecture violation')) {
          throw new Error(`Architecture violation: ${args[0]}`);
        }
      };
    }
  },

  // Log architecture compliance in production
  logCompliance: (componentName: string, compliance: boolean): void => {
    if (process.env.NODE_ENV === 'production') {
      if (!compliance) {
        console.warn(`Architecture compliance issue in ${componentName}`);
      }
    }
  }
};

// Export strict types for enforcement
export type StrictUserRole = Exclude<UserRole, 'public'>; // Remove 'public' as it's not a valid role

export type RequiredProps<T> = {
  [K in keyof T]: T[K] extends undefined ? never : T[K];
};

// Helper to ensure all required props are provided
export const requireProps = <T extends object>(props: T, componentName: string): RequiredProps<T> => {
  const missingProps = Object.keys(props).filter(key => 
    props[key as keyof T] === undefined || props[key as keyof T] === null
  ) as (keyof T)[];
  
  if (missingProps.length > 0) {
    throw new Error(`${componentName}: Missing required props: ${missingProps.join(', ')}`);
  }
  
  return props as RequiredProps<T>;
};
