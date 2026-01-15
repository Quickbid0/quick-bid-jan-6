import { Schema, model, Document } from 'mongoose';

export interface ActivityLogDoc extends Document {
  actorUserId: string;
  actorRoleIds: Schema.Types.ObjectId[];
  type: string;
  action: string;
  targetUserId?: string;
  targetRoleId?: Schema.Types.ObjectId;
  targetPermissionId?: Schema.Types.ObjectId;
  meta?: any;
  ip?: string;
  userAgent?: string;
}

const ActivityLogSchema = new Schema<ActivityLogDoc>(
  {
    actorUserId: { type: String, required: true },
    actorRoleIds: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
    type: { type: String, required: true },
    action: { type: String, required: true },
    targetUserId: { type: String },
    targetRoleId: { type: Schema.Types.ObjectId, ref: 'Role' },
    targetPermissionId: { type: Schema.Types.ObjectId, ref: 'Permission' },
    meta: { type: Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ActivityLog = model<ActivityLogDoc>('ActivityLog', ActivityLogSchema);
