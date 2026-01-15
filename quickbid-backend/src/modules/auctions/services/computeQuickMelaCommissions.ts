import { commissionService } from './commissionService';

export async function computeQuickMelaCommissions(finalPriceCents: number) {
  // Delegate to DB-driven commission settings (buyer %, seller %, platform flat fee)
  const {
    buyerCommissionCents,
    sellerCommissionCents,
    platformFlatCents,
    totalCommissionCents,
    netToSellerCents,
  } = await commissionService.applyCommissionRules(finalPriceCents);

  return {
    buyerCommission: buyerCommissionCents,
    sellerCommission: sellerCommissionCents,
    totalCommission: totalCommissionCents,
    netToSeller: netToSellerCents,
    platformFlatCents,
  };
}
