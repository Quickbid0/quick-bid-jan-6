import mongoose, { Document, Schema } from 'mongoose';

export interface Segment extends Document {
  name: string;
  criteria_json: Record<string, any>;
  last_evaluated_at?: Date;
  size: number;
}

const SegmentSchema = new Schema<Segment>(
  {
    name: { type: String, required: true, unique: true },
    criteria_json: { type: Schema.Types.Mixed, required: true },
    last_evaluated_at: { type: Date },
    size: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const SegmentModel = mongoose.model<Segment>('segments', SegmentSchema);
