import { Campaign } from '../models/Campaign';
import { AdSlot } from '../models/AdSlot';
import { AdImpression } from '../models/AdImpression';

export interface AdContext {
  eventId?: string;
  slotType:
    | 'pre_roll'
    | 'mid_roll'
    | 'post_roll'
    | 'banner_left'
    | 'banner_bottom'
    | 'banner_right'
    | 'ticker'
    | 'popup_card'
    | 'timer_extension';
}

export interface AdInjectPayload {
  slotType: AdContext['slotType'];
  creativeUrl: string;
  durationSec: number;
  campaignId: string;
  slotId: string;
   sponsorId: string;
}

export async function selectAdForContext(ctx: AdContext): Promise<AdInjectPayload | null> {
  const now = new Date();

  const slots = await AdSlot.find({
    slotType: ctx.slotType,
    active: true,
  }).lean();

  if (!slots.length) return null;

  const slot = slots[0];

  const campaigns = await Campaign.find({
    slotIds: slot._id,
    status: 'active',
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).lean();

  if (!campaigns.length) return null;

  const campaign = campaigns[Math.floor(Math.random() * campaigns.length)];

  const durationSec = slot.durationSec || 10;

  return {
    slotType: ctx.slotType,
    creativeUrl: campaign.creativeUrl,
    durationSec,
    campaignId: campaign.campaignId,
    slotId: slot.slotId,
    sponsorId: campaign.sponsorId,
  };
}

export async function recordImpression(params: {
  sponsorId: string;
  slotId: string;
  campaignId: string;
  eventId?: string;
  userId?: string;
  durationMs: number;
  clicked: boolean;
}) {
  const { sponsorId, slotId, campaignId, eventId, userId, durationMs, clicked } = params;
  await AdImpression.create({
    sponsorId,
    slotId,
    campaignId,
    eventId,
    userId,
    durationMs,
    clicked,
    timestamp: new Date(),
  });
}
