import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../../supabaseAdmin';
import { PixelEventModel } from '../../marketing/models/pixelEvent.model';

export const auctionsBrowseRouter = express.Router();

function mapAuctionStatus(dbStatus: string | null | undefined, startDate?: string | null, endDate?: string | null, winnerId?: string | null, finalPrice?: number | null) {
  const s = (dbStatus || '').toLowerCase();
  const now = new Date();
  const startsAt = startDate ? new Date(startDate) : null;
  const endsAt = endDate ? new Date(endDate) : null;
  if (s === 'live' || s === 'active') {
    if (endsAt && endsAt > now) return 'live';
    if (endsAt && endsAt <= now) return winnerId ? 'sold' : 'expired';
    return 'live';
  }
  if (s === 'scheduled' || (startsAt && startsAt > now)) return 'upcoming';
  if (s === 'ended') return winnerId || (finalPrice != null && finalPrice > 0) ? 'sold' : 'expired';
  return 'upcoming';
}

auctionsBrowseRouter.get('/auctions/detail', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Supabase admin not configured' });
    }
    const { product_id } = req.query as Record<string, string>;
    if (!product_id) {
      return res.status(400).json({ error: 'product_id is required' });
    }

    const { data: product, error: productErr } = await supabaseAdmin
      .from('products')
      .select(`*, seller:profiles(*)`)
      .eq('id', product_id)
      .maybeSingle();
    if (productErr) {
      return res.status(500).json({ error: 'Failed to load product' });
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let auction: any = null;
    const { data: activeAuction } = await supabaseAdmin
      .from('auctions')
      .select('id, status, start_date, end_date, current_price, reserve_price, winner_id, final_price')
      .eq('product_id', product_id)
      .in('status', ['active', 'live'])
      .order('end_date', { ascending: true })
      .maybeSingle();
    if (activeAuction) {
      auction = activeAuction;
    } else {
      const { data: latestAuction } = await supabaseAdmin
        .from('auctions')
        .select('id, status, start_date, end_date, current_price, reserve_price, winner_id, final_price')
        .eq('product_id', product_id)
        .order('end_date', { ascending: false })
        .maybeSingle();
      auction = latestAuction || null;
    }

    let watchersCount = 0;
    const { data: wishRows } = await supabaseAdmin
      .from('wishlist')
      .select('product_id')
      .eq('product_id', product_id);
    if (Array.isArray(wishRows)) {
      watchersCount = wishRows.length;
    }

    let bidCount = 0;
    let bids: any[] = [];
    if (auction?.id) {
      const { data: bidRows } = await supabaseAdmin
        .from('bids')
        .select(`
          *,
          user:profiles(id, name, avatar_url)
        `)
        .eq('auction_id', auction.id)
        .order('amount', { ascending: false });
      bids = Array.isArray(bidRows) ? bidRows : [];
      bidCount = bids.length;
    }

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twentyFourHoursAgoIso = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    let viewerCount = 0;
    try {
      viewerCount = await PixelEventModel.countDocuments({
        event: 'auction_view',
        ts: { $gte: oneHourAgo },
        'metadata.product_id': product_id,
      });
    } catch (viewErr) {
      console.error('detail: viewerCount error', viewErr);
    }

    let recentActivityCount = 0;
    if (auction?.id) {
      try {
        const { count: recentBidsCount, error: recentErr } = await supabaseAdmin
          .from('bids')
          .select('id', { count: 'exact', head: true })
          .eq('auction_id', auction.id)
          .gte('created_at', twentyFourHoursAgoIso);
        if (!recentErr && typeof recentBidsCount === 'number') {
          recentActivityCount = recentBidsCount;
        }
      } catch (actErr) {
        console.error('detail: recentActivityCount error', actErr);
      }
    }

    const auctionStatus = auction
      ? mapAuctionStatus(auction.status, auction.start_date, auction.end_date, auction.winner_id, auction.final_price)
      : 'upcoming';

    const imageUrls = Array.isArray(product?.image_urls) && product.image_urls.length > 0
      ? product.image_urls
      : (product?.image_url ? [product.image_url] : []);
    const tags = Array.isArray(product?.tags) ? product.tags : [];
    const features = Array.isArray(product?.features) ? product.features : [];
    const sellerSummary = product?.seller ? {
      id: product.seller.id,
      name: product.seller.name,
      verified: Boolean(product.seller.verified),
      rating: product.seller.rating ?? null,
      total_sales: product.seller.total_sales ?? null,
      avatar_url: product.seller.avatar_url ?? null,
    } : null;

    return res.json({
      product: {
        ...product,
        image_urls: imageUrls,
        tags,
        features,
      },
      seller: product.seller || null,
      seller_summary: sellerSummary,
      auction_id: auction?.id || null,
      auction_status: auctionStatus,
      current_price: auction?.current_price ?? null,
      reserve_price: auction?.reserve_price ?? (product?.reserve_price ?? null),
      end_time: auction?.end_date ?? null,
      watchers_count: watchersCount,
      bid_count: bidCount,
      bids,
      viewer_count: viewerCount,
      recent_activity_count: recentActivityCount,
    });
  } catch (err) {
    next(err);
  }
});

