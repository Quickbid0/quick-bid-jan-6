// Component Integration - Safe Replacement Map
import { Button as ButtonFixed } from '../design-system/components/Button-fixed';
import { SmartImage as SmartImageFixed } from '../components/SmartImage-fixed';
import { UXGuard as UXGuardFixed } from '../components/UXGuard-fixed';
import { 
  EmptyState as EmptyStateFixed, 
  ErrorState as ErrorStateFixed, 
  LoadingState as LoadingStateFixed,
  DisabledAction as DisabledActionFixed 
} from '../components/UXStates-fixed';

// Export unified components for safe integration
export {
  ButtonFixed as Button,
  SmartImageFixed as SmartImage,
  UXGuardFixed as UXGuard,
  EmptyStateFixed as EmptyState,
  ErrorStateFixed as ErrorState,
  LoadingStateFixed as LoadingState,
  DisabledActionFixed as DisabledAction,
};

// Integration helpers for safe replacement
export const integrationHelpers = {
  // Safe button replacement
  replaceButton: (oldProps: any) => {
    // Map old button props to new button props
    const { variant, size, loading, disabled, leftIcon, rightIcon, fullWidth, ...rest } = oldProps;
    return {
      variant: variant || 'primary',
      size: size || 'md',
      loading: loading || false,
      disabled: disabled || false,
      leftIcon,
      rightIcon,
      fullWidth: fullWidth || false,
      ...rest
    };
  },

  // Safe image replacement
  replaceImage: (oldProps: any) => {
    const { src, alt, className, fallback, aspectRatio, priority, onClick, ...rest } = oldProps;
    return {
      src,
      alt,
      className: className || '',
      fallback: fallback || undefined,
      aspectRatio: aspectRatio || 'square',
      priority: priority || false,
      onClick,
      ...rest
    };
  },

  // Safe UXGuard replacement
  replaceUXGuard: (oldProps: any) => {
    const { children, role, fallback, loadingComponent, ...rest } = oldProps;
    return {
      children,
      role: role || undefined,
      fallback: fallback || undefined,
      loadingComponent: loadingComponent || undefined,
      ...rest
    };
  },

  // Check if component needs replacement
  needsButtonReplacement: (componentPath: string) => {
    return componentPath.includes('Button') && !componentPath.includes('Button-fixed');
  },

  needsImageReplacement: (componentPath: string) => {
    return componentPath.includes('<img') || componentPath.includes('Image') && !componentPath.includes('SmartImage-fixed');
  },

  needsUXGuardReplacement: (componentPath: string) => {
    return componentPath.includes('role') || componentPath.includes('access') && !componentPath.includes('UXGuard-fixed');
  }
};
