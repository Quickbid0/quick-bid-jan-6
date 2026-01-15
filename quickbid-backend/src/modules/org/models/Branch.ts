import { Schema, model, Document } from 'mongoose';

export interface BranchDoc extends Document {
  name: string;
  code: string;
  state?: string;
  city?: string;
  address?: string;
  isActive: boolean;
}

const BranchSchema = new Schema<BranchDoc>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    state: { type: String },
    city: { type: String },
    address: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Branch = model<BranchDoc>('Branch', BranchSchema);
