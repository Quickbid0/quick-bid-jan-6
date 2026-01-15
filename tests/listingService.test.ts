import { listingService } from '../src/services/listingService';
import { supabase } from '../src/config/supabaseClient';

jest.mock('../src/config/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockedFrom = supabase.from as jest.Mock;

describe('listingService.createMonetizedListing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('charges ₹29 listing fee for vehicles with no active subscription', async () => {
    const productId = 'prod-vehicle-1';
    const sellerId = 'seller-1';

    // products query
    const productsQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { main_category: 'Vehicles', sub_category: 'Car' },
        error: null,
      }),
    };

    // subscriptions query: no active subscription
    const subsQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    };

    // listings insert
    const listingsQuery = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: 'listing-1',
          listing_fee: 29,
          listing_fee_paid: false,
          source: 'pay_per_listing',
        },
        error: null,
      }),
    };

    mockedFrom.mockImplementation((table: string) => {
      if (table === 'products') return productsQuery as any;
      if (table === 'subscriptions') return subsQuery as any;
      if (table === 'listings') return listingsQuery as any;
      throw new Error(`Unexpected table ${table}`);
    });

    const result = await listingService.createMonetizedListing({ productId, sellerId });

    expect(result.success).toBe(true);
    expect(result.listingFee).toBe(29);
    expect(result.source).toBe('pay_per_listing');
    expect(result.feeDue).toBe(true);
  });

  it('consumes subscription quota and sets listing fee to 0 when quota is available', async () => {
    const productId = 'prod-vehicle-2';
    const sellerId = 'seller-2';

    const updateMock = jest.fn().mockReturnThis();

    const productsQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { main_category: 'Vehicles', sub_category: 'Bike' },
        error: null,
      }),
    };

    const subsQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: {
          id: 'sub-1',
          listing_quota: 10,
          used_listings: 3,
          is_active: true,
        },
        error: null,
      }),
      update: updateMock,
    };

    const listingsQuery = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: 'listing-2',
          listing_fee: 0,
          listing_fee_paid: true,
          source: 'subscription_quota',
        },
        error: null,
      }),
    };

    mockedFrom.mockImplementation((table: string) => {
      if (table === 'products') return productsQuery as any;
      if (table === 'subscriptions') return subsQuery as any;
      if (table === 'listings') return listingsQuery as any;
      throw new Error(`Unexpected table ${table}`);
    });

    const result = await listingService.createMonetizedListing({ productId, sellerId });

    expect(result.success).toBe(true);
    expect(result.listingFee).toBe(0);
    expect(result.source).toBe('subscription_quota');
    expect(result.feeDue).toBe(false);
  });
});
