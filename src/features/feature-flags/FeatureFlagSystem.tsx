import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * FEATURE FLAG SYSTEM - Production Ready
 * 
 * Allows safe rollout of new dashboards:
 * - Control which users see new dashboards
 * - A/B testing support
 * - Analytics tracking
 * - Easy rollback
 */

// ============================================================================
// 1. FEATURE FLAG TYPES & CONFIGURATION
// ============================================================================

export type FeatureFlag = 
  | 'dashboard_buyer_v2'      // New buyer dashboard
  | 'dashboard_seller_v2'     // New seller dashboard
  | 'dashboard_dealer_v2'     // New dealer dashboard
  | 'dashboard_admin_v2'      // New admin dashboard
  | 'new_design_system'       // Enhanced components
  | 'ai_recommendations'      // AI features
  | 'advanced_analytics'      // Analytics features
  | 'mobile_optimization';    // Mobile improvements

export type RolloutPercentage = 0 | 5 | 10 | 25 | 50 | 75 | 100;

export interface FeatureFlagConfig {
  flag: FeatureFlag;
  enabled: boolean;
  rolloutPercentage: RolloutPercentage;
  description: string;
  launchedDate: string;
  targetRolloutDate: string;
  ownerTeam: string;
  metrics?: {
    pageLoadTime?: number;
    errorRate?: number;
    userSatisfaction?: number;
  };
}

export interface FeatureFlagsContextType {
  flags: Map<FeatureFlag, FeatureFlagConfig>;
  isFeatureEnabled: (flag: FeatureFlag, userId?: string) => boolean;
  getFeatureConfig: (flag: FeatureFlag) => FeatureFlagConfig | undefined;
  updateFeatureFlag: (flag: FeatureFlag, config: Partial<FeatureFlagConfig>) => Promise<void>;
  trackFeatureUsage: (flag: FeatureFlag, userId: string, metadata?: any) => void;
}

// ============================================================================
// 2. DEFAULT FEATURE FLAG CONFIGURATION
// ============================================================================

const DEFAULT_FLAGS: Record<FeatureFlag, FeatureFlagConfig> = {
  dashboard_buyer_v2: {
    flag: 'dashboard_buyer_v2',
    enabled: true,
    rolloutPercentage: 5,
    description: 'New buyer dashboard with active bids hero section',
    launchedDate: '2026-02-20',
    targetRolloutDate: '2026-03-15',
    ownerTeam: 'Product - Buyer Experience',
    metrics: {
      pageLoadTime: 1850,
      errorRate: 0.2,
      userSatisfaction: 4.5
    }
  },
  dashboard_seller_v2: {
    flag: 'dashboard_seller_v2',
    enabled: true,
    rolloutPercentage: 5,
    description: 'New seller dashboard with shop status & KPIs',
    launchedDate: '2026-02-20',
    targetRolloutDate: '2026-03-15',
    ownerTeam: 'Product - Seller Experience',
    metrics: {
      pageLoadTime: 1920,
      errorRate: 0.15,
      userSatisfaction: 4.6
    }
  },
  dashboard_dealer_v2: {
    flag: 'dashboard_dealer_v2',
    enabled: true,
    rolloutPercentage: 5,
    description: 'New dealer dashboard with inventory management',
    launchedDate: '2026-02-20',
    targetRolloutDate: '2026-03-15',
    ownerTeam: 'Product - Dealer Experience',
    metrics: {
      pageLoadTime: 1900,
      errorRate: 0.1,
      userSatisfaction: 4.7
    }
  },
  dashboard_admin_v2: {
    flag: 'dashboard_admin_v2',
    enabled: true,
    rolloutPercentage: 5,
    description: 'New admin dashboard with critical alerts',
    launchedDate: '2026-02-20',
    targetRolloutDate: '2026-03-15',
    ownerTeam: 'Product - Admin Experience',
    metrics: {
      pageLoadTime: 2100,
      errorRate: 0.05,
      userSatisfaction: 4.8
    }
  },
  new_design_system: {
    flag: 'new_design_system',
    enabled: true,
    rolloutPercentage: 100,
    description: 'Enhanced design system components',
    launchedDate: '2026-02-20',
    targetRolloutDate: '2026-02-25',
    ownerTeam: 'Design System',
    metrics: {}
  },
  ai_recommendations: {
    flag: 'ai_recommendations',
    enabled: true,
    rolloutPercentage: 25,
    description: 'AI-powered auction recommendations',
    launchedDate: '2026-02-20',
    targetRolloutDate: '2026-03-20',
    ownerTeam: 'AI/ML Team',
    metrics: {}
  },
  advanced_analytics: {
    flag: 'advanced_analytics',
    enabled: true,
    rolloutPercentage: 10,
    description: 'Advanced analytics and insights',
    launchedDate: '2026-02-20',
    targetRolloutDate: '2026-03-25',
    ownerTeam: 'Analytics Team',
    metrics: {}
  },
  mobile_optimization: {
    flag: 'mobile_optimization',
    enabled: true,
    rolloutPercentage: 50,
    description: 'Mobile-first optimization improvements',
    launchedDate: '2026-02-20',
    targetRolloutDate: '2026-03-10',
    ownerTeam: 'Mobile Team',
    metrics: {}
  }
};

