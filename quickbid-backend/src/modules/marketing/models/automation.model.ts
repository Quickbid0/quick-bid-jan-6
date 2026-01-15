import mongoose, { Document, Schema } from 'mongoose';

export type AutomationTriggerType = 'event' | 'segment';

export interface AutomationTrigger {
  type: AutomationTriggerType;
  event_name?: string;
  segment_name?: string;
}

export type AutomationActionType =
  | 'email'
  | 'sms'
  | 'push'
  | 'meta_audience_add'
  | 'google_remarketing'
  | 'create_ad_campaign'
  | 'webhook';

export interface AutomationAction {
  type: AutomationActionType;
  params: Record<string, any>;
  delay_ms?: number;
}

export interface Automation extends Document {
  name: string;
  trigger: AutomationTrigger;
  filters?: Record<string, any>;
  actions: AutomationAction[];
  active: boolean;
  created_at: Date;
}

const AutomationSchema = new Schema<Automation>(
  {
    name: { type: String, required: true },
    trigger: {
      type: {
        type: String,
        enum: ['event', 'segment'],
        required: true,
      },
      event_name: { type: String },
      segment_name: { type: String },
    },
    filters: { type: Schema.Types.Mixed },
    actions: [
      {
        type: {
          type: String,
          enum: ['email', 'sms', 'push', 'meta_audience_add', 'google_remarketing', 'create_ad_campaign', 'webhook'],
          required: true,
        },
        params: { type: Schema.Types.Mixed, required: true },
        delay_ms: { type: Number },
      },
    ],
    active: { type: Boolean, default: true },
    created_at: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

export const AutomationModel = mongoose.model<Automation>('automations', AutomationSchema);
