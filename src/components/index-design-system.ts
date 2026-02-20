// Design System Component Exports
// Phase 1 - Core Components

export { Card } from './ui/Card';
export { MetricCard } from './ui/MetricCard';
export { Input } from './ui/Input';
export { Badge } from './ui/badge';
export { Button } from './ui/button';

export { Header } from './layout/Header';
export { Footer } from './layout/Footer';
export { SidebarLayout } from './layout/SidebarLayout';

export { RoleBasedRouter, useUserRole } from './router/RoleBasedRouter';

// Re-export design tokens
export { 
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  Z_INDEX,
  BREAKPOINTS,
  TRANSITIONS,
  CARD as CARD_TOKENS,
  BADGE as BADGE_TOKENS,
  BUTTON as BUTTON_TOKENS,
  INPUT as INPUT_TOKENS,
  LAYOUT as LAYOUT_TOKENS,
} from '../config/designTokens';
