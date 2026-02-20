/**
 * AUTH CONTEXT ENHANCEMENT
 * 
 * Fixes CRIT-006: Auth state lost on refresh
 * 
 * This file shows the KEY CHANGES needed in your existing AuthContext.tsx
 * to ensure auth state persists through page refreshes
 */

// ADD THIS TO YOUR EXISTING AuthContext.tsx
// Insert after the User interface definition

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;  // ← ADD THIS
  token: string | null;      // ← ADD THIS
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  setUser: (user: User) => void;        // ← ADD THIS
  setToken: (token: string) => void;    // ← ADD THIS
}

// KEY CHANGE 1: Enhance checkUser() to also restore user from localStorage
// REPLACE the existing checkUser() function with this version:

const checkUser = async () => {
  try {
    // FIRST: Try to restore from localStorage (fastest)
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('accessToken');

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setLoading(false);
        return; // User restored from storage
      } catch (e) {
        console.warn('Failed to parse stored user');
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
      }
    }

    // SECOND: Try Supabase session
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error checking auth session:', error);
      setLoading(false);
      return;
    }

    if (session?.user) {
      await loadUserProfile(session.user.id);
    } else {
      // Check for demo session using storageService
      const demoSession = storageService.getDemoSession();
      if (demoSession) {
        const demoUser = {
          id: demoSession.user?.id || 'demo-user',
          email: demoSession.user?.email || 'demo@example.com',
          name: demoSession.user?.user_metadata?.name || 'Demo User',
          role: demoSession.user?.user_metadata?.user_type || 'buyer',
          avatar_url: demoSession.user?.user_metadata?.avatar_url,
          kyc_status: 'verified',
          wallet_balance: 50000,
          is_verified: true,
          created_at: new Date().toISOString()
        };
        setUser(demoUser);
        // Also save to localStorage for next refresh
        localStorage.setItem('user', JSON.stringify(demoUser));
      }
    }
  } catch (error) {
    console.error('Error in checkUser:', error);
  } finally {
    setLoading(false);
  }
};

// KEY CHANGE 2: Update signIn() to save user to localStorage
// In the signIn() function, after receiving user data, ADD THIS:

// After backend authentication succeeds:
if (backendResponse.ok) {
  const { accessToken, refreshToken, user: userData } = await backendResponse.json();

  // Store tokens
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('user', JSON.stringify(userData));  // ← ADD THIS LINE

  // Set user data
  setUser({
    id: userData.id,
    email: userData.email,
    name: userData.name || userData.full_name,
    role: userData.role || 'buyer',
    avatar_url: userData.avatar_url,
    kyc_status: userData.kyc_status,
    wallet_balance: userData.wallet_balance,
    is_verified: userData.is_verified,
    created_at: userData.created_at
  });

  toast.success('Successfully signed in!');
  return { success: true };
}

// KEY CHANGE 3: Update loadUserProfile() to save user to localStorage
// After loading profile successfully, ADD THIS:

const loadUserProfile = async (userId: string) => {
  try {
    // ... existing profile loading code ...

    if (response.ok) {
      const profileData = await response.json();
      const userData = {
        id: userId,
        email: profileData.email,
        name: profileData.name || profileData.full_name,
        role: profileData.role || 'buyer',
        avatar_url: profileData.avatar_url,
        kyc_status: profileData.kyc_status,
        wallet_balance: profileData.wallet_balance,
        is_verified: profileData.is_verified,
        created_at: profileData.created_at
      };

      setUser(userData);
      
      // ← ADD THIS: Save to localStorage
      localStorage.setItem('user', JSON.stringify(userData));

      return;
    }

    // ... rest of function ...
  } catch (error) {
    // ... existing error handling ...
  }
};

// KEY CHANGE 4: Update signOut() to clear localStorage
// Make sure signOut() clears the user from localStorage:

const signOut = async () => {
  try {
    // Clear all tokens and user data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');  // ← ADD THIS LINE

    // Clear demo session using storageService
    storageService.clearDemoSession();

    // ... rest of signOut logic ...
  } catch (error) {
    console.error('Sign out error:', error);
  }
};

// KEY CHANGE 5: Add helper functions to AuthContext
// Add these at the end of the AuthProvider component:

const setUser = (userData: User | null) => {
  if (userData) {
    localStorage.setItem('user', JSON.stringify(userData));
  } else {
    localStorage.removeItem('user');
  }
  setUserState(userData);
};

const setToken = (newToken: string) => {
  localStorage.setItem('accessToken', newToken);
};

// KEY CHANGE 6: Update the context value object
// Make sure you export these new functions:

const value: AuthContextType = {
  user,
  loading,
  isAuthenticated: !!user && !!localStorage.getItem('accessToken'),  // ← ADD THIS
  token: localStorage.getItem('accessToken'),  // ← ADD THIS
  signIn,
  signUp,
  signOut,
  updateProfile,
  refreshUser,
  setUser,    // ← ADD THIS
  setToken,   // ← ADD THIS
};

return (
  <AuthContext.Provider value={value}>
    {children}
  </AuthContext.Provider>
);

/**
 * SUMMARY OF CHANGES NEEDED
 * 
 * These 6 key changes ensure auth state persists:
 * 
 * 1. ✅ checkUser() - Read user from localStorage on app startup
 * 2. ✅ signIn() - Save user to localStorage after login
 * 3. ✅ loadUserProfile() - Save user to localStorage after loading
 * 4. ✅ signOut() - Clear user from localStorage on logout
 * 5. ✅ New setUser() - Helper to manage localStorage + state
 * 6. ✅ Context value - Export new functions and computed isAuthenticated
 * 
 * RESULT: User stays logged in after page refresh ✅
 */
