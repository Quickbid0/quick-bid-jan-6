import { Schema, model, Document } from 'mongoose';

export type SponsorPackageTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface IBrandAsset {
  type: 'image' | 'video';
  url: string;
  label?: string;
}

export interface IBrandColors {
  primary: string;
  secondary?: string;
}

export interface ISponsor extends Document {
  sponsorId: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstNumber?: string;
  brandColors?: IBrandColors;
  logoUrl?: string;
  brandAssets: IBrandAsset[];
  packageTier: SponsorPackageTier;
  balanceDue: number;
  invoices: string[];
  agentId?: string;
  authEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

const BrandAssetSchema = new Schema<IBrandAsset>(
  {
    type: { type: String, enum: ['image', 'video'], required: true },
    url: { type: String, required: true },
    label: { type: String },
  },
  { _id: false }
);

const BrandColorsSchema = new Schema<IBrandColors>(
  {
    primary: { type: String, required: true },
    secondary: { type: String },
  },
  { _id: false }
);

const SponsorSchema = new Schema<ISponsor>(
  {
    sponsorId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    gstNumber: { type: String },
    brandColors: { type: BrandColorsSchema },
    logoUrl: { type: String },
    brandAssets: { type: [BrandAssetSchema], default: [] },
    packageTier: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
      default: 'Bronze',
    },
    balanceDue: { type: Number, default: 0 },
    invoices: { type: [String], default: [] },
    agentId: { type: String },
    authEmail: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

export const Sponsor = model<ISponsor>('Sponsor', SponsorSchema);
