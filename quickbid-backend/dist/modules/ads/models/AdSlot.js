"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdSlot = void 0;
const mongoose_1 = require("mongoose");
const FrequencyCapSchema = new mongoose_1.Schema({
    perUserPerHour: { type: Number },
    perSession: { type: Number },
}, { _id: false });
const ScheduleWindowSchema = new mongoose_1.Schema({
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    daysOfWeek: { type: [Number], default: [] },
    timesOfDay: { type: [String], default: [] },
}, { _id: false });
const AdSlotSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
exports.AdSlot = (0, mongoose_1.model)('AdSlot', AdSlotSchema);
