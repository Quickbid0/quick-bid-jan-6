import express from 'express';
import {
  handleLaunchCampaign,
  handleLaunchStatus,
  handleScheduleCampaign,
} from '../controllers/campaignLauncher.controller';
import { requireAdminAuth } from '../../rbac/middleware/roleAuth';

export const campaignLauncherRouter = express.Router();

campaignLauncherRouter.post('/marketing/campaigns/:id/launch', requireAdminAuth, handleLaunchCampaign);
campaignLauncherRouter.post('/marketing/campaigns/:id/schedule', requireAdminAuth, handleScheduleCampaign);
campaignLauncherRouter.get('/marketing/campaigns/:id/status', requireAdminAuth, handleLaunchStatus);
