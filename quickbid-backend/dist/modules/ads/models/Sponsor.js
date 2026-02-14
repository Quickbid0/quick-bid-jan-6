"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sponsor = void 0;
const mongoose_1 = require("mongoose");
const BrandAssetSchema = new mongoose_1.Schema({
    type: { type: String, enum: ['image', 'video'], required: true },
    url: { type: String, required: true },
    label: { type: String },
}, { _id: false });
const BrandColorsSchema = new mongoose_1.Schema({
    primary: { type: String, required: true },
    secondary: { type: String },
}, { _id: false });
const SponsorSchema = new mongoose_1.Schema({
    sponsorId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    gstNumber: { type: String },
    brandColors: { type: BrandColorsSchema },
    logoUrl: { type: String },
    brandAssets: { type: [BrandAssetSchema], default: [] },
    packageTier: {
        type: String,
        enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
        default: 'Bronze',
    },
    balanceDue: { type: Number, default: 0 },
    invoices: { type: [String], default: [] },
    agentId: { type: String },
    authEmail: { type: String, required: true, index: true },
}, { timestamps: true });
exports.Sponsor = (0, mongoose_1.model)('Sponsor', SponsorSchema);
