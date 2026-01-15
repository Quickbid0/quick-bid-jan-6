import { Router } from 'express';
import { createInvoiceForCampaigns, listInvoices, markInvoicePaid } from '../services/billing.service';

export const invoiceRouter = Router();

invoiceRouter.post('/invoices', async (req, res, next) => {
  try {
    const { sponsorId, campaignIds, dueDate } = req.body;
    const invoice = await createInvoiceForCampaigns({
      sponsorId,
      campaignIds,
      dueDate: new Date(dueDate),
    });
    res.status(201).json(invoice);
  } catch (err) {
    next(err);
  }
});

invoiceRouter.get('/invoices', async (req, res, next) => {
  try {
    const { sponsorId } = req.query as Record<string, string>;
    const invoices = await listInvoices({ sponsorId });
    res.json(invoices);
  } catch (err) {
    next(err);
  }
});

invoiceRouter.patch('/invoices/:id/pay', async (req, res, next) => {
  try {
    const invoice = await markInvoicePaid(req.params.id);
    if (!invoice) {
      res.status(404).json({ message: 'Invoice not found' });
      return;
    }
    res.json(invoice);
  } catch (err) {
    next(err);
  }
});
