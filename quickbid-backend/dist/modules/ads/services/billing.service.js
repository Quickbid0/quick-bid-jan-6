"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceForCampaigns = createInvoiceForCampaigns;
exports.listInvoices = listInvoices;
exports.markInvoicePaid = markInvoicePaid;
const Invoice_1 = require("../models/Invoice");
const Campaign_1 = require("../models/Campaign");
const AdImpression_1 = require("../models/AdImpression");
async function createInvoiceForCampaigns(input) {
    const { sponsorId, campaignIds, dueDate } = input;
    const campaigns = await Campaign_1.Campaign.find({ campaignId: { $in: campaignIds } }).lean();
    const byId = {};
    campaigns.forEach((c) => {
        byId[c.campaignId] = c;
    });
    const impressionsByCampaign = await AdImpression_1.AdImpression.aggregate([
        { $match: { sponsorId, campaignId: { $in: campaignIds } } },
        {
            $group: {
                _id: '$campaignId',
                impressions: { $sum: 1 },
            },
        },
    ]);
    const lineItems = impressionsByCampaign.map((row) => {
        const cmp = byId[row._id];
        const rate = cmp?.pricingModel === 'cpm' ? 0.0 : 0.0; // pricing can be filled in later
        const amount = rate * row.impressions;
        return {
            campaignId: cmp?._id,
            impressions: row.impressions,
            rate,
            amount,
        };
    });
    const totalAmount = lineItems.reduce((sum, li) => sum + (li.amount || 0), 0);
    const invoiceId = `INV_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const doc = new Invoice_1.Invoice({
        sponsorId,
        invoiceId,
        campaignIds: campaigns.map((c) => c._id),
        totalAmount,
        status: 'draft',
        dueDate,
        lineItems,
    });
    await doc.save();
    return doc.toObject();
}
async function listInvoices(filter) {
    const query = {};
    if (filter.sponsorId)
        query.sponsorId = filter.sponsorId;
    return Invoice_1.Invoice.find(query).lean();
}
async function markInvoicePaid(invoiceId) {
    return Invoice_1.Invoice.findOneAndUpdate({ invoiceId }, { status: 'paid' }, { new: true }).lean();
}
