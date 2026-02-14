"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialLinkService = void 0;
const SocialGroupLink_1 = require("../models/SocialGroupLink");
exports.SocialLinkService = {
    async list(filter) {
        const query = {};
        if (filter.platform) {
            query.platform = filter.platform;
        }
        if (filter.visibleOnly) {
            query.isVisible = true;
        }
        if (filter.tags && filter.tags.length) {
            query.tags = { $in: filter.tags };
        }
        return SocialGroupLink_1.SocialGroupLink.find(query).sort({ createdAt: -1 }).lean();
    },
    async create(payload) {
        const doc = new SocialGroupLink_1.SocialGroupLink(payload);
        return doc.save();
    },
    async update(id, payload) {
        return SocialGroupLink_1.SocialGroupLink.findByIdAndUpdate(id, payload, { new: true });
    },
    async toggleVisibility(id, isVisible) {
        return SocialGroupLink_1.SocialGroupLink.findByIdAndUpdate(id, { isVisible }, { new: true });
    },
    async incrementClick(id) {
        return SocialGroupLink_1.SocialGroupLink.findByIdAndUpdate(id, { $inc: { clickCount: 1 } }, { new: true });
    },
    async incrementJoin(id) {
        return SocialGroupLink_1.SocialGroupLink.findByIdAndUpdate(id, { $inc: { joinCount: 1 } }, { new: true });
    },
    async analytics() {
        return SocialGroupLink_1.SocialGroupLink.aggregate([
            {
                $group: {
                    _id: { platform: '$platform', tag: '$tags' },
                    totalClicks: { $sum: '$clickCount' },
                    totalJoins: { $sum: '$joinCount' },
                    count: { $sum: 1 },
                },
            },
        ]);
    },
};
