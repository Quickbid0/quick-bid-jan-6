// Enhanced Color Palette - Gaming Excitement + Fintech Trust + SaaS Intelligence
// Combines high-energy gaming colors with trustworthy fintech blues and intelligent SaaS grays

export const colors = {
  // Primary Gaming Energy (IPL-style excitement)
  gaming: {
    primary: {
      50: '#fff7ed',   // Soft energy background
      100: '#ffedd5',  // Light gaming glow
      200: '#fed7aa',  // Warm excitement
      300: '#fdba74',  // Orange energy
      400: '#fb923c',  // Bright action
      500: '#f97316',  // Primary gaming orange
      600: '#ea580c',  // Deep orange
      700: '#c2410c',  // Rich gaming
      800: '#9a3412',  // Dark energy
      900: '#7c2d12',  // Intense gaming
    },
    electric: {
      50: '#f0f9ff',   // Electric blue background
      100: '#e0f2fe',  // Light electric
      200: '#bae6fd',  // Electric glow
      300: '#7dd3fc',  // Bright electric
      400: '#38bdf8',  // Electric blue
      500: '#0ea5e9',  // Primary electric
      600: '#0284c7',  // Deep electric
      700: '#0369a1',  // Electric trust
      800: '#075985',  // Dark electric
      900: '#0c4a6e',  // Electric intensity
    },
    neon: {
      50: '#f0fdf4',   // Neon green background
      100: '#dcfce7',  // Light neon
      200: '#bbf7d0',  // Neon glow
      300: '#86efac',  // Bright neon
      400: '#4ade80',  // Electric green
      500: '#22c55e',  // Primary neon
      600: '#16a34a',  // Deep neon
      700: '#15803d',  // Neon trust
      800: '#166534',  // Dark neon
      900: '#14532d',  // Neon intensity
    }
  },

  // Fintech Trust Foundation
  fintech: {
    primary: {
      50: '#eff6ff',   // Trust background
      100: '#dbeafe',  // Light trust
      200: '#bfdbfe',  // Trust glow
      300: '#93c5fd',  // Professional blue
      400: '#60a5fa',  // Stripe-style blue
      500: '#3b82f6',  // Primary fintech blue
      600: '#2563eb',  // Deep trust
      700: '#1d4ed8',  // Razorpay blue
      800: '#1e40af',  // Dark trust
      900: '#1e3a8a',  // Fintech intensity
    },
    slate: {
      50: '#f8fafc',   // Clean background
      100: '#f1f5f9',  // Light slate
      200: '#e2e8f0',  // Professional gray
      300: '#cbd5e1',  // SaaS gray
      400: '#94a3b8',  // Medium slate
      500: '#64748b',  // Primary slate
      600: '#475569',  // Deep slate
      700: '#334155',  // Dark slate
      800: '#1e293b',  // Very dark slate
      900: '#0f172a',  // Intense slate
    }
  },

  // SaaS Intelligence Layer
  saas: {
    primary: {
      50: '#fafafa',   // Intelligence background
      100: '#f5f5f5',  // Light intelligent
      200: '#e5e5e5',  // Smart gray
      300: '#d4d4d4',  // Notion-style gray
      400: '#a3a3a3',  // Medium intelligent
      500: '#737373',  // Primary SaaS gray
      600: '#525252',  // Deep intelligent
      700: '#404040',  // Dark intelligent
      800: '#262626',  // Very dark intelligent
      900: '#171717',  // Intense intelligent
    },
    accent: {
      50: '#fefce8',   // Smart yellow background
      100: '#fef9c3',  // Light smart
      200: '#fef08a',  // Intelligence glow
      300: '#fde047',  // Bright intelligence
      400: '#facc15',  // Shopify yellow
      500: '#eab308',  // Primary smart
      600: '#ca8a04',  // Deep smart
      700: '#a16207',  // Dark smart
      800: '#854d0e',  // Very dark smart
      900: '#713f12',  // Intense smart
    }
  },

  // Trust & Security Indicators
  trust: {
    verified: '#10b981',     // Green trust
    secured: '#3b82f6',      // Blue security
    escrow: '#f59e0b',       // Orange protection
    ai: '#8b5cf6',          // Purple intelligence
    premium: '#f97316',     // Orange premium
  },

  // Gaming States & Emotions
  gamingStates: {
    winning: '#22c55e',      // Victory green
    losing: '#ef4444',       // Tension red
    leading: '#f59e0b',      // Leadership orange
    urgent: '#dc2626',       // Emergency red
    exciting: '#f97316',     // Excitement orange
    calm: '#3b82f6',         // Trust blue
  },

  // Dynamic Gradient Palettes
  gradients: {
    gaming: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)',
    fintech: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%)',
    saas: 'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)',
    trust: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
    premium: 'linear-gradient(135deg, #f97316 0%, #f59e0b 50%, #eab308 100%)',
    electric: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)',
    neon: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
  },

  // Real-time State Colors
  realTime: {
    live: '#ef4444',         // Pulsing red for live
    active: '#22c55e',       // Green for active
    pending: '#f59e0b',      // Orange for pending
    offline: '#6b7280',      // Gray for offline
    error: '#dc2626',        // Red for error
    success: '#10b981',      // Green for success
  },

  // Bid Intensity Colors (Gaming Psychology)
  bidIntensity: {
    low: '#10b981',          // Calm green
    medium: '#f59e0b',       // Warming orange
    high: '#f97316',         // Hot orange
    extreme: '#dc2626',      // Intense red
    legendary: '#8b5cf6',    // Legendary purple
  }
};

// Utility functions for dynamic color selection
export const getGamingColor = (intensity: 'low' | 'medium' | 'high' | 'extreme' | 'legendary') => {
  return colors.bidIntensity[intensity];
};

export const getTrustColor = (type: 'verified' | 'secured' | 'escrow' | 'ai' | 'premium') => {
  return colors.trust[type];
};

export const getRealTimeColor = (state: 'live' | 'active' | 'pending' | 'offline' | 'error' | 'success') => {
  return colors.realTime[state];
};

export const getGradient = (theme: 'gaming' | 'fintech' | 'saas' | 'trust' | 'premium' | 'electric' | 'neon') => {
  return colors.gradients[theme];
};

// Emotion-based color mapping for UX psychology
export const getEmotionColor = (emotion: 'winning' | 'losing' | 'leading' | 'urgent' | 'exciting' | 'calm') => {
  return colors.gamingStates[emotion];
};

// Dynamic color based on bid activity
export const getBidActivityColor = (activity: number) => {
  if (activity < 25) return colors.bidIntensity.low;
  if (activity < 50) return colors.bidIntensity.medium;
  if (activity < 75) return colors.bidIntensity.high;
  if (activity < 90) return colors.bidIntensity.extreme;
  return colors.bidIntensity.legendary;
};

// Auction countdown color psychology
export const getCountdownColor = (secondsLeft: number) => {
  if (secondsLeft > 300) return colors.gamingStates.calm;        // >5min: calm
  if (secondsLeft > 60) return colors.gamingStates.leading;      // 1-5min: leading
  if (secondsLeft > 10) return colors.gamingStates.exciting;     // 10s-1min: exciting
  if (secondsLeft > 5) return colors.gamingStates.urgent;        // 5-10s: urgent
  return colors.gamingStates.losing;                             // <5s: losing tension
};

export default colors;
