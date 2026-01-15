import { Schema, model, Document } from 'mongoose';

export type NotificationType =
  | 'NEW_POST_IN_CATEGORY'
  | 'POST_LIKE'
  | 'POST_COMMENT'
  | 'NEW_AUCTION_EVENT';

export interface INotification extends Document {
  userId: string;
  type: NotificationType;
  data: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['NEW_POST_IN_CATEGORY', 'POST_LIKE', 'POST_COMMENT', 'NEW_AUCTION_EVENT'],
      required: true,
    },
    data: { type: Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = model<INotification>('Notification', NotificationSchema);
