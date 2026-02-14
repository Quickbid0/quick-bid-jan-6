"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellersRouter = void 0;
const express_1 = __importDefault(require("express"));
const getSellerInfo_service_1 = require("../services/getSellerInfo.service");
exports.sellersRouter = express_1.default.Router();
exports.sellersRouter.get('/sellers/:sellerId', async (req, res, next) => {
    try {
        const { sellerId } = req.params;
        if (!sellerId) {
            return res.status(400).json({ error: 'sellerId is required' });
        }
        const info = await (0, getSellerInfo_service_1.getSellerInfo)(sellerId);
        if (!info) {
            return res.status(404).json({ error: 'Seller not found' });
        }
        res.json(info);
    }
    catch (err) {
        next(err);
    }
});
