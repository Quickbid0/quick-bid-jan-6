"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
const mongoose_1 = require("mongoose");
const RoleSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    description: { type: String },
    level: {
        type: String,
        enum: ['global', 'state', 'branch', 'mandal', 'department', 'user'],
        default: 'global',
    },
    isSystem: { type: Boolean, default: false },
    canOverride: { type: Boolean, default: false },
    canApproveRoleChanges: { type: Boolean, default: false },
    canViewAuditLogs: { type: Boolean, default: false },
}, { timestamps: true });
exports.Role = (0, mongoose_1.model)('Role', RoleSchema);
