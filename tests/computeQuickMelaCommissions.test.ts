import { computeQuickMelaCommissions } from '../quickbid-backend/src/modules/auctions/services/computeQuickMelaCommissions';
import { commissionService } from '../quickbid-backend/src/modules/auctions/services/commissionService';

jest.mock('../quickbid-backend/src/modules/auctions/services/commissionService', () => {
  const actual = jest.requireActual('../quickbid-backend/src/modules/auctions/services/commissionService');
  return {
    ...actual,
    commissionService: {
      ...actual.commissionService,
      applyCommissionRules: jest.fn(),
    },
  };
});

describe('computeQuickMelaCommissions', () => {
  it('maps commissionService.applyCommissionRules result into public shape', async () => {
    (commissionService.applyCommissionRules as jest.Mock).mockResolvedValue({
      buyerCommissionCents: 12_000,
      sellerCommissionCents: 3_600,
      platformFlatCents: 1_000,
      totalCommissionCents: 16_600,
      netToSellerCents: 80_000,
    });

    const res = await computeQuickMelaCommissions(100_000);

    expect(commissionService.applyCommissionRules).toHaveBeenCalledWith(100_000);
    expect(res).toEqual({
      buyerCommission: 12_000,
      sellerCommission: 3_600,
      totalCommission: 16_600,
      netToSeller: 80_000,
      platformFlatCents: 1_000,
    });
  });
});
