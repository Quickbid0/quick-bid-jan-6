"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceRouter = void 0;
const express_1 = require("express");
const billing_service_1 = require("../services/billing.service");
exports.invoiceRouter = (0, express_1.Router)();
exports.invoiceRouter.post('/invoices', async (req, res, next) => {
    try {
        const { sponsorId, campaignIds, dueDate } = req.body;
        const invoice = await (0, billing_service_1.createInvoiceForCampaigns)({
            sponsorId,
            campaignIds,
            dueDate: new Date(dueDate),
        });
        res.status(201).json(invoice);
    }
    catch (err) {
        next(err);
    }
});
exports.invoiceRouter.get('/invoices', async (req, res, next) => {
    try {
        const { sponsorId } = req.query;
        const invoices = await (0, billing_service_1.listInvoices)({ sponsorId });
        res.json(invoices);
    }
    catch (err) {
        next(err);
    }
});
exports.invoiceRouter.patch('/invoices/:id/pay', async (req, res, next) => {
    try {
        const invoice = await (0, billing_service_1.markInvoicePaid)(req.params.id);
        if (!invoice) {
            res.status(404).json({ message: 'Invoice not found' });
            return;
        }
        res.json(invoice);
    }
    catch (err) {
        next(err);
    }
});
