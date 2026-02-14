"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = void 0;
const mongoose_1 = require("mongoose");
const UserRoleSchema = new mongoose_1.Schema({
    supabaseUserId: { type: String, required: true, index: true },
    roleId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Role', required: true },
    stateId: { type: String },
    branchId: { type: String },
    mandalId: { type: String },
    departmentId: { type: String },
    isPrimary: { type: Boolean, default: false },
    assignedBy: { type: String, required: true },
    approvedBy: { type: String },
    status: {
        type: String,
        enum: ['pending', 'active', 'rejected'],
        default: 'pending',
    },
    requestedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectionReason: { type: String },
}, { timestamps: true });
UserRoleSchema.index({
    supabaseUserId: 1,
    roleId: 1,
    stateId: 1,
    branchId: 1,
    mandalId: 1,
    departmentId: 1,
}, { unique: true });
exports.UserRole = (0, mongoose_1.model)('UserRole', UserRoleSchema);
