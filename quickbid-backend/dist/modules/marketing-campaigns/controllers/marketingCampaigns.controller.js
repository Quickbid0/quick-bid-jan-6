"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDeleteCampaign = exports.handleUpdateCampaign = exports.handleGetCampaignById = exports.handleGetCampaigns = exports.handleCreateCampaign = void 0;
const marketingCampaigns_service_1 = require("../services/marketingCampaigns.service");
const handleCreateCampaign = async (req, res) => {
    try {
        const campaign = await (0, marketingCampaigns_service_1.createCampaign)({
            ...req.body,
            created_by: req.user?.id || 'system',
        });
        return res.status(201).json(campaign);
    }
    catch (err) {
        console.error('create campaign error', err);
        return res.status(500).json({ message: 'Unable to create campaign' });
    }
};
exports.handleCreateCampaign = handleCreateCampaign;
const handleGetCampaigns = async (_req, res) => {
    try {
        const campaigns = await (0, marketingCampaigns_service_1.getCampaigns)();
        return res.status(200).json(campaigns);
    }
    catch (err) {
        console.error('list campaigns error', err);
        return res.status(500).json({ message: 'Unable to list campaigns' });
    }
};
exports.handleGetCampaigns = handleGetCampaigns;
const handleGetCampaignById = async (req, res) => {
    try {
        const campaign = await (0, marketingCampaigns_service_1.getCampaignById)(req.params.id);
        return res.status(200).json(campaign);
    }
    catch (err) {
        console.error('get campaign error', err);
        return res.status(404).json({ message: err.message });
    }
};
exports.handleGetCampaignById = handleGetCampaignById;
const handleUpdateCampaign = async (req, res) => {
    try {
        const campaign = await (0, marketingCampaigns_service_1.updateCampaign)(req.params.id, req.body);
        return res.status(200).json(campaign);
    }
    catch (err) {
        console.error('update campaign error', err);
        return res.status(500).json({ message: 'Unable to update campaign' });
    }
};
exports.handleUpdateCampaign = handleUpdateCampaign;
const handleDeleteCampaign = async (req, res) => {
    try {
        await (0, marketingCampaigns_service_1.deleteCampaign)(req.params.id);
        return res.status(204).send();
    }
    catch (err) {
        console.error('delete campaign error', err);
        return res.status(500).json({ message: 'Unable to delete campaign' });
    }
};
exports.handleDeleteCampaign = handleDeleteCampaign;
