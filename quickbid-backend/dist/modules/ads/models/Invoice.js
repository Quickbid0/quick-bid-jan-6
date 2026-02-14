"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invoice = void 0;
const mongoose_1 = require("mongoose");
const InvoiceLineItemSchema = new mongoose_1.Schema({
    campaignId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    impressions: { type: Number, required: true },
    rate: { type: Number, required: true },
    amount: { type: Number, required: true },
}, { _id: false });
const InvoiceSchema = new mongoose_1.Schema({
    invoiceId: { type: String, required: true, unique: true, index: true },
    sponsorId: { type: String, required: true, index: true },
    campaignIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Campaign' }],
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['draft', 'sent', 'paid', 'overdue'],
        default: 'draft',
    },
    dueDate: { type: Date, required: true },
    pdfUrl: { type: String },
    lineItems: { type: [InvoiceLineItemSchema], default: [] },
}, { timestamps: true });
exports.Invoice = (0, mongoose_1.model)('Invoice', InvoiceSchema);
