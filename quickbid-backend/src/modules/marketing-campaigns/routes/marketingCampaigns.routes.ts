import express from 'express';
import {
  handleCreateCampaign,
  handleDeleteCampaign,
  handleGetCampaignById,
  handleGetCampaigns,
  handleUpdateCampaign,
} from '../controllers/marketingCampaigns.controller';
import { requireAdminAuth } from '../../rbac/middleware/roleAuth';

export const marketingCampaignRouter = express.Router();

marketingCampaignRouter.post('/campaigns', requireAdminAuth, handleCreateCampaign);
marketingCampaignRouter.get('/campaigns', requireAdminAuth, handleGetCampaigns);
marketingCampaignRouter.get('/campaigns/:id', requireAdminAuth, handleGetCampaignById);
marketingCampaignRouter.put('/campaigns/:id', requireAdminAuth, handleUpdateCampaign);
marketingCampaignRouter.delete('/campaigns/:id', requireAdminAuth, handleDeleteCampaign);
