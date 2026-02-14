"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSalesAuth = void 0;
const jwt_1 = require("../../../utils/jwt");
const salesAuth_service_1 = require("../services/salesAuth.service");
const requireSalesAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Missing authorization header' });
    }
    try {
        const token = authHeader.substring('Bearer '.length);
        const payload = (0, jwt_1.verifyToken)(token);
        if (payload.role !== 'sales') {
            return res.status(403).json({ message: 'Forbidden: sales access required' });
        }
        const user = await (0, salesAuth_service_1.findSalesUserById)(payload.sub);
        if (!user || user.status !== 'active') {
            return res.status(403).json({ message: 'Sales user is inactive' });
        }
        req.user = {
            id: payload.sub,
            role: payload.role,
        };
        res.locals.salesUser = user;
        return next();
    }
    catch (err) {
        console.error('requireSalesAuth error', err);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
exports.requireSalesAuth = requireSalesAuth;
