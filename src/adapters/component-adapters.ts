// Adapters - Fixed Import Paths (Final Version)
import { ButtonVariant, ButtonSize } from '../design-system/types';
import { SmartImageProps } from '../../components/SmartImage-fixed';
import { UXGuardProps } from '../../components/UXGuard-fixed';

// Button Adapter - Accepts legacy props, maps to strict types
export interface ButtonPropsAdapter {
  variant?: ButtonVariant | string;
  size?: ButtonSize | string;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  [key: string]: any; // Allow legacy props
}

// SmartImage Adapter - Accepts legacy props, maps to strict types
export interface SmartImagePropsAdapter {
  src?: string | string[] | undefined;
  alt?: string;
  className?: string;
  fallback?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape' | string;
  priority?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
  [key: string]: any; // Allow legacy props
}

// UXGuard Adapter - Accepts legacy props, maps to strict types
export interface UXGuardPropsAdapter {
  children?: React.ReactNode;
  role?: string;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  className?: string;
  [key: string]: any; // Allow legacy props
}

// Adapter helpers - Safe type mapping
export const adapterHelpers = {
  // Button adapter - Maps legacy props to strict types
  adaptButtonProps: (props: ButtonPropsAdapter) => {
    const {
      variant = 'primary' as ButtonVariant,
      size = 'md' as ButtonSize,
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      onClick,
      children,
      ...rest
    } = props;

    return {
      variant,
      size,
      loading,
      disabled,
      leftIcon,
      rightIcon,
      fullWidth,
      className,
      onClick,
      children,
      // Filter out any non-standard props
      ...Object.fromEntries(
        Object.entries(rest).filter(([key]) => 
          ['variant', 'size', 'loading', 'disabled', 'leftIcon', 'rightIcon', 'fullWidth', 'className', 'onClick', 'children'].includes(key)
        )
      )
    };
  },

  // SmartImage adapter - Maps legacy props to strict types
  adaptSmartImageProps: (props: SmartImagePropsAdapter) => {
    const {
      src,
      alt = '',
      className = '',
      fallback,
      aspectRatio = 'square' as 'square' | 'video' | 'portrait' | 'landscape',
      priority = false,
      onClick,
      style = {},
      ...rest
    } = props;

    return {
      src: src || undefined,
      alt,
      className,
      fallback,
      aspectRatio,
      priority,
      onClick,
      // Filter out style prop as it's handled differently
      ...Object.fromEntries(
        Object.entries(rest).filter(([key]) => key !== 'style')
      )
    };
  },

  // UXGuard adapter - Maps legacy props to strict types
  adaptUXGuardProps: (props: UXGuardPropsAdapter) => {
    const {
      children,
      role,
      fallback,
      loadingComponent,
      className = '',
      ...rest
    } = props;

    return {
      children,
      role: role as any, // Allow string roles for compatibility
      fallback,
      loadingComponent,
      className,
      // Filter out non-standard props
      ...Object.fromEntries(
        Object.entries(rest).filter(([key]) => 
          ['children', 'role', 'fallback', 'loadingComponent', 'className'].includes(key)
        )
      )
    };
  }
};
