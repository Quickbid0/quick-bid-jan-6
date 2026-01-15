import { supabaseAdmin } from '../../../supabaseAdmin';

export interface SellerInfo {
  sellerId: string;
  name: string | null;
  rating: number | null;
  totalAuctions: number;
  totalItemsSold: number;
  kycStatus: string;
  location: string | null;
  joinedAt: string | null;
  avatarUrl: string | null;
}

// Simple in-memory cache per backend instance
const CACHE_TTL_MS = 5 * 60 * 1000;
const sellerCache = new Map<string, { data: SellerInfo; expiresAt: number }>();

export async function getSellerInfo(sellerId: string): Promise<SellerInfo | null> {
  if (!supabaseAdmin) {
    throw Object.assign(new Error('Supabase admin not configured'), { statusCode: 500 });
  }

  const now = Date.now();
  const cached = sellerCache.get(sellerId);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  // Load basic profile info
  const { data: profile, error: profileErr } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, city, state, country, created_at, avatar_url, kyc_status')
    .eq('id', sellerId)
    .maybeSingle();

  if (profileErr) {
    console.error('getSellerInfo: profiles select error', profileErr);
    throw Object.assign(new Error('Failed to load seller profile'), { statusCode: 500 });
  }

  if (!profile) {
    return null;
  }

  // Load metrics
  const { data: metrics, error: metricsErr } = await supabaseAdmin
    .from('seller_metrics')
    .select('total_auctions, total_sales, rating, kyc_status')
    .eq('seller_id', sellerId)
    .maybeSingle();

  if (metricsErr) {
    console.error('getSellerInfo: seller_metrics select error', metricsErr);
  }

  const info: SellerInfo = {
    sellerId,
    name: (profile as any).full_name ?? null,
    rating: metrics?.rating ?? null,
    totalAuctions: Number(metrics?.total_auctions ?? 0),
    totalItemsSold: Number(metrics?.total_sales ?? 0),
    kycStatus: (metrics?.kyc_status as string) || (profile as any).kyc_status || 'pending',
    location: [profile.city, profile.state, profile.country].filter(Boolean).join(', ') || null,
    joinedAt: profile.created_at ?? null,
    avatarUrl: profile.avatar_url ?? null,
  };

  sellerCache.set(sellerId, { data: info, expiresAt: now + CACHE_TTL_MS });
  return info;
}
