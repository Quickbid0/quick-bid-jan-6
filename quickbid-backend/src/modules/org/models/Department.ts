import { Schema, model, Document } from 'mongoose';

export interface DepartmentDoc extends Document {
  name: string;
  key: string;
  description?: string;
  isActive: boolean;
}

const DepartmentSchema = new Schema<DepartmentDoc>(
  {
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Department = model<DepartmentDoc>('Department', DepartmentSchema);
