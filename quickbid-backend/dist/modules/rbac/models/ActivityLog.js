"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLog = void 0;
const mongoose_1 = require("mongoose");
const ActivityLogSchema = new mongoose_1.Schema({
    actorUserId: { type: String, required: true },
    actorRoleIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Role' }],
    type: { type: String, required: true },
    action: { type: String, required: true },
    targetUserId: { type: String },
    targetRoleId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Role' },
    targetPermissionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Permission' },
    meta: { type: mongoose_1.Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });
exports.ActivityLog = (0, mongoose_1.model)('ActivityLog', ActivityLogSchema);
