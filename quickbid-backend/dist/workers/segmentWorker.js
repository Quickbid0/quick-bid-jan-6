"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const queues_1 = require("../modules/marketing/queues/queues");
const pixelEvent_model_1 = require("../modules/marketing/models/pixelEvent.model");
const segment_model_1 = require("../modules/marketing/models/segment.model");
const connection = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379');
function isWithinDays(ts, days) {
    const now = new Date();
    const diffMs = now.getTime() - ts.getTime();
    return diffMs <= days * 24 * 60 * 60 * 1000;
}
const worker = new bullmq_1.Worker(queues_1.SEGMENT_UPDATES_QUEUE, async (job) => {
    const { pixelEventId, user_id, visitor_id, event, ts } = job.data;
    const eventTime = ts instanceof Date ? ts : new Date(ts);
    const evt = await pixelEvent_model_1.PixelEventModel.findById(pixelEventId).lean();
    if (!evt)
        return;
    const userKey = user_id || evt.user_id || null;
    const visitorKey = visitor_id || evt.visitor_id || null;
    const membershipIds = [];
    if (userKey)
        membershipIds.push(`user:${userKey}`);
    if (!userKey && visitorKey)
        membershipIds.push(`visitor:${visitorKey}`);
    if (!membershipIds.length)
        return;
    // Example built-in segments. Later we can drive this entirely from SegmentModel.criteria_json
    const segments = [
        {
            name: 'viewed_auction_last_7d',
            match: () => event === 'auction_view' && isWithinDays(eventTime, 7),
        },
        {
            name: 'first_deposit',
            match: () => event === 'deposit_added' && !!(evt.metadata && evt.metadata.first_time),
        },
    ];
    for (const seg of segments) {
        if (!seg.match())
            continue;
        const existing = await segment_model_1.SegmentModel.findOne({ name: seg.name });
        if (!existing) {
            await segment_model_1.SegmentModel.create({
                name: seg.name,
                criteria_json: { system: true },
                last_evaluated_at: new Date(),
                size: membershipIds.length,
            });
        }
        else {
            existing.last_evaluated_at = new Date();
            existing.size += membershipIds.length;
            await existing.save();
        }
        // TODO: store per-segment membership in dedicated collection/Redis for fast lookup
    }
}, {
    connection,
});
worker.on('completed', (job) => {
    console.log(`segmentWorker completed job ${job.id}`);
});
worker.on('failed', (job, err) => {
    console.error(`segmentWorker failed job ${job?.id}`, err);
});
