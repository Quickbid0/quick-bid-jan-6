import mongoose, { Document, Schema } from 'mongoose';

export interface PixelEvent extends Document {
  pixel_id: string;
  event: string;
  metadata?: Record<string, any>;
  visitor_id?: string;
  user_id?: string;
  utm?: Record<string, any>;
  event_id?: string;
  ts: Date;
  processed: boolean;
  enriched?: boolean;
}

const PixelEventSchema = new Schema<PixelEvent>(
  {
    pixel_id: { type: String, required: true, index: true },
    event: { type: String, required: true, index: true },
    metadata: { type: Schema.Types.Mixed },
    visitor_id: { type: String, index: true },
    user_id: { type: String, index: true },
    utm: { type: Schema.Types.Mixed },
    event_id: { type: String, index: true },
    ts: { type: Date, required: true, index: true },
    processed: { type: Boolean, default: false, index: true },
    enriched: { type: Boolean, default: false },
  },
  { timestamps: true }
);

PixelEventSchema.index({ event_id: 1 }, { unique: false, sparse: true });
PixelEventSchema.index({ pixel_id: 1, event: 1, ts: 1 });

export const PixelEventModel = mongoose.model<PixelEvent>('pixel_events', PixelEventSchema);
