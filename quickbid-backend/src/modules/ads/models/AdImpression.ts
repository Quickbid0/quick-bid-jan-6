import { Schema, model, Document } from 'mongoose';

export interface IAdImpression extends Document {
  sponsorId: string;
  slotId: string;
  campaignId: string;
  eventId?: string;
  userId?: string;
  timestamp: Date;
  durationMs: number;
  clicked: boolean;
}

const AdImpressionSchema = new Schema<IAdImpression>(
  {
    sponsorId: { type: String, required: true, index: true },
    slotId: { type: String, required: true, index: true },
    campaignId: { type: String, required: true, index: true },
    eventId: { type: String },
    userId: { type: String },
    timestamp: { type: Date, default: () => new Date(), index: true },
    durationMs: { type: Number, default: 0 },
    clicked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const AdImpression = model<IAdImpression>('AdImpression', AdImpressionSchema);
