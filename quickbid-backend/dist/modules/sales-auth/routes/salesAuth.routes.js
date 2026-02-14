"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.salesAuthRouter = void 0;
const express_1 = __importDefault(require("express"));
const salesAuth_controller_1 = require("../controllers/salesAuth.controller");
const requireSalesAuth_1 = require("../middleware/requireSalesAuth");
exports.salesAuthRouter = express_1.default.Router();
exports.salesAuthRouter.post('/sales/auth/login', salesAuth_controller_1.handleSalesLogin);
exports.salesAuthRouter.post('/sales/auth/logout', requireSalesAuth_1.requireSalesAuth, salesAuth_controller_1.handleSalesLogout);
exports.salesAuthRouter.get('/sales/auth/me', requireSalesAuth_1.requireSalesAuth, salesAuth_controller_1.handleSalesMe);
