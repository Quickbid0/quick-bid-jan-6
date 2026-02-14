"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsQueue = exports.adsSyncQueue = exports.automationsQueue = exports.segmentUpdatesQueue = exports.eventsRawQueue = exports.NOTIFICATIONS_QUEUE = exports.ADS_SYNC_QUEUE = exports.AUTOMATIONS_QUEUE = exports.SEGMENT_UPDATES_QUEUE = exports.EVENTS_RAW_QUEUE = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const connection = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379');
exports.EVENTS_RAW_QUEUE = 'events-raw';
exports.SEGMENT_UPDATES_QUEUE = 'segment-updates';
exports.AUTOMATIONS_QUEUE = 'automations';
exports.ADS_SYNC_QUEUE = 'ads-sync';
exports.NOTIFICATIONS_QUEUE = 'notifications';
exports.eventsRawQueue = new bullmq_1.Queue(exports.EVENTS_RAW_QUEUE, { connection });
exports.segmentUpdatesQueue = new bullmq_1.Queue(exports.SEGMENT_UPDATES_QUEUE, { connection });
exports.automationsQueue = new bullmq_1.Queue(exports.AUTOMATIONS_QUEUE, { connection });
exports.adsSyncQueue = new bullmq_1.Queue(exports.ADS_SYNC_QUEUE, { connection });
exports.notificationsQueue = new bullmq_1.Queue(exports.NOTIFICATIONS_QUEUE, { connection });
