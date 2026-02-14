"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketingCampaignRouter = void 0;
const express_1 = __importDefault(require("express"));
const marketingCampaigns_controller_1 = require("../controllers/marketingCampaigns.controller");
const roleAuth_1 = require("../../rbac/middleware/roleAuth");
exports.marketingCampaignRouter = express_1.default.Router();
exports.marketingCampaignRouter.post('/campaigns', roleAuth_1.requireAdminAuth, marketingCampaigns_controller_1.handleCreateCampaign);
exports.marketingCampaignRouter.get('/campaigns', roleAuth_1.requireAdminAuth, marketingCampaigns_controller_1.handleGetCampaigns);
exports.marketingCampaignRouter.get('/campaigns/:id', roleAuth_1.requireAdminAuth, marketingCampaigns_controller_1.handleGetCampaignById);
exports.marketingCampaignRouter.put('/campaigns/:id', roleAuth_1.requireAdminAuth, marketingCampaigns_controller_1.handleUpdateCampaign);
exports.marketingCampaignRouter.delete('/campaigns/:id', roleAuth_1.requireAdminAuth, marketingCampaigns_controller_1.handleDeleteCampaign);
