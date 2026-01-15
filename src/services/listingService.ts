import { supabase } from '../config/supabaseClient';

export type ListingSource = 'subscription_quota' | 'pay_per_listing';

export interface CreateListingParams {
  productId: string;
  sellerId: string;
}

export interface CreateListingResult {
  success: boolean;
  error?: string;
  listingId?: string;
  listingFee: number;
  source: ListingSource | null;
  feeDue: boolean;
}

class ListingService {
  private detectMonetizationCategory(rawMain: string, rawSub: string): 'vehicles' | 'handmade_crafts' | 'paintings_artwork' | 'antique_items' | null {
    const main = rawMain.toLowerCase();
    const sub = rawSub.toLowerCase();

    if (/vehicle|car|bike|scooter|truck|tractor|bus|commercial|two wheeler|four wheeler/.test(main)) {
      return 'vehicles';
    }
    if (/craft|handmade/.test(main) || /craft|handmade/.test(sub)) {
      return 'handmade_crafts';
    }
    if (/painting|artwork|art/.test(main) || /painting|artwork|art/.test(sub) || /sculpture|wood/.test(main + sub)) {
      return 'paintings_artwork';
    }
    if (/antique|heritage|tribal/.test(main) || /antique|heritage|tribal/.test(sub)) {
      return 'antique_items';
    }
    return null;
  }

  private computeListingFee(category: 'vehicles' | 'handmade_crafts' | 'paintings_artwork' | 'antique_items' | null): number {
    if (category === 'vehicles') return 29;
    if (category === 'antique_items') return 19;
    // Crafts and paintings/artwork are free
    return 0;
  }

  async createMonetizedListing(params: CreateListingParams): Promise<CreateListingResult> {
    const { productId, sellerId } = params;

    try {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('main_category, category, sub_category')
        .eq('id', productId)
        .single();

      if (productError || !product) {
        return {
          success: false,
          error: 'Product not found',
          listingFee: 0,
          source: null,
          feeDue: false,
        };
      }

      const rawMain = (product as any).main_category || (product as any).category || '';
      const rawSub = (product as any).sub_category || '';

      const monetizationCategory = this.detectMonetizationCategory(String(rawMain), String(rawSub));
      const baseListingFee = this.computeListingFee(monetizationCategory);

      // Check for active subscription and available listing quota
      const nowIso = new Date().toISOString();
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('id, listing_quota, used_listings, is_active, starts_at, expires_at')
        .eq('seller_id', sellerId)
        .eq('is_active', true)
        .lte('starts_at', nowIso)
        .or('expires_at.is.null,expires_at.gte.' + nowIso)
        .order('starts_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      let listingFee = baseListingFee;
      let source: ListingSource = 'pay_per_listing';
      let subscriptionId: string | null = null;

      if (subscription && subscription.listing_quota !== null && subscription.listing_quota !== undefined) {
        const quota = Number(subscription.listing_quota) || 0;
        const used = Number(subscription.used_listings) || 0;
        if (quota > 0 && used < quota) {
          // Consume subscription quota, listing is free
          listingFee = 0;
          source = 'subscription_quota';
          subscriptionId = subscription.id as string;

          await supabase
            .from('subscriptions')
            .update({ used_listings: used + 1 })
            .eq('id', subscription.id);
        }
      }

      const { data: listingRow, error: listingError } = await supabase
        .from('listings')
        .insert([
          {
            product_id: productId,
            seller_id: sellerId,
            category: rawMain || rawSub || null,
            sub_category: rawSub || null,
            listing_fee: listingFee,
            listing_fee_paid: listingFee === 0,
            source,
            subscription_id: subscriptionId,
          },
        ])
        .select('id, listing_fee, listing_fee_paid, source')
        .single();

      if (listingError || !listingRow) {
        return {
          success: false,
          error: listingError?.message || 'Failed to create listing record',
          listingFee: listingFee,
          source,
          feeDue: listingFee > 0,
        };
      }

      return {
        success: true,
        listingId: listingRow.id as string,
        listingFee: listingFee,
        source,
        feeDue: listingFee > 0 && !listingRow.listing_fee_paid,
      };
    } catch (error: any) {
      console.error('Error creating monetized listing', error);
      return {
        success: false,
        error: error?.message || 'Unexpected error creating listing',
        listingFee: 0,
        source: null,
        feeDue: false,
      };
    }
  }
}

export const listingService = new ListingService();
