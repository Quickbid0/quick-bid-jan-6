import { Schema, model, Document } from 'mongoose';

export type OverlaySlotType =
  | 'banner_left'
  | 'banner_right'
  | 'banner_bottom'
  | 'popup_card'
  | 'ticker';

export interface IOverlaySlotConfig {
  slotType: OverlaySlotType;
  x: number; // 0-1 relative position
  y: number; // 0-1
  width: number; // 0-1
  height: number; // 0-1
  zIndex: number;
  visible: boolean;
  style?: {
    opacity?: number;
    borderRadius?: number;
  };
}

export interface IOverlayPreset extends Document {
  presetId: string;
  name: string;
  description?: string;
  layout: IOverlaySlotConfig[];
  eventIds: string[];
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OverlaySlotSchema = new Schema<IOverlaySlotConfig>(
  {
    slotType: {
      type: String,
      enum: ['banner_left', 'banner_right', 'banner_bottom', 'popup_card', 'ticker'],
      required: true,
    },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    zIndex: { type: Number, required: true },
    visible: { type: Boolean, default: true },
    style: {
      opacity: { type: Number },
      borderRadius: { type: Number },
    },
  },
  { _id: false },
);

const OverlayPresetSchema = new Schema<IOverlayPreset>(
  {
    presetId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    layout: { type: [OverlaySlotSchema], default: [] },
    eventIds: { type: [String], default: [] },
    createdBy: { type: String },
  },
  {
    timestamps: true,
  },
);

export const OverlayPreset = model<IOverlayPreset>('OverlayPreset', OverlayPresetSchema);
