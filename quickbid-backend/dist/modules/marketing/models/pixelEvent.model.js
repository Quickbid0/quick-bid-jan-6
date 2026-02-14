"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PixelEventModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const PixelEventSchema = new mongoose_1.Schema({
    pixel_id: { type: String, required: true, index: true },
    event: { type: String, required: true, index: true },
    metadata: { type: mongoose_1.Schema.Types.Mixed },
    visitor_id: { type: String, index: true },
    user_id: { type: String, index: true },
    utm: { type: mongoose_1.Schema.Types.Mixed },
    event_id: { type: String, index: true },
    ts: { type: Date, required: true, index: true },
    processed: { type: Boolean, default: false, index: true },
    enriched: { type: Boolean, default: false },
}, { timestamps: true });
PixelEventSchema.index({ event_id: 1 }, { unique: false, sparse: true });
PixelEventSchema.index({ pixel_id: 1, event: 1, ts: 1 });
exports.PixelEventModel = mongoose_1.default.model('pixel_events', PixelEventSchema);
