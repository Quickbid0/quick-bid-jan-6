"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffProfile = void 0;
const mongoose_1 = require("mongoose");
const StaffProfileSchema = new mongoose_1.Schema({
    supabaseUserId: { type: String, required: true, unique: true },
    fullName: { type: String },
    phone: { type: String },
    email: { type: String },
    primaryBranchId: { type: String },
    primaryDepartmentId: { type: String },
    status: { type: String, enum: ['active', 'disabled'], default: 'active' },
}, { timestamps: true });
exports.StaffProfile = (0, mongoose_1.model)('StaffProfile', StaffProfileSchema);
