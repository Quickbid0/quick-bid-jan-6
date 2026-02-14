"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Department = void 0;
const mongoose_1 = require("mongoose");
const DepartmentSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
exports.Department = (0, mongoose_1.model)('Department', DepartmentSchema);