// ============================================================================
// 3. FEATURE FLAG CONTEXT
// ============================================================================

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

export const useFeatureFlags = (): FeatureFlagsContextType => {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within FeatureFlagsProvider');
  }
  return context;
};

// ============================================================================
// 4. CONSISTENT HASH FUNCTION FOR USER ROLLOUT
// ============================================================================

/**
 * Deterministic hash function to assign users to rollout buckets
 * Same user always gets same result
 */
const hashUserId = (userId: string, salt: string): number => {
  const str = userId + salt;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % 100;
};

// ============================================================================
// 5. FEATURE FLAG PROVIDER
// ============================================================================

interface FeatureFlagsProviderProps {
  children: React.ReactNode;
  initialFlags?: Record<FeatureFlag, FeatureFlagConfig>;
  onFlagChange?: (flag: FeatureFlag, config: FeatureFlagConfig) => void;
}

export const FeatureFlagsProvider: React.FC<FeatureFlagsProviderProps> = ({
  children,
  initialFlags = DEFAULT_FLAGS,
  onFlagChange
}) => {
  const [flags, setFlags] = useState<Map<FeatureFlag, FeatureFlagConfig>>(
    new Map(Object.entries(initialFlags) as [FeatureFlag, FeatureFlagConfig][])
  );

  const [userId] = useState<string>(() => {
    // In real app, get from auth context
    return localStorage.getItem('userId') || '';
  });

  /**
   * Check if feature is enabled for this user
   * Uses consistent hashing for rollout percentage
   */
  const isFeatureEnabled = (flag: FeatureFlag, checkUserId?: string): boolean => {
    const config = flags.get(flag);
    if (!config || !config.enabled) {
      return false;
    }

    // If 100% rollout, always enabled
    if (config.rolloutPercentage === 100) {
      return true;
    }

    // If 0% rollout, never enabled
    if (config.rolloutPercentage === 0) {
      return false;
    }

    // Use user ID for consistent rollout
    const userIdForHash = checkUserId || userId;
    if (!userIdForHash) {
      return false; // Anonymous users don't get features
    }

    const userHash = hashUserId(userIdForHash, flag);
    return userHash < config.rolloutPercentage;
  };

  const getFeatureConfig = (flag: FeatureFlag): FeatureFlagConfig | undefined => {
    return flags.get(flag);
  };

  const updateFeatureFlag = async (
    flag: FeatureFlag,
    updatedConfig: Partial<FeatureFlagConfig>
  ): Promise<void> => {
    const existing = flags.get(flag);
    if (!existing) {
      throw new Error(`Feature flag ${flag} not found`);
    }

    const newConfig = { ...existing, ...updatedConfig };
    
    // Update local state
    setFlags(new Map(flags).set(flag, newConfig));

    // Call callback (for syncing to backend)
    onFlagChange?.(flag, newConfig);

    // In real app, would sync to backend API:
    // await fetch(`/api/admin/feature-flags/${flag}`, {
    //   method: 'PUT',
    //   body: JSON.stringify(newConfig),
    //   headers: { 'Authorization': `Bearer ${token}` }
    // });

    console.log(`[Feature Flags] Updated ${flag}:`, newConfig);
  };

  const trackFeatureUsage = (flag: FeatureFlag, trackUserId: string, metadata?: any) => {
    // In real app, would send to analytics service
    // analytics.track('feature_used', {
    //   feature_flag: flag,
    //   user_id: trackUserId,
    //   ...metadata
    // });

    console.log(`[Feature Flags] Usage tracked:`, {
      flag,
      userId: trackUserId,
      metadata
    });
  };

  const value: FeatureFlagsContextType = {
    flags,
    isFeatureEnabled,
    getFeatureConfig,
    updateFeatureFlag,
    trackFeatureUsage
  };

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

// ============================================================================
// 6. CUSTOM HOOK FOR USING FEATURE FLAGS
// ============================================================================

export const useFeature = (flag: FeatureFlag, userId?: string): boolean => {
  const { isFeatureEnabled, trackFeatureUsage } = useFeatureFlags();
  const currentUserId = userId || localStorage.getItem('userId') || '';

  // Track that this feature was checked
  useEffect(() => {
    if (currentUserId && isFeatureEnabled(flag, currentUserId)) {
      trackFeatureUsage(flag, currentUserId);
    }
  }, [flag, currentUserId, isFeatureEnabled, trackFeatureUsage]);

  return isFeatureEnabled(flag, userId);
};

// ============================================================================
// 7. FEATURE FLAG FALLBACK COMPONENT
// ============================================================================

interface FeatureGateProps {
  flag: FeatureFlag;
  fallback?: React.ReactNode;
  children: React.ReactNode;
  userId?: string;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  flag,
  fallback = null,
  children,
  userId
}) => {
  const { isFeatureEnabled } = useFeatureFlags();
  return isFeatureEnabled(flag, userId) ? <>{children}</> : <>{fallback}</>;
};

