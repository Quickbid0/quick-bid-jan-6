import { Request, Response } from 'express';
import { AuthedRequest } from '../../../middleware/authMiddleware';
import {
  createCampaign,
  deleteCampaign,
  getCampaignById,
  getCampaigns,
  updateCampaign,
} from '../services/marketingCampaigns.service';

export const handleCreateCampaign = async (req: AuthedRequest, res: Response) => {
  try {
    const campaign = await createCampaign({
      ...req.body,
      created_by: req.user?.id || 'system',
    });
    return res.status(201).json(campaign);
  } catch (err) {
    console.error('create campaign error', err);
    return res.status(500).json({ message: 'Unable to create campaign' });
  }
};

export const handleGetCampaigns = async (_req: Request, res: Response) => {
  try {
    const campaigns = await getCampaigns();
    return res.status(200).json(campaigns);
  } catch (err) {
    console.error('list campaigns error', err);
    return res.status(500).json({ message: 'Unable to list campaigns' });
  }
};

export const handleGetCampaignById = async (req: Request, res: Response) => {
  try {
    const campaign = await getCampaignById(req.params.id);
    return res.status(200).json(campaign);
  } catch (err) {
    console.error('get campaign error', err);
    return res.status(404).json({ message: (err as Error).message });
  }
};

export const handleUpdateCampaign = async (req: Request, res: Response) => {
  try {
    const campaign = await updateCampaign(req.params.id, req.body);
    return res.status(200).json(campaign);
  } catch (err) {
    console.error('update campaign error', err);
    return res.status(500).json({ message: 'Unable to update campaign' });
  }
};

export const handleDeleteCampaign = async (req: Request, res: Response) => {
  try {
    await deleteCampaign(req.params.id);
    return res.status(204).send();
  } catch (err) {
    console.error('delete campaign error', err);
    return res.status(500).json({ message: 'Unable to delete campaign' });
  }
};
