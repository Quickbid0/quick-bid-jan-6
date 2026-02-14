"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialLinkAnalytics = exports.trackSocialLinkJoin = exports.trackSocialLinkClick = exports.toggleSocialLinkVisibility = exports.updateSocialLink = exports.createSocialLink = exports.listSocialLinks = void 0;
const socialLink_service_1 = require("../services/socialLink.service");
const listSocialLinks = async (req, res, next) => {
    try {
        const { platform, tags, visibleOnly } = req.query;
        const tagArray = typeof tags === 'string' ? tags.split(',') : undefined;
        const links = await socialLink_service_1.SocialLinkService.list({
            platform: platform,
            tags: tagArray,
            visibleOnly: visibleOnly === 'true',
        });
        res.json({ data: links });
    }
    catch (err) {
        next(err);
    }
};
exports.listSocialLinks = listSocialLinks;
const createSocialLink = async (req, res, next) => {
    try {
        const created = await socialLink_service_1.SocialLinkService.create(req.body);
        res.status(201).json({ data: created });
    }
    catch (err) {
        next(err);
    }
};
exports.createSocialLink = createSocialLink;
const updateSocialLink = async (req, res, next) => {
    try {
        const updated = await socialLink_service_1.SocialLinkService.update(req.params.id, req.body);
        res.json({ data: updated });
    }
    catch (err) {
        next(err);
    }
};
exports.updateSocialLink = updateSocialLink;
const toggleSocialLinkVisibility = async (req, res, next) => {
    try {
        const { isVisible } = req.body;
        const updated = await socialLink_service_1.SocialLinkService.toggleVisibility(req.params.id, Boolean(isVisible));
        res.json({ data: updated });
    }
    catch (err) {
        next(err);
    }
};
exports.toggleSocialLinkVisibility = toggleSocialLinkVisibility;
const trackSocialLinkClick = async (req, res, next) => {
    try {
        const updated = await socialLink_service_1.SocialLinkService.incrementClick(req.params.id);
        res.json({ data: updated });
    }
    catch (err) {
        next(err);
    }
};
exports.trackSocialLinkClick = trackSocialLinkClick;
const trackSocialLinkJoin = async (req, res, next) => {
    try {
        const updated = await socialLink_service_1.SocialLinkService.incrementJoin(req.params.id);
        res.json({ data: updated });
    }
    catch (err) {
        next(err);
    }
};
exports.trackSocialLinkJoin = trackSocialLinkJoin;
const socialLinkAnalytics = async (_req, res, next) => {
    try {
        const data = await socialLink_service_1.SocialLinkService.analytics();
        res.json({ data });
    }
    catch (err) {
        next(err);
    }
};
exports.socialLinkAnalytics = socialLinkAnalytics;
