"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeQuickMelaCommissions = computeQuickMelaCommissions;
const commissionService_1 = require("./commissionService");
async function computeQuickMelaCommissions(finalPriceCents) {
    // Delegate to DB-driven commission settings (buyer %, seller %, platform flat fee)
    const { buyerCommissionCents, sellerCommissionCents, platformFlatCents, totalCommissionCents, netToSellerCents, } = await commissionService_1.commissionService.applyCommissionRules(finalPriceCents);
    return {
        buyerCommission: buyerCommissionCents,
        sellerCommission: sellerCommissionCents,
        totalCommission: totalCommissionCents,
        netToSeller: netToSellerCents,
        platformFlatCents,
    };
}
