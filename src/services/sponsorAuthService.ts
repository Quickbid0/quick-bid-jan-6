const AUTH_KEY = 'quickmela_sponsor_auth';

interface SponsorAuthState {
  token: string;
  sponsorId: string;
}

const API_BASE = import.meta.env.VITE_COMMUNITY_BACKEND_URL?.replace(/\/?$/, '') || '/api/ads';

export const sponsorAuthService = {
  saveAuth(state: SponsorAuthState) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(state));
  },

  loadAuth(): SponsorAuthState | null {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as SponsorAuthState;
    } catch {
      return null;
    }
  },

  clearAuth() {
    localStorage.removeItem(AUTH_KEY);
  },

  async requestOtp(email: string) {
    const res = await fetch(`${API_BASE}/sponsor-auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `Failed to request OTP (${res.status})`);
    }
  },

  async verifyOtp(email: string, otp: string) {
    const res = await fetch(`${API_BASE}/sponsor-auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, otp }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `Failed to verify OTP (${res.status})`);
    }
    return (await res.json()) as SponsorAuthState;
  },
};
