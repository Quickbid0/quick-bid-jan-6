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
      if (data?.message) message = data.message;
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

export interface SponsorPayload {
  sponsorId?: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstNumber?: string;
  packageTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  logoUrl?: string;
  agentId?: string;
}

export interface AdSlotPayload {
  slotId?: string;
  slotType:
    | 'pre_roll'
    | 'mid_roll'
    | 'post_roll'
    | 'banner_left'
    | 'banner_bottom'
    | 'banner_right'
    | 'ticker'
    | 'popup_card'
    | 'timer_extension';
  durationSec: number;
  priceModel: 'flat' | 'cpm';
  priceAmount: number;
  assignedSponsorId?: string;
  creativeUrl?: string;
  active?: boolean;
}

export const adsService = {
  async listSponsors() {
    return request<any[]>('/sponsors');
  },

  async createSponsor(payload: SponsorPayload) {
    return request<any>('/sponsors', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateSponsor(id: string, payload: Partial<SponsorPayload>) {
    return request<any>(`/sponsors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteSponsor(id: string) {
    return request<void>(`/sponsors/${id}`, { method: 'DELETE' });
  },

  async listAdSlots() {
    return request<any[]>('/adslots');
  },

  async createAdSlot(payload: AdSlotPayload) {
    return request<any>('/adslots', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateAdSlot(id: string, payload: Partial<AdSlotPayload>) {
    return request<any>(`/adslots/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteAdSlot(id: string) {
    return request<void>(`/adslots/${id}`, { method: 'DELETE' });
  },

  async listCampaigns() {
    return request<any[]>('/campaigns');
  },

  async createCampaign(payload: any) {
    return request<any>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateCampaign(id: string, payload: any) {
    return request<any>(`/campaigns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteCampaign(id: string) {
    return request<void>(`/campaigns/${id}`, { method: 'DELETE' });
  },

  async getAdsAnalyticsSummary(query: string) {
    const path = query ? `/analytics?${query}` : '/analytics';
    return request<any>(path);
  },

  async getAdsAnalyticsReport(query: string) {
    const path = query ? `/analytics/report?${query}` : '/analytics/report';
    return request<any[]>(path);
  },

  async exportAdsAnalyticsCsv(query: string) {
    const path = query ? `/analytics/export?${query}` : '/analytics/export';
    const url = `${API_BASE}${path}`;
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) {
      throw new Error(`Failed to export CSV (${res.status})`);
    }
    const blob = await res.blob();
    const href = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = 'ads-analytics.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(href);
  },

  async listInvoices(sponsorId?: string) {
    const qs = sponsorId ? `?sponsorId=${encodeURIComponent(sponsorId)}` : '';
    return request<any[]>(`/invoices${qs}`);
  },

  async createInvoice(payload: { sponsorId: string; campaignIds: string[]; dueDate: string }) {
    return request<any>('/invoices', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async markInvoicePaid(invoiceId: string) {
    return request<any>(`/invoices/${invoiceId}/pay`, {
      method: 'PATCH',
    });
  },
};
