"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLaunchStatus = exports.handleScheduleCampaign = exports.handleLaunchCampaign = void 0;
const campaignLauncher_service_1 = require("../services/campaignLauncher.service");
const handleLaunchCampaign = async (req, res) => {
    const { id: campaignId } = req.params;
    try {
        const log = await (0, campaignLauncher_service_1.logCampaignEvent)({
            campaign_id: campaignId,
            status: 'launched',
            payload: { triggeredBy: req.user?.id, timestamp: new Date().toISOString() },
        });
        return res.status(201).json(log);
    }
    catch (err) {
        console.error('campaign launch error', err);
        return res.status(500).json({ message: 'Unable to record launch' });
    }
};
exports.handleLaunchCampaign = handleLaunchCampaign;
const handleScheduleCampaign = async (req, res) => {
    const { id: campaignId } = req.params;
    const { scheduled_at } = req.body;
    if (!scheduled_at) {
        return res.status(400).json({ message: 'scheduled_at is required' });
    }
    try {
        const schedule = await (0, campaignLauncher_service_1.scheduleCampaign)(campaignId, scheduled_at);
        return res.status(201).json(schedule);
    }
    catch (err) {
        console.error('schedule campaign error', err);
        return res.status(500).json({ message: 'Unable to schedule campaign' });
    }
};
exports.handleScheduleCampaign = handleScheduleCampaign;
const handleLaunchStatus = async (req, res) => {
    return res.status(200).json({ message: 'status placeholder' });
};
exports.handleLaunchStatus = handleLaunchStatus;
