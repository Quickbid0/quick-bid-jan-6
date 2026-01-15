export type Currency = 'INR' | 'USD';
export type Period = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

// ==========================================
// 1. KPI Schema
// ==========================================

export interface KPIMetric {
  id: string;
  label: string;
  value: number;
  unit?: string; // e.g., '₹', '%', ''
  trend: {
    value: number; // percentage change
    direction: 'up' | 'down' | 'neutral';
    period: string; // e.g., 'vs last month'
  };
  breakdown?: {
    label: string;
    value: number;
  }[];
}

export interface AdminDashboardKPIs {
  totalGMV: KPIMetric;
  activeAuctions: KPIMetric;
  refundsProcessed: KPIMetric;
  fraudAlerts: KPIMetric;
}

// ==========================================
// 2. OKR Formulas & Targets
// ==========================================

export interface OKRTarget {
  id: string;
  metricId: string; // References a KPIMetric
  label: string;
  targetValue: number;
  currentValue: number;
  startDate: string;
  endDate: string;
  ownerId?: string; // Sales rep ID
}

/**
 * Calculates the progress percentage of an OKR.
 * Formula: (Current / Target) * 100, capped at 100 if strict, or uncapped.
 */
export const calculateOKRProgress = (current: number, target: number, capped = true): number => {
  if (target === 0) return 0;
  const progress = (current / target) * 100;
  return capped ? Math.min(100, progress) : progress;
};

/**
 * Calculates the projected outcome based on time elapsed.
 * Formula: (Current / DaysElapsed) * TotalDays
 */
export const calculateProjectedOKR = (
  current: number, 
  startDate: Date, 
  endDate: Date
): number => {
  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsed = Date.now() - startDate.getTime();
  if (elapsed <= 0) return 0;
  const rate = current / elapsed;
  return rate * totalDuration;
};

// ==========================================
// 3. Incentive Rules
// ==========================================

export interface IncentiveTier {
  threshold: number; // Percentage of target achieved (e.g., 100, 120)
  bonusPercentage: number; // % of base salary or flat amount
  bonusType: 'percentage' | 'flat';
}

export interface IncentiveRule {
  id: string;
  role: 'sales_rep' | 'manager' | 'regional_head';
  metric: string; // e.g., 'GMV'
  tiers: IncentiveTier[];
}

/**
 * Calculates incentive based on achievement percentage.
 * Logic: Finds the highest tier met and applies the bonus.
 */
export const calculateIncentive = (
  achievementPercent: number, 
  baseAmount: number, 
  tiers: IncentiveTier[]
): number => {
  // Sort tiers by threshold descending
  const sortedTiers = [...tiers].sort((a, b) => b.threshold - a.threshold);
  
  const tier = sortedTiers.find(t => achievementPercent >= t.threshold);
  
  if (!tier) return 0;
  
  if (tier.bonusType === 'percentage') {
    return baseAmount * (tier.bonusPercentage / 100);
  }
  
  return tier.bonusPercentage; // Flat amount
};

// ==========================================
// 4. Leaderboard Schema
// ==========================================

export interface SalesLeaderboardEntry {
  rank: number;
  salesRepId: string;
  name: string;
  totalSales: number; // GMV
  dealsClosed: number;
  trend: 'up' | 'down' | 'neutral';
  avatarUrl?: string;
}

// Example Incentive Rules
export const STANDARD_SALES_INCENTIVE: IncentiveRule = {
  id: 'std_sales_q3',
  role: 'sales_rep',
  metric: 'GMV',
  tiers: [
    { threshold: 120, bonusPercentage: 15, bonusType: 'percentage' }, // Super Bonus
    { threshold: 100, bonusPercentage: 10, bonusType: 'percentage' }, // Target Met
    { threshold: 80, bonusPercentage: 5, bonusType: 'percentage' },   // Near Miss
  ]
};

// ==========================================
// 4. Heatmap Data Shape
// ==========================================

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface HeatmapDataPoint extends GeoPoint {
  id: string; // region or point ID
  weight: number; // Intensity (0-1 or raw value)
  metadata?: {
    regionName: string;
    activeUsers: number;
    totalRevenue: number;
    topCategory: string;
  };
}

export interface HeatmapDataset {
  metric: 'revenue' | 'activity' | 'logistics_load';
  points: HeatmapDataPoint[];
  maxVal: number; // For normalization
}
