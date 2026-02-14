"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolePermission = void 0;
const mongoose_1 = require("mongoose");
const RolePermissionSchema = new mongoose_1.Schema({
    roleId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Role', required: true },
    permissionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Permission', required: true },
    allowed: { type: Boolean, default: true },
    constraints: {
        maxAmount: { type: Number },
        allowedStates: [{ type: String }],
        allowedBranches: [{ type: String }],
    },
}, { timestamps: true });
RolePermissionSchema.index({ roleId: 1, permissionId: 1 }, { unique: true });
exports.RolePermission = (0, mongoose_1.model)('RolePermission', RolePermissionSchema);
