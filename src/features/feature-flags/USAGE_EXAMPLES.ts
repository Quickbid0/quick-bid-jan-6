/**
 * FEATURE FLAG INTEGRATION EXAMPLES
 * 
 * Shows how to use feature flags in your application
 */

// ============================================================================
// 1. SETUP IN APP.tsx
// ============================================================================

import React from 'react';
import { FeatureFlagsProvider } from '@/features/feature-flags/FeatureFlagSystem';

export function App(): React.ReactElement {
  return (
    <FeatureFlagsProvider
      onFlagChange={(flag: string, config: any) => {
        // Optional: Sync to backend when flags change
        console.log(`Flag changed: ${flag}`, config);
        
        // In production, would call:
        // fetch(`/api/admin/feature-flags/${flag}`, {
        //   method: 'PUT',
        //   body: JSON.stringify(config),
        //   headers: { 'Authorization': `Bearer ${token}` }
        // });
      }}
    >
      {/* Rest of app */}
    </FeatureFlagsProvider>
  );
}

// ============================================================================
// 2. USING FEATURE GATES IN ROUTES
// ============================================================================

import { FeatureGate, useFeature } from '@/features/feature-flags/FeatureFlagSystem';
// Note: Import page components from actual locations

export function BuyerDashboardRoute(): React.ReactElement {
  const isV2Enabled = useFeature('dashboard_buyer_v2');

  return (
    <FeatureGate
      flag="dashboard_buyer_v2"
      fallback={<div>Loading old dashboard...</div>}
    >
      <div>Loading new dashboard...</div>
    </FeatureGate>
  );
}

// Alternative: Simple conditional
export function BuyerDashboardRouteSimple() {
  const isV2Enabled = useFeature('dashboard_buyer_v2');

  return isV2Enabled ? (
    <BuyerDashboardRedesigned />
  ) : (
    <BuyerDashboard />
  );
}

// ============================================================================
// 3. SELLER DASHBOARD ROUTING
// ============================================================================

export function SellerDashboardRoute() {
  return (
    <FeatureGate
      flag="dashboard_seller_v2"
      fallback={<SellerDashboard />}
    >
      <SellerDashboardRedesigned />
    </FeatureGate>
  );
}

// ============================================================================
// 4. DEALER DASHBOARD ROUTING
// ============================================================================

export function DealerDashboardRoute() {
  return (
    <FeatureGate
      flag="dashboard_dealer_v2"
      fallback={<DealerDashboard />}
    >
      <DealerDashboardRedesigned />
    </FeatureGate>
  );
}

// ============================================================================
// 5. ADMIN DASHBOARD ROUTING
// ============================================================================

export function AdminDashboardRoute() {
  return (
    <FeatureGate
      flag="dashboard_admin_v2"
      fallback={<AdminDashboard />}
    >
      <AdminDashboardRedesigned />
    </FeatureGate>
  );
}

// ============================================================================
// 6. FEATURE-SPECIFIC COMPONENTS - AI RECOMMENDATIONS
// ============================================================================

export function BuyerDashboardWithRecommendations() {
  const recommendations = (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">For You</h2>
      <p className="text-gray-600 text-sm">AI-powered recommendations</p>
      {/* AI recommendations cards */}
    </div>
  );

  return (
    <FeatureGate
      flag="ai_recommendations"
      fallback={null}  // Don't show if not enabled
    >
      {recommendations}
    </FeatureGate>
  );
}

// ============================================================================
// 7. ADMIN PAGE - MANAGE FEATURE FLAGS
// ============================================================================

import { FeatureFlagsAdmin } from '@/features/feature-flags/FeatureFlagSystem';

export function AdminFeatureFlagsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Control Panel</h1>
        
        <div className="tabs mb-8">
          <div className="tab-content">
            <FeatureFlagsAdmin />
          </div>
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">Rollout Strategy</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Week 1: 5% rollout to catch bugs</li>
            <li>• Week 2: 25% rollout for broader testing</li>
            <li>• Week 3: 50% rollout to half users</li>
            <li>• Week 4: 100% full rollout</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 8. ROUTE CONFIGURATION EXAMPLE
// ============================================================================

/*
In your routes/router.ts or App.tsx, configure like this:

const routes = [
  {
    path: '/buyer/dashboard',
    element: <ProtectedRoute><BuyerDashboardRoute /></ProtectedRoute>
  },
  {
    path: '/seller/dashboard',
    element: <ProtectedRoute><SellerDashboardRoute /></ProtectedRoute>
  },
  {
    path: '/dealer/dashboard',
    element: <ProtectedRoute><DealerDashboardRoute /></ProtectedRoute>
  },
  {
    path: '/admin/dashboard',
    element: <AdminRoute><AdminDashboardRoute /></AdminRoute>
  },
  {
    path: '/admin/feature-flags',
    element: <AdminRoute><AdminFeatureFlagsPage /></AdminRoute>
  }
];
*/

