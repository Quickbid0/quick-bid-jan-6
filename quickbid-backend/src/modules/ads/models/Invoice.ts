import { Schema, model, Document, Types } from 'mongoose';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface IInvoiceLineItem {
  campaignId: Types.ObjectId;
  impressions: number;
  rate: number;
  amount: number;
}

export interface IInvoice extends Document {
  invoiceId: string;
  sponsorId: string;
  campaignIds: Types.ObjectId[];
  totalAmount: number;
  status: InvoiceStatus;
  dueDate: Date;
  pdfUrl?: string;
  lineItems: IInvoiceLineItem[];
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceLineItemSchema = new Schema<IInvoiceLineItem>(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
    impressions: { type: Number, required: true },
    rate: { type: Number, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceId: { type: String, required: true, unique: true, index: true },
    sponsorId: { type: String, required: true, index: true },
    campaignIds: [{ type: Schema.Types.ObjectId, ref: 'Campaign' }],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'overdue'],
      default: 'draft',
    },
    dueDate: { type: Date, required: true },
    pdfUrl: { type: String },
    lineItems: { type: [InvoiceLineItemSchema], default: [] },
  },
  { timestamps: true }
);

export const Invoice = model<IInvoice>('Invoice', InvoiceSchema);
