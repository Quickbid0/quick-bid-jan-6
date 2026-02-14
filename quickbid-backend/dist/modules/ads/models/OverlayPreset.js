"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverlayPreset = void 0;
const mongoose_1 = require("mongoose");
const OverlaySlotSchema = new mongoose_1.Schema({
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
}, { _id: false });
const OverlayPresetSchema = new mongoose_1.Schema({
    presetId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    layout: { type: [OverlaySlotSchema], default: [] },
    eventIds: { type: [String], default: [] },
    createdBy: { type: String },
}, {
    timestamps: true,
});
exports.OverlayPreset = (0, mongoose_1.model)('OverlayPreset', OverlayPresetSchema);