auctionsBrowseRouter.get('/auctions/browse', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Supabase admin not configured' });
    }

    const {
      category,
      auction_type,
      status,
      product_id,
      price_min,
      price_max,
      location_query,
      brand,
      sort_by,
      show_trending,
      show_premium,
      show_featured,
      page = '1',
      page_size = '20',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(parseInt(page || '1', 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(page_size || '20', 10) || 20, 1), 100);
    const offset = (pageNum - 1) * limit;

    let query = supabaseAdmin
      .from('auctions')
      .select('id, product_id, status, start_date, end_date, current_price, reserve_price, winner_id, final_price, seller_id', { count: 'exact' })
      .order('end_date', { ascending: true })
      .range(offset, offset + limit - 1);

    if (product_id) {
      query = query.eq('product_id', product_id);
    }
    if (status === 'live') {
      query = query.in('status', ['live', 'active']);
    } else if (status === 'upcoming') {
      query = query.in('status', ['scheduled']);
    } else if (status === 'ended') {
      query = query.eq('status', 'ended');
    }
    const minPrice = price_min ? Number(price_min) : undefined;
    const maxPrice = price_max ? Number(price_max) : undefined;
    if (typeof minPrice === 'number' && !Number.isNaN(minPrice)) {
      query = query.gte('current_price', minPrice);
    }
    if (typeof maxPrice === 'number' && !Number.isNaN(maxPrice)) {
      query = query.lte('current_price', maxPrice);
    }

    const { data: auctions, error: auctionsErr, count } = await query;
    if (auctionsErr) {
      return res.status(500).json({ error: 'Failed to load auctions' });
    }

    const auctionIds = (auctions || []).map((a: any) => a.id as string);
    const productIds = (auctions || []).map((a: any) => a.product_id).filter(Boolean);
    let productsMap: Record<string, any> = {};
    if (productIds.length > 0) {
      let productsQuery = supabaseAdmin
        .from('products')
        .select('id, title, image_url, category, auction_type, reserve_price, location, make, is_trending, is_premium, is_featured');
      productsQuery = productsQuery.in('id', productIds);
      const { data: products, error: productsErr } = await productsQuery;
      if (productsErr) {
        return res.status(500).json({ error: 'Failed to load products' });
      }
      productsMap = (products || []).reduce((acc: Record<string, any>, p: any) => {
        acc[p.id as string] = p;
        return acc;
      }, {});
    }

    // Aggregate bid counts per auction for current page
    const bidCounts: Record<string, number> = {};
    if (auctionIds.length > 0) {
      const { data: bids, error: bidsErr } = await supabaseAdmin
        .from('bids')
        .select('auction_id')
        .in('auction_id', auctionIds)
        .eq('status', 'active');
      if (!bidsErr && Array.isArray(bids)) {
        for (const row of bids as any[]) {
          const id = row.auction_id as string;
          bidCounts[id] = (bidCounts[id] || 0) + 1;
        }
      }
    }

    // Aggregate watchers per product for current page
    const watchersCounts: Record<string, number> = {};
    if (productIds.length > 0) {
      const { data: wishRows, error: wishErr } = await supabaseAdmin
        .from('wishlist')
        .select('product_id')
        .in('product_id', productIds);
      if (!wishErr && Array.isArray(wishRows)) {
        for (const row of wishRows as any[]) {
          const pid = row.product_id as string;
          watchersCounts[pid] = (watchersCounts[pid] || 0) + 1;
        }
      }
    }

    let items = (auctions || []).map((a: any) => {
      const p = productsMap[a.product_id as string] || {};
      const mappedStatus = mapAuctionStatus(a.status, a.start_date, a.end_date, a.winner_id, a.final_price);
      return {
        product_id: a.product_id as string,
        auction_id: a.id as string,
        title: p.title || '',
        images: p.image_url ? [p.image_url] : [],
        category: p.category || null,
        auction_type: p.auction_type || null,
        auction_status: mappedStatus,
        current_price: a.current_price != null ? Number(a.current_price) : null,
        reserve_price: a.reserve_price != null ? Number(a.reserve_price) : (p.reserve_price != null ? Number(p.reserve_price) : null),
        bid_count: bidCounts[a.id as string] || 0,
        end_time: a.end_date || null,
        seller_type: 'company',
        location: p.location || null,
        watchers_count: watchersCounts[a.product_id as string] || 0,
        make: p.make || null,
        is_trending: p.is_trending || false,
        is_premium: p.is_premium || false,
        is_featured: p.is_featured || false,
      };
    });

    if (category && category !== 'all') {
      items = items.filter((it) => it.category === category);
    }
    if (auction_type && auction_type !== 'all') {
      items = items.filter((it) => it.auction_type === auction_type);
    }
    if (brand) {
      const b = String(brand).toLowerCase();
      items = items.filter((it) => typeof it.make === 'string' && String(it.make).toLowerCase() === b);
    }
    if (location_query) {
      const q = String(location_query).toLowerCase();
      items = items.filter((it) => typeof it.location === 'string' && String(it.location).toLowerCase().includes(q));
    }
    const wantTrending = show_trending === 'true';
    const wantPremium = show_premium === 'true';
    const wantFeatured = show_featured === 'true';
    if (wantTrending) items = items.filter((it) => Boolean(it.is_trending));
    if (wantPremium) items = items.filter((it) => Boolean(it.is_premium));
    if (wantFeatured) items = items.filter((it) => Boolean(it.is_featured));

    if (sort_by === 'newest') {
      items = items.sort((a, b) => String(b.end_time || '').localeCompare(String(a.end_time || '')));
    } else if (sort_by === 'most_bids') {
      items = items.sort((a, b) => (b.bid_count || 0) - (a.bid_count || 0));
    } else {
      // ending_soon default
      items = items.sort((a, b) => String(a.end_time || '').localeCompare(String(b.end_time || '')));
    }

    return res.json({
      items,
      total: typeof count === 'number' ? count : items.length,
      page: pageNum,
      page_size: limit,
    });
  } catch (err) {
    next(err);
  }
});
