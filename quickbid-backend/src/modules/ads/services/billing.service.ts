import { Invoice, IInvoice } from '../models/Invoice';
import { Campaign } from '../models/Campaign';
import { AdImpression } from '../models/AdImpression';

interface CreateInvoiceInput {
  sponsorId: string;
  campaignIds: string[]; // campaignId strings
  dueDate: Date;
}

export async function createInvoiceForCampaigns(input: CreateInvoiceInput) {
  const { sponsorId, campaignIds, dueDate } = input;

  const campaigns = await Campaign.find({ campaignId: { $in: campaignIds } }).lean();
  const byId: Record<string, any> = {};
  campaigns.forEach((c) => {
    byId[c.campaignId] = c;
  });

  const impressionsByCampaign = await AdImpression.aggregate([
    { $match: { sponsorId, campaignId: { $in: campaignIds } } },
    {
      $group: {
        _id: '$campaignId',
        impressions: { $sum: 1 },
      },
    },
  ]);

  const lineItems: IInvoice['lineItems'] = impressionsByCampaign.map((row) => {
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

  const doc = new Invoice({
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

export async function listInvoices(filter: { sponsorId?: string }) {
  const query: any = {};
  if (filter.sponsorId) query.sponsorId = filter.sponsorId;
  return Invoice.find(query).lean();
}

export async function markInvoicePaid(invoiceId: string) {
  return Invoice.findOneAndUpdate(
    { invoiceId },
    { status: 'paid' },
    { new: true }
  ).lean();
}
