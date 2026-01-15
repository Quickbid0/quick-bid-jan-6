import { Schema, model, Document, Types } from 'mongoose';

export type SlotType =
  | 'pre_roll'
  | 'mid_roll'
  | 'post_roll'
  | 'banner_left'
  | 'banner_bottom'
  | 'banner_right'
  | 'ticker'
  | 'popup_card'
  | 'timer_extension';

export interface IFrequencyCap {
  perUserPerHour?: number;
  perSession?: number;
}

export interface IScheduleWindow {
  start: Date;
  end: Date;
  daysOfWeek?: number[];
  timesOfDay?: string[];
}

export interface IAdSlot extends Document {
  slotId: string;
  slotType: SlotType;
  durationSec: number;
  priceModel: 'flat' | 'cpm';
  priceAmount: number;
  frequencyCap?: IFrequencyCap;
  assignedSponsorId?: string;
  creativeUrl?: string;
  events: string[];
  schedule: IScheduleWindow[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FrequencyCapSchema = new Schema<IFrequencyCap>(
  {
    perUserPerHour: { type: Number },
    perSession: { type: Number },
  },
  { _id: false }
);

const ScheduleWindowSchema = new Schema<IScheduleWindow>(
  {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    daysOfWeek: { type: [Number], default: [] },
    timesOfDay: { type: [String], default: [] },
  },
  { _id: false }
);

const AdSlotSchema = new Schema<IAdSlot>(
  {
    slotId: { type: String, required: true, unique: true, index: true },
    slotType: {
      type: String,
      enum: [
        'pre_roll',
        'mid_roll',
        'post_roll',
        'banner_left',
        'banner_bottom',
        'banner_right',
        'ticker',
        'popup_card',
        'timer_extension',
      ],
      required: true,
    },
    durationSec: { type: Number, required: true },
    priceModel: { type: String, enum: ['flat', 'cpm'], default: 'flat' },
    priceAmount: { type: Number, required: true },
    frequencyCap: { type: FrequencyCapSchema },
    assignedSponsorId: { type: String },
    creativeUrl: { type: String },
    events: { type: [String], default: [] },
    schedule: { type: [ScheduleWindowSchema], default: [] },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const AdSlot = model<IAdSlot>('AdSlot', AdSlotSchema);
