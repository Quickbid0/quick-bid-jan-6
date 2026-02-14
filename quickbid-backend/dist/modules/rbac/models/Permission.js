"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permission = void 0;
const mongoose_1 = require("mongoose");
const PermissionSchema = new mongoose_1.Schema({
    key: { type: String, required: true, unique: true },
    module: { type: String, required: true },
    action: { type: String, required: true },
    label: { type: String, required: true },
    description: { type: String },
    special: { type: String },
}, { timestamps: true });
exports.Permission = (0, mongoose_1.model)('Permission', PermissionSchema);
