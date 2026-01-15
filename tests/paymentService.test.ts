import { paymentService } from '../src/services/paymentService';
import { supabase } from '../src/config/supabaseClient';

jest.mock('../src/config/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock('../src/services/feeService', () => ({
  feeService: {
    getActiveRule: jest.fn().mockResolvedValue(null),
    calculateComponents: jest.fn(),
    recordApplication: jest.fn(),
  },
}));

const mockedFrom = supabase.from as jest.Mock;

describe('paymentService.processCommission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('applies flat commission rule from QuickMela commissions table', async () => {
    const sellerId = 'seller-flat';
    const amount = 100000; // sale price
    const auctionId = 'auction-1';

    const auctionsQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { product_id: 'prod-1' }, error: null }),
    };

    const productsQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { main_category: 'Vehicles', sub_category: 'Car' },
        error: null,
      }),
    };

    const commissionsQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: {
          id: 'rule-flat-car',
          mode: 'flat',
          commission_flat: 1499,
          commission_percent: null,
          min_commission: null,
        },
        error: null,
      }),
    };

    const payoutsQuery = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: 'payout-1' },
        error: null,
      }),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    };

    const walletsQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: 'wallet-1', balance: 0 },
        error: null,
      }),
      update: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
    };

    const walletTxInsert = {
      insert: jest.fn().mockReturnThis(),
    };

    mockedFrom.mockImplementation((table: string) => {
      if (table === 'auctions') return auctionsQuery as any;
      if (table === 'products') return productsQuery as any;
      if (table === 'commissions') return commissionsQuery as any;
      if (table === 'payouts') return payoutsQuery as any;
      if (table === 'wallets') return walletsQuery as any;
      if (table === 'wallet_transactions') return walletTxInsert as any;
      throw new Error(`Unexpected table ${table}`);
    });

    const ok = await paymentService.processCommission(sellerId, amount, auctionId);

    expect(ok).toBe(true);
    // Commission 1499, net payout = amount - 1499
    const expectedNet = amount - 1499;
    expect(payoutsQuery.insert).toHaveBeenCalled();
    const inserted = (payoutsQuery.insert.mock.calls[0][0] as any[])[0];
    expect(inserted.commission_amount).toBe(1499);
    expect(inserted.net_payout).toBe(expectedNet);
  });

  it('falls back to default percentage commission when no rule is found', async () => {
    const sellerId = 'seller-default';
    const amount = 50000;
    const auctionId = 'auction-2';

    const auctionsQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { product_id: 'prod-2' }, error: null }),
    };

    const productsQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { main_category: 'Other', sub_category: 'Misc' },
        error: null,
      }),
    };

    const commissionsQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    };

    const payoutsQuery = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: 'payout-2' },
        error: null,
      }),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    };

    const walletsQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: 'wallet-2', balance: 0 },
        error: null,
      }),
      update: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
    };

    const walletTxInsert = {
      insert: jest.fn().mockReturnThis(),
    };

    mockedFrom.mockImplementation((table: string) => {
      if (table === 'auctions') return auctionsQuery as any;
      if (table === 'products') return productsQuery as any;
      if (table === 'commissions') return commissionsQuery as any;
      if (table === 'payouts') return payoutsQuery as any;
      if (table === 'wallets') return walletsQuery as any;
      if (table === 'wallet_transactions') return walletTxInsert as any;
      throw new Error(`Unexpected table ${table}`);
    });

    const ok = await paymentService.processCommission(sellerId, amount, auctionId);

    expect(ok).toBe(true);
    // Default calculateCommission uses 5%
    const expectedCommission = Math.round(amount * 0.05);
    const inserted = (payoutsQuery.insert.mock.calls[0][0] as any[])[0];
    expect(inserted.commission_amount).toBe(expectedCommission);
    expect(inserted.net_payout).toBe(amount - expectedCommission);
  });
});
