// Feature flags for QuickBid - PRODUCTION MODE
export const FEATURE_FLAGS = {
  // Authentication mode - SET TO REAL FOR PRODUCTION
  AUTH_MODE: (import.meta.env.VITE_AUTH_MODE || 'real') as 'demo' | 'real' | 'hybrid',
  
  // Legacy flags - DISABLE DEMO FOR PRODUCTION
  ENABLE_REAL_AUTH: import.meta.env.VITE_ENABLE_REAL_AUTH !== 'false', // Real auth enabled by default
  ENABLE_DEMO_AUTH: import.meta.env.VITE_ENABLE_DEMO_AUTH === 'true', // Demo disabled by default
  
  // Feature toggles - ALL ENABLED FOR PRODUCTION
  ENABLE_AI_FEATURES: import.meta.env.VITE_ENABLE_AI_FEATURES !== 'false', // AI features enabled
  ENABLE_MONITORING: import.meta.env.VITE_ENABLE_MONITORING !== 'false', // Monitoring enabled
  ENABLE_BUSINESS_SOLUTIONS: import.meta.env.VITE_ENABLE_BUSINESS_SOLUTIONS !== 'false', // Business solutions enabled
  
  // Development flags - DISABLED FOR PRODUCTION
  DEBUG_AUTH: import.meta.env.VITE_DEBUG_AUTH === 'true', // Auth debugging disabled
  DEBUG_API: import.meta.env.VITE_DEBUG_API === 'true', // API debugging disabled
  DEBUG_PERFORMANCE: import.meta.env.VITE_DEBUG_PERFORMANCE === 'true', // Performance debugging disabled
} as const;

// Helper functions for AUTH_MODE
export const getAuthMode = (): 'demo' | 'real' | 'hybrid' => {
  return FEATURE_FLAGS.AUTH_MODE;
};

export const isDemoMode = (): boolean => {
  return getAuthMode() === 'demo';
};

export const isRealMode = (): boolean => {
  return getAuthMode() === 'real';
};

export const isHybridMode = (): boolean => {
  return getAuthMode() === 'hybrid';
};

// Helper functions for auth availability - PRODUCTION MODE
export const isDemoAuthAvailable = (): boolean => {
  const mode = getAuthMode();
  return mode === 'demo'; // Only available in demo mode
};

export const isRealAuthAvailable = (): boolean => {
  const mode = getAuthMode();
  return mode === 'real' || mode === 'hybrid'; // Available in real and hybrid modes
};

// Legacy helper functions - PRODUCTION CONFIGURATION
export const isRealAuthEnabled = () => FEATURE_FLAGS.ENABLE_REAL_AUTH && isRealAuthAvailable();
export const isDemoAuthEnabled = () => FEATURE_FLAGS.ENABLE_DEMO_AUTH && isDemoAuthAvailable();
export const isAIEnabled = () => FEATURE_FLAGS.ENABLE_AI_FEATURES;
export const isMonitoringEnabled = () => FEATURE_FLAGS.ENABLE_MONITORING;
export const isBusinessSolutionsEnabled = () => FEATURE_FLAGS.ENABLE_BUSINESS_SOLUTIONS;

// Development helpers - DISABLED IN PRODUCTION
export const isAuthDebugMode = () => FEATURE_FLAGS.DEBUG_AUTH;
export const isAPIDebugMode = () => FEATURE_FLAGS.DEBUG_API;
export const isPerformanceDebugMode = () => FEATURE_FLAGS.DEBUG_PERFORMANCE;

// Auth mode validation
export const validateAuthMode = (mode: string): boolean => {
  return ['demo', 'real', 'hybrid'].includes(mode);
};

// Get available auth options for current mode
export const getAvailableAuthOptions = (): ('demo' | 'real')[] => {
  const mode = getAuthMode();
  const options: ('demo' | 'real')[] = [];
  
  if (isDemoAuthAvailable()) {
    options.push('demo');
  }
  
  if (isRealAuthAvailable()) {
    options.push('real');
  }
  
  return options;
};
