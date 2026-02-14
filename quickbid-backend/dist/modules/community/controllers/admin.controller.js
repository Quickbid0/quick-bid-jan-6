"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTelegramBroadcast = exports.sendWhatsappBroadcast = exports.getSocialLinksAnalytics = exports.getCommunityOverviewAnalytics = void 0;
const socialLink_service_1 = require("../services/socialLink.service");
const CommunityPost_1 = require("../models/CommunityPost");
const Follow_1 = require("../models/Follow");
const whatsapp_service_1 = require("../integrations/whatsapp.service");
const telegram_service_1 = require("../integrations/telegram.service");
const getCommunityOverviewAnalytics = async (_req, res, next) => {
    try {
        const [postCount, userFollowCount, socialLinkAnalytics] = await Promise.all([
            CommunityPost_1.CommunityPost.countDocuments({}),
            Follow_1.Follow.countDocuments({}),
            socialLink_service_1.SocialLinkService.analytics(),
        ]);
        res.json({
            data: {
                totalPosts: postCount,
                totalFollows: userFollowCount,
                socialLinks: socialLinkAnalytics,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getCommunityOverviewAnalytics = getCommunityOverviewAnalytics;
const getSocialLinksAnalytics = async (_req, res, next) => {
    try {
        const analytics = await socialLink_service_1.SocialLinkService.analytics();
        res.json({ data: analytics });
    }
    catch (err) {
        next(err);
    }
};
exports.getSocialLinksAnalytics = getSocialLinksAnalytics;
const sendWhatsappBroadcast = async (req, res, next) => {
    try {
        const { message, links } = req.body;
        const result = await whatsapp_service_1.WhatsappService.sendBroadcast(message, links || []);
        res.status(202).json({ data: result });
    }
    catch (err) {
        next(err);
    }
};
exports.sendWhatsappBroadcast = sendWhatsappBroadcast;
const sendTelegramBroadcast = async (req, res, next) => {
    try {
        const { message, links } = req.body;
        const result = await telegram_service_1.TelegramService.sendBroadcast(message, links || []);
        res.status(202).json({ data: result });
    }
    catch (err) {
        next(err);
    }
};
exports.sendTelegramBroadcast = sendTelegramBroadcast;
