import { Schema, model, Document } from 'mongoose';

export type UserRoleStatus = 'pending' | 'active' | 'rejected';

export interface UserRoleDoc extends Document {
  supabaseUserId: string;
  roleId: Schema.Types.ObjectId;
  stateId?: string;
  branchId?: string;
  mandalId?: string;
  departmentId?: string;
  isPrimary: boolean;
  assignedBy: string;
  approvedBy?: string;
  status: UserRoleStatus;
  requestedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
}

const UserRoleSchema = new Schema<UserRoleDoc>(
  {
    supabaseUserId: { type: String, required: true, index: true },
    roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    stateId: { type: String },
    branchId: { type: String },
    mandalId: { type: String },
    departmentId: { type: String },
    isPrimary: { type: Boolean, default: false },
    assignedBy: { type: String, required: true },
    approvedBy: { type: String },
    status: {
      type: String,
      enum: ['pending', 'active', 'rejected'],
      default: 'pending',
    },
    requestedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

UserRoleSchema.index(
  {
    supabaseUserId: 1,
    roleId: 1,
    stateId: 1,
    branchId: 1,
    mandalId: 1,
    departmentId: 1,
  },
  { unique: true }
);

export const UserRole = model<UserRoleDoc>('UserRole', UserRoleSchema);
