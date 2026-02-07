// 🔒 SAFE SESSION HOOK - DEFENSIVE GUARD
// src/hooks/useSafeSession.ts

import { useSession } from '../context/SessionContext';

interface SafeSessionResult {
  user: any;
  loading: boolean;
  error: boolean;
}

/**
 * Safe hook to use session without crashing when provider is not available
 * This prevents white-screen crashes in edge cases where SessionProvider is not available
 */
export function useSafeSession(): SafeSessionResult {
  try {
    const sessionData = useSession();
    return {
      user: sessionData?.user || null,
      loading: sessionData?.loading || false,
      error: false
    };
  } catch (error) {
    console.warn('SessionProvider not available, returning safe defaults:', error);
    return {
      user: null,
      loading: false,
      error: true
    };
  }
}

export default useSafeSession;