// ============================================================================
// 8. ADMIN COMPONENT - MANAGE FLAGS
// ============================================================================

export const FeatureFlagsAdmin: React.FC = () => {
  const { flags, updateFeatureFlag, getFeatureConfig } = useFeatureFlags();
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);

  const allFlags = Array.from(flags.values());

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-4xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Feature Flags Management</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flag List */}
        <div className="lg:col-span-1 space-y-2 border-r border-gray-200 pr-4">
          {allFlags.map(config => (
            <button
              key={config.flag}
              onClick={() => setSelectedFlag(config.flag)}
              className={`w-full text-left px-4 py-2 rounded transition-colors ${
                selectedFlag === config.flag
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              <div className="font-semibold text-sm">{config.flag}</div>
              <div className="text-xs opacity-75">
                {config.rolloutPercentage}% · {config.enabled ? '✓' : '✗'}
              </div>
            </button>
          ))}
        </div>

        {/* Flag Details */}
        <div className="lg:col-span-2">
          {selectedFlag ? (
            <FeatureFlagDetail flag={selectedFlag} onUpdate={updateFeatureFlag} />
          ) : (
            <div className="text-center text-gray-500 py-8">
              Select a feature flag to manage
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface FeatureFlagDetailProps {
  flag: FeatureFlag;
  onUpdate: (flag: FeatureFlag, config: Partial<FeatureFlagConfig>) => Promise<void>;
}

const FeatureFlagDetail: React.FC<FeatureFlagDetailProps> = ({ flag, onUpdate }) => {
  const { getFeatureConfig } = useFeatureFlags();
  const config = getFeatureConfig(flag);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!config) {
    return <div className="text-gray-500">Feature flag not found</div>;
  }

  const handleRolloutChange = async (newPercentage: RolloutPercentage) => {
    setIsUpdating(true);
    try {
      await onUpdate(flag, { rolloutPercentage: newPercentage });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      await onUpdate(flag, { enabled: !config.enabled });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{config.flag}</h3>
        <p className="text-gray-600">{config.description}</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-700">Status</span>
          <button
            onClick={handleToggle}
            disabled={isUpdating}
            className={`px-4 py-2 rounded font-semibold transition-colors ${
              config.enabled
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-red-500 text-white hover:bg-red-600'
            } disabled:opacity-50`}
          >
            {config.enabled ? '✓ Enabled' : '✗ Disabled'}
          </button>
        </div>

        {/* Rollout Percentage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700">Rollout Percentage</span>
            <span className="text-2xl font-bold text-blue-600">{config.rolloutPercentage}%</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[0, 5, 10, 25, 50, 75, 100].map(pct => (
              <button
                key={pct}
                onClick={() => handleRolloutChange(pct as RolloutPercentage)}
                disabled={isUpdating}
                className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                  config.rolloutPercentage === pct
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } disabled:opacity-50`}
              >
                {pct}%
              </button>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${config.rolloutPercentage}%` }}
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Launched</span>
            <p className="font-semibold text-gray-900">{config.launchedDate}</p>
          </div>
          <div>
            <span className="text-gray-600">Target Rollout</span>
            <p className="font-semibold text-gray-900">{config.targetRolloutDate}</p>
          </div>
        </div>

        {/* Owner Team */}
        <div>
          <span className="text-gray-600 text-sm">Owner Team</span>
          <p className="font-semibold text-gray-900">{config.ownerTeam}</p>
        </div>

        {/* Metrics */}
        {config.metrics && Object.keys(config.metrics).length > 0 && (
          <div className="border-t border-gray-200 pt-3 mt-3">
            <h4 className="font-semibold text-gray-700 mb-2">Metrics</h4>
            <div className="space-y-1 text-sm">
              {config.metrics.pageLoadTime && (
                <p className="text-gray-600">
                  Page Load Time: <span className="font-semibold">{config.metrics.pageLoadTime}ms</span>
                </p>
              )}
              {config.metrics.errorRate !== undefined && (
                <p className="text-gray-600">
                  Error Rate: <span className="font-semibold">{config.metrics.errorRate}%</span>
                </p>
              )}
              {config.metrics.userSatisfaction && (
                <p className="text-gray-600">
                  User Satisfaction: <span className="font-semibold">{config.metrics.userSatisfaction}/5</span>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default {
  FeatureFlagsProvider,
  useFeatureFlags,
  useFeature,
  FeatureGate,
  FeatureFlagsAdmin
};
