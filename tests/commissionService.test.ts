import { commissionService, CommissionSettings } from '../quickbid-backend/src/modules/auctions/services/commissionService';

describe('commissionService.applyCommissionRules', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('computes buyer/seller commissions and net to seller using active settings', async () => {
    const settings: CommissionSettings = {
      id: 'test-config',
      buyer_commission_percent: 10,
      seller_commission_percent: 3,
      platform_flat_fee_cents: 5000,
      category_overrides: null,
    };

    jest.spyOn(commissionService, 'getActive').mockResolvedValue(settings);

    const amountCents = 100_000; // ₹1,000.00
    const result = await commissionService.applyCommissionRules(amountCents);

    expect(result.buyerCommissionCents).toBe(10_000); // 10%
    expect(result.sellerCommissionCents).toBe(3_000); // 3%
    expect(result.platformFlatCents).toBe(5_000);
    expect(result.totalCommissionCents).toBe(10_000 + 3_000 + 5_000);
    expect(result.netToSellerCents).toBe(amountCents - 3_000 - 5_000);
  });

  it('supports zero platform flat fee cleanly', async () => {
    const settings: CommissionSettings = {
      id: 'no-flat',
      buyer_commission_percent: 8,
      seller_commission_percent: 2,
      platform_flat_fee_cents: 0,
      category_overrides: null,
    };

    jest.spyOn(commissionService, 'getActive').mockResolvedValue(settings);

    const amountCents = 50_000; // ₹500.00
    const result = await commissionService.applyCommissionRules(amountCents);

    expect(result.platformFlatCents).toBe(0);
    expect(result.buyerCommissionCents).toBe(4_000); // 8%
    expect(result.sellerCommissionCents).toBe(1_000); // 2%
    expect(result.totalCommissionCents).toBe(5_000);
    expect(result.netToSellerCents).toBe(amountCents - 1_000);
  });
});
