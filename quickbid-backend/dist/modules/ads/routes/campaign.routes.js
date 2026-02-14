"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignRouter = void 0;
const express_1 = require("express");
const campaign_service_1 = require("../services/campaign.service");
exports.campaignRouter = (0, express_1.Router)();
exports.campaignRouter.post('/campaigns', async (req, res, next) => {
    try {
        const campaign = await (0, campaign_service_1.createCampaign)(req.body);
        res.status(201).json(campaign);
    }
    catch (err) {
        next(err);
    }
});
exports.campaignRouter.get('/campaigns', async (_req, res, next) => {
    try {
        const campaigns = await (0, campaign_service_1.listCampaigns)();
        res.json(campaigns);
    }
    catch (err) {
        next(err);
    }
});
exports.campaignRouter.get('/campaigns/:id', async (req, res, next) => {
    try {
        const campaign = await (0, campaign_service_1.getCampaignById)(req.params.id);
        if (!campaign) {
            res.status(404).json({ message: 'Campaign not found' });
            return;
        }
        res.json(campaign);
    }
    catch (err) {
        next(err);
    }
});
exports.campaignRouter.patch('/campaigns/:id', async (req, res, next) => {
    try {
        const campaign = await (0, campaign_service_1.updateCampaign)(req.params.id, req.body);
        if (!campaign) {
            res.status(404).json({ message: 'Campaign not found' });
            return;
        }
        res.json(campaign);
    }
    catch (err) {
        next(err);
    }
});
exports.campaignRouter.delete('/campaigns/:id', async (req, res, next) => {
    try {
        await (0, campaign_service_1.deleteCampaign)(req.params.id);
        res.status(204).end();
    }
    catch (err) {
        next(err);
    }
});
