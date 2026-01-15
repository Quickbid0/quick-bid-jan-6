import { Request, Response } from 'express';
import { AuthedRequest } from '../../../middleware/authMiddleware';
import { logCampaignEvent, scheduleCampaign } from '../services/campaignLauncher.service';

export const handleLaunchCampaign = async (req: AuthedRequest, res: Response) => {
  const { id: campaignId } = req.params;
  try {
    const log = await logCampaignEvent({
      campaign_id: campaignId,
      status: 'launched',
      payload: { triggeredBy: req.user?.id, timestamp: new Date().toISOString() },
    });
    return res.status(201).json(log);
  } catch (err) {
    console.error('campaign launch error', err);
    return res.status(500).json({ message: 'Unable to record launch' });
  }
};

export const handleScheduleCampaign = async (req: AuthedRequest, res: Response) => {
  const { id: campaignId } = req.params;
  const { scheduled_at } = req.body;
  if (!scheduled_at) {
    return res.status(400).json({ message: 'scheduled_at is required' });
  }

  try {
    const schedule = await scheduleCampaign(campaignId, scheduled_at);
    return res.status(201).json(schedule);
  } catch (err) {
    console.error('schedule campaign error', err);
    return res.status(500).json({ message: 'Unable to schedule campaign' });
  }
};

export const handleLaunchStatus = async (req: Request, res: Response) => {
  return res.status(200).json({ message: 'status placeholder' });
};
