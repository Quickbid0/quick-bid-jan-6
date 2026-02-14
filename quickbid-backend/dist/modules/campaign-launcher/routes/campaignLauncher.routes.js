"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignLauncherRouter = void 0;
const express_1 = __importDefault(require("express"));
const campaignLauncher_controller_1 = require("../controllers/campaignLauncher.controller");
const roleAuth_1 = require("../../rbac/middleware/roleAuth");
exports.campaignLauncherRouter = express_1.default.Router();
exports.campaignLauncherRouter.post('/marketing/campaigns/:id/launch', roleAuth_1.requireAdminAuth, campaignLauncher_controller_1.handleLaunchCampaign);
exports.campaignLauncherRouter.post('/marketing/campaigns/:id/schedule', roleAuth_1.requireAdminAuth, campaignLauncher_controller_1.handleScheduleCampaign);
exports.campaignLauncherRouter.get('/marketing/campaigns/:id/status', roleAuth_1.requireAdminAuth, campaignLauncher_controller_1.handleLaunchStatus);
