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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const queues_1 = require("../modules/marketing/queues/queues");
const pixelEvent_model_1 = require("../modules/marketing/models/pixelEvent.model");
const connection = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379');
const worker = new bullmq_1.Worker(queues_1.EVENTS_RAW_QUEUE, async (job) => {
    const { pixelEventId } = job.data;
    if (!pixelEventId)
        return;
    const evt = await pixelEvent_model_1.PixelEventModel.findById(pixelEventId);
    if (!evt)
        return;
    // TODO: add real UA/geo enrichment here
    evt.enriched = true;
    await evt.save();
    const { segmentUpdatesQueue } = await Promise.resolve().then(() => __importStar(require('../modules/marketing/queues/queues')));
    await segmentUpdatesQueue.add('segment_update', {
        pixelEventId,
        user_id: evt.user_id,
        visitor_id: evt.visitor_id,
        event: evt.event,
        ts: evt.ts,
    }, {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
    });
}, {
    connection,
});
worker.on('completed', (job) => {
    console.log(`enrichmentWorker completed job ${job.id}`);
});
worker.on('failed', (job, err) => {
    console.error(`enrichmentWorker failed job ${job?.id}`, err);
});