// ============================================================================
// 9. TRACKING FEATURE USAGE
// ============================================================================

import { useFeatureFlags } from '@/features/feature-flags/FeatureFlagSystem';
import { useEffect } from 'react';

export function BuyerDashboardWithTracking() {
  const { trackFeatureUsage } = useFeatureFlags();
  const userId = localStorage.getItem('userId') || '';

  useEffect(() => {
    // Track when buyer views the new dashboard
    trackFeatureUsage('dashboard_buyer_v2', userId, {
      entry_point: 'sidebar',
      device: 'desktop'
    });
  }, [userId, trackFeatureUsage]);

  return <BuyerDashboardRedesigned />;
}

// ============================================================================
// 10. CONDITIONAL FEATURES WITHIN DASHBOARD
// ============================================================================

export function ComponentWithConditionalFeatures() {
  const aiRecommendationsEnabled = useFeature('ai_recommendations');
  const advancedAnalyticsEnabled = useFeature('advanced_analytics');

  return (
    <div>
      {/* Always show */}
      <div>Core Dashboard Content</div>

      {/* Conditional based on feature flags */}
      {aiRecommendationsEnabled && (
        <div>
          <h2>AI Recommendations Section</h2>
          {/* AI content */}
        </div>
      )}

      {advancedAnalyticsEnabled && (
        <div>
          <h2>Advanced Analytics Section</h2>
          {/* Analytics content */}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 11. TESTING - MOCK FEATURE FLAGS
// ============================================================================

/**
 * For testing, you can override feature flags:
 * 
 * const mockFlags = {
 *   dashboard_buyer_v2: {
 *     flag: 'dashboard_buyer_v2',
 *     enabled: true,
 *     rolloutPercentage: 100, // Always on for testing
 *     ...
 *   }
 * };
 * 
 * <FeatureFlagsProvider initialFlags={mockFlags}>
 *   <TestComponent />
 * </FeatureFlagsProvider>
 */

// ============================================================================
// 12. MIGRATION HELPER - CHECK IF USER HAS FLAG
// ============================================================================

import { useFeatureFlags } from '@/features/feature-flags/FeatureFlagSystem';

export function DashboardRouter() {
  const { isFeatureEnabled } = useFeatureFlags();
  const userId = localStorage.getItem('userId') || '';

  const buyerHasV2 = isFeatureEnabled('dashboard_buyer_v2', userId);
  const sellerHasV2 = isFeatureEnabled('dashboard_seller_v2', userId);
  const dealerHasV2 = isFeatureEnabled('dashboard_dealer_v2', userId);

  console.log('User feature status:', {
    userId,
    buyerHasV2,
    sellerHasV2,
    dealerHasV2
  });

  return (
    <div>
      {buyerHasV2 ? <BuyerDashboardRedesigned /> : <BuyerDashboard />}
      {sellerHasV2 ? <SellerDashboardRedesigned /> : <SellerDashboard />}
      {dealerHasV2 ? <DealerDashboardRedesigned /> : <DealerDashboard />}
    </div>
  );
}

// ============================================================================
// 13. BACKEND SYNC (Optional)
// ============================================================================

/*
To sync flags with your backend, update FeatureFlagSystem.tsx updateFeatureFlag:

const updateFeatureFlag = async (
  flag: FeatureFlag,
  updatedConfig: Partial<FeatureFlagConfig>
): Promise<void> => {
  const existing = flags.get(flag);
  if (!existing) {
    throw new Error(`Feature flag ${flag} not found`);
  }

  const newConfig = { ...existing, ...updatedConfig };
  
  // Update local state first (optimistic update)
  setFlags(new Map(flags).set(flag, newConfig));

  // Sync to backend
  try {
    const response = await fetch(`/api/admin/feature-flags/${flag}`, {
      method: 'PUT',
      body: JSON.stringify(newConfig),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      // Rollback on error
      setFlags(new Map(flags).set(flag, existing));
      throw new Error('Failed to update feature flag');
    }

    onFlagChange?.(flag, newConfig);
  } catch (error) {
    console.error('Failed to sync feature flag:', error);
    // Rollback local change
    setFlags(new Map(flags).set(flag, existing));
    throw error;
  }
};
*/

export default {
  BuyerDashboardRoute,
  SellerDashboardRoute,
  DealerDashboardRoute,
  AdminDashboardRoute,
  BuyerDashboardWithRecommendations,
  AdminFeatureFlagsPage,
  DashboardRouter
};
