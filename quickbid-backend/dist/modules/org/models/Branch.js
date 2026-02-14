"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Branch = void 0;
const mongoose_1 = require("mongoose");
const BranchSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    state: { type: String },
    city: { type: String },
    address: { type: String },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
exports.Branch = (0, mongoose_1.model)('Branch', BranchSchema);
