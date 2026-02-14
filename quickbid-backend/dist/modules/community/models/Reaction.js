"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reaction = void 0;
const mongoose_1 = require("mongoose");
const ReactionSchema = new mongoose_1.Schema({
    postId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ['like'], required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });
ReactionSchema.index({ postId: 1, userId: 1 }, { unique: true });
exports.Reaction = (0, mongoose_1.model)('Reaction', ReactionSchema);
