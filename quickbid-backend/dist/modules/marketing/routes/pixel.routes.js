"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pixelRouter = void 0;
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const pixelEvent_model_1 = require("../models/pixelEvent.model");
const queues_1 = require("../queues/queues");
exports.pixelRouter = (0, express_1.Router)();
function computeEventId(body) {
    if (body.event_id)
        return body.event_id;
    const hash = crypto_1.default
        .createHash('sha256')
        .update(JSON.stringify({ metadata: body.metadata || {}, ts: body.ts }))
        .digest('hex');
    return hash;
}
exports.pixelRouter.post('/api/v1/pixel', async (req, res) => {
    try {
        const { pixel_id, event, metadata, visitor_id, user_id, utm, event_id, ts } = req.body || {};
        if (!pixel_id || !event || !ts) {
            return res.status(400).json({ message: 'pixel_id, event and ts are required' });
        }
        const finalEventId = computeEventId({ event_id, metadata, ts });
        const existing = await pixelEvent_model_1.PixelEventModel.findOne({ event_id: finalEventId }).lean();
        if (existing) {
            return res.status(200).json({ status: 'duplicate', id: existing._id });
        }
        const doc = await pixelEvent_model_1.PixelEventModel.create({
            pixel_id,
            event,
            metadata,
            visitor_id,
            user_id,
            utm,
            event_id: finalEventId,
            ts: new Date(ts),
            processed: false,
            enriched: false,
        });
        await queues_1.eventsRawQueue.add('pixel_event', {
            pixelEventId: doc._id.toString(),
        }, {
            attempts: 5,
            backoff: { type: 'exponential', delay: 1000 },
            removeOnComplete: true,
            removeOnFail: false,
        });
        res.status(202).json({ status: 'enqueued', id: doc._id });
    }
    catch (err) {
        console.error('pixel ingest error', err);
        res.status(500).json({ message: 'Failed to ingest pixel event', error: err.message });
    }
});
