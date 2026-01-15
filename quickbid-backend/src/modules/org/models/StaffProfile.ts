import { Schema, model, Document } from 'mongoose';

export interface StaffProfileDoc extends Document {
  supabaseUserId: string;
  fullName?: string;
  phone?: string;
  email?: string;
  primaryBranchId?: string;
  primaryDepartmentId?: string;
  status: 'active' | 'disabled';
}

const StaffProfileSchema = new Schema<StaffProfileDoc>(
  {
    supabaseUserId: { type: String, required: true, unique: true },
    fullName: { type: String },
    phone: { type: String },
    email: { type: String },
    primaryBranchId: { type: String },
    primaryDepartmentId: { type: String },
    status: { type: String, enum: ['active', 'disabled'], default: 'active' },
  },
  { timestamps: true }
);

export const StaffProfile = model<StaffProfileDoc>('StaffProfile', StaffProfileSchema);
