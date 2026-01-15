import { Schema, model, Document } from 'mongoose';

export interface PermissionDoc extends Document {
  key: string;
  module: string;
  action: string;
  label: string;
  description?: string;
  special?: string;
}

const PermissionSchema = new Schema<PermissionDoc>(
  {
    key: { type: String, required: true, unique: true },
    module: { type: String, required: true },
    action: { type: String, required: true },
    label: { type: String, required: true },
    description: { type: String },
    special: { type: String },
  },
  { timestamps: true }
);

export const Permission = model<PermissionDoc>('Permission', PermissionSchema);
