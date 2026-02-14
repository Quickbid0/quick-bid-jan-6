"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.payoutsRouter = void 0;
const express_1 = __importDefault(require("express"));
const supabaseAdmin_1 = require("../../../supabaseAdmin");
const authMiddleware_1 = require("../../../middleware/authMiddleware");
exports.payoutsRouter = express_1.default.Router();
const requireAdminOrSuperAdmin = (req, res, next) => {
    const role = req.user?.role;
    if (role !== 'admin' && role !== 'superadmin') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    next();
};
// Admin endpoint: list payouts with optional seller/status filters
exports.payoutsRouter.get('/admin/payouts', authMiddleware_1.requireAuth, requireAdminOrSuperAdmin, async (req, res, next) => {
    try {
        if (!supabaseAdmin_1.supabaseAdmin) {
            return res.status(500).json({ error: 'Supabase admin not configured' });
        }
        const sellerId = req.query.sellerId || null;
        const status = req.query.status || null;
        let q = supabaseAdmin_1.supabaseAdmin
            .from('payouts')
            .select(`
          id,
          seller_id,
          status,
          sale_price,
          commission_amount,
          net_payout,
          payout_reference,
          created_at,
          paid_at,
          seller:profiles(id, name, email, phone)
        `);
        if (sellerId) {
            q = q.eq('seller_id', sellerId);
        }
        if (status) {
            q = q.eq('status', status);
        }
        const { data, error } = await q.order('created_at', { ascending: false });
        if (error) {
            console.error('admin payouts list error', error);
            return res.status(500).json({ error: 'Failed to load payouts' });
        }
        return res.json(data || []);
    }
    catch (err) {
        next(err);
    }
});
