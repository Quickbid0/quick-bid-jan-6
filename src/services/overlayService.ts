const API_BASE = import.meta.env.VITE_COMMUNITY_BACKEND_URL || '/api/ads';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    ...options,
  });
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const data = await res.json();
      if ((data as any)?.message) message = (data as any).message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  if (res.status === 204) {
    return undefined as unknown as T;
  }
  return (await res.json()) as T;
}

export interface OverlaySlotConfig {
  slotType: 'banner_left' | 'banner_right' | 'banner_bottom' | 'popup_card' | 'ticker';
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  visible: boolean;
  style?: {
    opacity?: number;
    borderRadius?: number;
  };
}

export interface OverlayPreset {
  _id: string;
  presetId: string;
  name: string;
  description?: string;
  layout: OverlaySlotConfig[];
  eventIds: string[];
}

export const overlayService = {
  listPresets() {
    return request<OverlayPreset[]>('/overlays');
  },

  createPreset(payload: { presetId: string; name: string; description?: string }) {
    return request<OverlayPreset>('/overlays', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updatePreset(id: string, payload: Partial<OverlayPreset>) {
    return request<OverlayPreset>(`/overlays/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deletePreset(id: string) {
    return request<void>(`/overlays/${id}`, { method: 'DELETE' });
  },
};
