"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSalesMe = exports.handleSalesLogout = exports.handleSalesLogin = void 0;
const salesAuth_service_1 = require("../services/salesAuth.service");
const jwt_1 = require("../../../utils/jwt");
const handleSalesLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    try {
        const loginResult = await (0, salesAuth_service_1.loginSalesUser)(email, password);
        return res.status(200).json(loginResult);
    }
    catch (err) {
        console.error('sales login error', err);
        return res.status(401).json({ message: err.message || 'Invalid credentials' });
    }
};
exports.handleSalesLogin = handleSalesLogin;
const handleSalesLogout = (_req, res) => {
    return res.status(200).json({ message: 'Logout successful. Discard token client-side.' });
};
exports.handleSalesLogout = handleSalesLogout;
const handleSalesMe = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Missing authorization header' });
    }
    try {
        const token = authHeader.substring('Bearer '.length);
        const payload = (0, jwt_1.verifyToken)(token);
        const user = await (0, salesAuth_service_1.findSalesUserById)(payload.sub);
        if (!user) {
            return res.status(404).json({ message: 'Sales user not found' });
        }
        const { password_hash, ...rest } = user;
        return res.status(200).json({ user: rest });
    }
    catch (err) {
        console.error('sales me error', err);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
exports.handleSalesMe = handleSalesMe;
