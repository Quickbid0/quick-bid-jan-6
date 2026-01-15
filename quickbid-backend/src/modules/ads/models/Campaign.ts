import { Schema, model, Document, Types } from 'mongoose';

export type CampaignStatus = 'draft' | 'pending' | 'active' | 'paused' | 'completed';

export interface ICampaignAnalytics {
  impressions: number;
  clicks: number;
  watchTimeMs: number;
  cpmEffective?: number;
}

export interface ICampaign extends Document {
  campaignId: string;
  sponsorId: string;
  slotIds: Types.ObjectId[];
  creativeUrl: string;
  startDate: Date;
  endDate: Date;
  impressionCap?: number;
  eventIds: string[];
  status: CampaignStatus;
  pricingModel: 'flat' | 'cpm' | 'cpc';
  analytics: ICampaignAnalytics;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignAnalyticsSchema = new Schema<ICampaignAnalytics>(
  {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    watchTimeMs: { type: Number, default: 0 },
    cpmEffective: { type: Number },
  },
  { _id: false }
);

const CampaignSchema = new Schema<ICampaign>(
  {
    campaignId: { type: String, required: true, unique: true, index: true },
    sponsorId: { type: String, required: true, index: true },
    slotIds: [{ type: Schema.Types.ObjectId, ref: 'AdSlot' }],
    creativeUrl: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    impressionCap: { type: Number },
    eventIds: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['draft', 'pending', 'active', 'paused', 'completed'],
      default: 'draft',
    },
    pricingModel: { type: String, enum: ['flat', 'cpm', 'cpc'], default: 'flat' },
    analytics: { type: CampaignAnalyticsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export const Campaign = model<ICampaign>('Campaign', CampaignSchema);
