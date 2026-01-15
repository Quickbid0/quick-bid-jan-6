import { Schema, model, Document } from 'mongoose';

export interface RolePermissionDoc extends Document {
  roleId: Schema.Types.ObjectId;
  permissionId: Schema.Types.ObjectId;
  allowed: boolean;
  constraints?: {
    maxAmount?: number;
    allowedStates?: string[];
    allowedBranches?: string[];
  };
}

const RolePermissionSchema = new Schema<RolePermissionDoc>(
  {
    roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    permissionId: { type: Schema.Types.ObjectId, ref: 'Permission', required: true },
    allowed: { type: Boolean, default: true },
    constraints: {
      maxAmount: { type: Number },
      allowedStates: [{ type: String }],
      allowedBranches: [{ type: String }],
    },
  },
  { timestamps: true }
);

RolePermissionSchema.index({ roleId: 1, permissionId: 1 }, { unique: true });

export const RolePermission = model<RolePermissionDoc>('RolePermission', RolePermissionSchema);
