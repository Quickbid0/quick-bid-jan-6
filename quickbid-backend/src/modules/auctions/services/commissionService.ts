import { supabaseAdmin } from '../../../supabaseAdmin';

export interface CommissionSettings {
  id: string;
  buyer_commission_percent: number;
  seller_commission_percent: number;
  platform_flat_fee_cents: number;
  category_overrides: any | null;
}

let cachedSettings: CommissionSettings | null = null;
let cachedAt: number | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

async function fetchActiveFromDb(): Promise<CommissionSettings | null> {
  if (!supabaseAdmin) {
    console.error('commissionService: supabaseAdmin not configured');
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from('commission_settings')
    .select('id, buyer_commission_percent, seller_commission_percent, platform_flat_fee_cents, category_overrides')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('commissionService: failed to load active commission_settings', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id as string,
    buyer_commission_percent: Number(data.buyer_commission_percent ?? 10),
    seller_commission_percent: Number(data.seller_commission_percent ?? 3),
    platform_flat_fee_cents: Number(data.platform_flat_fee_cents ?? 0),
    category_overrides: data.category_overrides ?? null,
  };
}

export const commissionService = {
  async getActive(forceRefresh = false): Promise<CommissionSettings> {
    const now = Date.now();
    if (!forceRefresh && cachedSettings && cachedAt && now - cachedAt < CACHE_TTL_MS) {
      return cachedSettings;
    }

    const settings = await fetchActiveFromDb();
    if (!settings) {
      const fallback: CommissionSettings = {
        id: 'fallback',
        buyer_commission_percent: 10,
        seller_commission_percent: 3,
        platform_flat_fee_cents: 0,
        category_overrides: null,
      };
      cachedSettings = fallback;
      cachedAt = now;
      return fallback;
    }

    cachedSettings = settings;
    cachedAt = now;
    return settings;
  },

  invalidateCache() {
    cachedSettings = null;
    cachedAt = null;
  },

  async applyCommissionRules(amountCents: number, ctx?: { category?: string | null }) {
    const settings = await this.getActive();
    const base = amountCents;

    // TODO: category_overrides support using ctx.category
    const buyerCommissionCents = Math.round(
      base * (settings.buyer_commission_percent / 100),
    );
    const sellerCommissionCents = Math.round(
      base * (settings.seller_commission_percent / 100),
    );
    const platformFlatCents = settings.platform_flat_fee_cents || 0;

    const totalCommissionCents = buyerCommissionCents + sellerCommissionCents + platformFlatCents;
    const netToSellerCents = base - sellerCommissionCents - platformFlatCents;

    return {
      buyerCommissionCents,
      sellerCommissionCents,
      platformFlatCents,
      totalCommissionCents,
      netToSellerCents,
    };
  },
};
