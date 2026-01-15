import { Schema, model, Document } from 'mongoose';

export type RoleLevel = 'global' | 'state' | 'branch' | 'mandal' | 'department' | 'user';

export interface RoleDoc extends Document {
  name: string;
  key: string;
  description?: string;
  level: RoleLevel;
  isSystem: boolean;
  canOverride: boolean;
  canApproveRoleChanges: boolean;
  canViewAuditLogs: boolean;
}

const RoleSchema = new Schema<RoleDoc>(
  {
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    description: { type: String },
    level: {
      type: String,
      enum: ['global', 'state', 'branch', 'mandal', 'department', 'user'],
      default: 'global',
    },
    isSystem: { type: Boolean, default: false },
    canOverride: { type: Boolean, default: false },
    canApproveRoleChanges: { type: Boolean, default: false },
    canViewAuditLogs: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Role = model<RoleDoc>('Role', RoleSchema);
