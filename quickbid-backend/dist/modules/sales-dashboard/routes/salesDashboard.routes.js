"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.salesDashboardRouter = void 0;
const express_1 = __importDefault(require("express"));
const salesDashboard_controller_1 = require("../controllers/salesDashboard.controller");
const requireSalesAuth_1 = require("../../sales-auth/middleware/requireSalesAuth");
exports.salesDashboardRouter = express_1.default.Router();
exports.salesDashboardRouter.get('/sales/dashboard', requireSalesAuth_1.requireSalesAuth, salesDashboard_controller_1.handleDashboardSummary);
exports.salesDashboardRouter.get('/sales/leads', requireSalesAuth_1.requireSalesAuth, salesDashboard_controller_1.handleListLeads);
exports.salesDashboardRouter.post('/sales/leads', requireSalesAuth_1.requireSalesAuth, salesDashboard_controller_1.handleCreateLead);
exports.salesDashboardRouter.put('/sales/leads/:id', requireSalesAuth_1.requireSalesAuth, salesDashboard_controller_1.handleUpdateLead);
exports.salesDashboardRouter.delete('/sales/leads/:id', requireSalesAuth_1.requireSalesAuth, salesDashboard_controller_1.handleDeleteLead);
