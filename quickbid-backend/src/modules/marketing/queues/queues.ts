import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

export const EVENTS_RAW_QUEUE = 'events-raw';
export const SEGMENT_UPDATES_QUEUE = 'segment-updates';
export const AUTOMATIONS_QUEUE = 'automations';
export const ADS_SYNC_QUEUE = 'ads-sync';
export const NOTIFICATIONS_QUEUE = 'notifications';

export const eventsRawQueue = new Queue(EVENTS_RAW_QUEUE, { connection });
export const segmentUpdatesQueue = new Queue(SEGMENT_UPDATES_QUEUE, { connection });
export const automationsQueue = new Queue(AUTOMATIONS_QUEUE, { connection });
export const adsSyncQueue = new Queue(ADS_SYNC_QUEUE, { connection });
export const notificationsQueue = new Queue(NOTIFICATIONS_QUEUE, { connection });
