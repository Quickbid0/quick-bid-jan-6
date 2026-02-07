// Centralized Storage Service - Replaces localStorage hell
import { UnifiedUser } from '../context/UnifiedAuthContext';

// Demo user credentials for validation - these should match DemoLogin.tsx
const VALID_DEMO_USERS = [
  { id: 'buyer-demo-1', email: 'buyer@demo.com', role: 'buyer', user_type: 'buyer' },
  { id: 'seller-demo-1', email: 'seller@demo.com', role: 'seller', user_type: 'seller' },
  { id: 'admin-demo-1', email: 'admin@demo.com', role: 'admin', user_type: 'admin' },
  // Add more demo users as needed
];

export interface StorageService {
  // Auth storage
  getAuthUser(): UnifiedUser | null;
  setAuthUser(user: UnifiedUser | null): void;
  clearAuth(): void;
  
  // Demo session storage
  getDemoSession(): any | null;
  setDemoSession(session: any): void;
  clearDemoSession(): void;
  
  // User preferences
  getUserPreferences(): any;
  setUserPreferences(prefs: any): void;
  
  // Temporary data (drafts, etc)
  getTempData(key: string): any;
  setTempData(key: string, data: any): void;
  clearTempData(key: string): void;
}

class LocalStorageService implements StorageService {
  private readonly AUTH_KEY = 'qm-auth-user';
  private readonly DEMO_KEY = 'qm-demo-session';
  private readonly PREFS_KEY = 'qm-user-prefs';
  private readonly TEMP_PREFIX = 'qm-temp-';

  // Validate demo session against known demo users
  private validateDemoSession(session: any): boolean {
    if (!session || session.mode !== 'demo') return false;
    if (!session.user || !session.user.email) return false;

    // Check if the session user matches a valid demo user
    const validUser = VALID_DEMO_USERS.find(user => user.email === session.user.email);
    if (!validUser) return false;

    // Verify that the role in session matches the expected role
    const sessionRole = session.user?.user_metadata?.user_type || session.user?.role;
    return sessionRole === validUser.role;
  }

  getAuthUser(): UnifiedUser | null {
    try {
      const raw = localStorage.getItem(this.AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  setAuthUser(user: UnifiedUser | null): void {
    try {
      if (user) {
        localStorage.setItem(this.AUTH_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.AUTH_KEY);
      }
    } catch (error) {
      console.warn('Failed to store auth user:', error);
    }
  }

  clearAuth(): void {
    localStorage.removeItem(this.AUTH_KEY);
    localStorage.removeItem(this.DEMO_KEY);
  }

  getDemoSession(): any | null {
    try {
      const raw = localStorage.getItem(this.DEMO_KEY);
      if (!raw) return null;

      const session = JSON.parse(raw);

      // Validate the demo session
      if (!this.validateDemoSession(session)) {
        console.warn('🔐 SECURITY: Invalid demo session detected, clearing');
        this.clearDemoSession();
        return null;
      }

      return session;
    } catch {
      this.clearDemoSession();
      return null;
    }
  }

  setDemoSession(session: any): void {
    try {
      // Validate before storing
      if (!this.validateDemoSession(session)) {
        console.error('🔐 SECURITY: Attempted to set invalid demo session');
        return;
      }

      localStorage.setItem(this.DEMO_KEY, JSON.stringify(session));
    } catch (error) {
      console.warn('Failed to store demo session:', error);
    }
  }

  clearDemoSession(): void {
    localStorage.removeItem(this.DEMO_KEY);
  }

  getUserPreferences(): any {
    try {
      const raw = localStorage.getItem(this.PREFS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  setUserPreferences(prefs: any): void {
    try {
      localStorage.setItem(this.PREFS_KEY, JSON.stringify(prefs));
    } catch (error) {
      console.warn('Failed to store user preferences:', error);
    }
  }

  getTempData(key: string): any {
    try {
      const raw = localStorage.getItem(`${this.TEMP_PREFIX}${key}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  setTempData(key: string, data: any): void {
    try {
      localStorage.setItem(`${this.TEMP_PREFIX}${key}`, JSON.stringify(data));
    } catch (error) {
      console.warn(`Failed to store temp data for ${key}:`, error);
    }
  }

  clearTempData(key: string): void {
    localStorage.removeItem(`${this.TEMP_PREFIX}${key}`);
  }
}

// Export singleton instance
export const storageService = new LocalStorageService();
export default storageService;
