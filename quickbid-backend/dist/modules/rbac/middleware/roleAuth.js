"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdminAuth = exports.requireMarketingAuth = exports.requireSalesAuth = exports.requireAnyAuth = void 0;
const jwt_1 = require("../../../utils/jwt");
const extractBearerToken = (req) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return null;
    }
    return header.substring('Bearer '.length);
};
const requireRole = (role, allowedRoles) => {
    return (req, res, next) => {
        const token = extractBearerToken(req);
        if (!token) {
            return res.status(401).json({ message: 'Missing authorization header' });
        }
        try {
            const payload = (0, jwt_1.verifyToken)(token);
            if (!payload?.sub) {
                return res.status(401).json({ message: 'Invalid token payload' });
            }
            if (role && payload.role !== role) {
                return res.status(403).json({ message: 'Forbidden: insufficient role' });
            }
            if (allowedRoles && !allowedRoles.includes(payload.role)) {
                return res.status(403).json({ message: 'Forbidden: insufficient role' });
            }
            req.user = {
                id: payload.sub,
                role: payload.role,
            };
            res.locals.user = payload;
            return next();
        }
        catch (err) {
            console.error('roleAuth error', err);
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
    };
};
exports.requireAnyAuth = requireRole();
exports.requireSalesAuth = requireRole('sales');
exports.requireMarketingAuth = requireRole('marketing');
exports.requireAdminAuth = requireRole('admin');
