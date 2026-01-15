import { Router } from 'express';
import {
  createCampaign,
  listCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
} from '../services/campaign.service';

export const campaignRouter = Router();

campaignRouter.post('/campaigns', async (req, res, next) => {
  try {
    const campaign = await createCampaign(req.body);
    res.status(201).json(campaign);
  } catch (err) {
    next(err);
  }
});

campaignRouter.get('/campaigns', async (_req, res, next) => {
  try {
    const campaigns = await listCampaigns();
    res.json(campaigns);
  } catch (err) {
    next(err);
  }
});

campaignRouter.get('/campaigns/:id', async (req, res, next) => {
  try {
    const campaign = await getCampaignById(req.params.id);
    if (!campaign) {
      res.status(404).json({ message: 'Campaign not found' });
      return;
    }
    res.json(campaign);
  } catch (err) {
    next(err);
  }
});

campaignRouter.patch('/campaigns/:id', async (req, res, next) => {
  try {
    const campaign = await updateCampaign(req.params.id, req.body);
    if (!campaign) {
      res.status(404).json({ message: 'Campaign not found' });
      return;
    }
    res.json(campaign);
  } catch (err) {
    next(err);
  }
});

campaignRouter.delete('/campaigns/:id', async (req, res, next) => {
  try {
    await deleteCampaign(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
