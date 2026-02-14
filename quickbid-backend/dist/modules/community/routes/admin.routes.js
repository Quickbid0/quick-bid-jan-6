"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminCommunityRouter = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../../../middleware/authMiddleware");
const admin_controller_1 = require("../controllers/admin.controller");
exports.adminCommunityRouter = (0, express_1.Router)();
// All admin community routes require authenticated admin
exports.adminCommunityRouter.use(authMiddleware_1.requireAuth, authMiddleware_1.requireAdmin);
exports.adminCommunityRouter.get('/analytics/overview', admin_controller_1.getCommunityOverviewAnalytics);
exports.adminCommunityRouter.get('/analytics/social-links', admin_controller_1.getSocialLinksAnalytics);
exports.adminCommunityRouter.post('/broadcast/whatsapp', admin_controller_1.sendWhatsappBroadcast);
exports.adminCommunityRouter.post('/broadcast/telegram', admin_controller_1.sendTelegramBroadcast);
