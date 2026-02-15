// UI System - Centralized Design System
// Export all design system components and tokens

// Design Tokens
export { colors, default as colorsDefault } from './colors';
export { typography, textStyles, textColors, default as typographyDefault } from './typography';
export { spacing, default as spacingDefault } from './spacing';

// Components
export { Button, PrimaryButton, SecondaryButton, SuccessButton, WarningButton, ErrorButton, OutlineButton, GhostButton, TrustButton, BidButton, IconButton, ButtonGroup, default as ButtonDefault } from './buttons';
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, TrustCard, AuctionCard, StatsCard, AlertCard, ProductCard, default as CardDefault } from './cards';
export { Badge, VerifiedBadge, EscrowBadge, InspectedBadge, PremiumBadge, ActiveBadge, PendingBadge, EndedBadge, WinningBadge, OutbidBadge, ReserveMetBadge, BadgeGroup, TrustIndicators, ProductStatusBadges, default as BadgeDefault } from './badges';
export { Container, PageLayout, Grid, Flex, Stack, Section, AuctionLayout, DashboardLayout, default as LayoutDefault } from './layout';

// Simplified Components (Reduced Cognitive Overload)
export { StatusBadge, TrustScore, AuctionStatus, PaymentStatus, DeliveryStatus, ProgressIndicator, default as SimplifiedStatusDefault } from './simplified-status';

// Bug Prevention Utilities
export { useSafeClick, useFormSubmission, useScrollLock, useLayoutStable, useStableKey, useEventListener, useHydrated, useDebounce, safeGet, safeInvoke, NoSSR, SafeErrorBoundary, default as BugPreventionDefault } from './bug-prevention';

// Performance, Mobile & Trust Components
export { Memoized, LazyWrapper, OptimizedImage, ResponsiveContainer, TouchButton, MobileModal, TrustBar, SecurityBadges, ErrorToast, SuccessFeedback, LoadingSpinner, Skeleton, default as PerformanceMobileTrustDefault } from './performance-mobile-trust';

// Validation & Testing Tools
export { validationTests, ValidationDashboard, useFlowValidation, default as ValidationDefault } from './validation';

// Re-export utilities
export { getColor, getTrustColor, getSemanticColor } from './colors';
export { getSpacing, getComponentSpacing, getLayoutSpacing, getSurfaceSpacing } from './spacing';

// Component Type Exports
export type { ButtonProps } from './buttons';
export type { CardProps, ProductCardProps } from './cards';
export type { BadgeProps, TrustIndicatorsProps, ProductStatusBadgesProps } from './badges';
export type { ContainerProps, PageLayoutProps, GridProps, FlexProps, StackProps, SectionProps, AuctionLayoutProps, DashboardLayoutProps } from './layout';
export type { StatusBadgeProps, TrustScoreProps, AuctionStatusProps, PaymentStatusProps, DeliveryStatusProps, ProgressIndicatorProps } from './simplified-status';
export type { OptimizedImageProps, ResponsiveContainerProps, TouchButtonProps, MobileModalProps, TrustBarProps, SecurityBadgesProps, ErrorToastProps, SuccessFeedbackProps, LoadingSpinnerProps, SkeletonProps } from './performance-mobile-trust';
export type { ValidationTest, ValidationResult } from './validation';
