"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSalesUser = exports.findSalesUserById = exports.findSalesUserByEmail = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const supabaseAdmin_1 = require("../../../supabaseAdmin");
const jwt_1 = require("../../../utils/jwt");
const ensureSupabase = () => {
    if (!supabaseAdmin_1.supabaseAdmin) {
        throw new Error('Supabase admin client is not configured');
    }
    return supabaseAdmin_1.supabaseAdmin;
};
const sanitizeUser = (user) => {
    const { password_hash, ...rest } = user;
    return rest;
};
const findSalesUserByEmail = async (email) => {
    const client = ensureSupabase();
    const { data, error } = await client
        .from('sales_users')
        .select('*')
        .eq('email', email)
        .maybeSingle();
    if (error) {
        throw error;
    }
    return data || null;
};
exports.findSalesUserByEmail = findSalesUserByEmail;
const findSalesUserById = async (id) => {
    const client = ensureSupabase();
    const { data, error } = await client
        .from('sales_users')
        .select('*')
        .eq('id', id)
        .maybeSingle();
    if (error) {
        throw error;
    }
    return data || null;
};
exports.findSalesUserById = findSalesUserById;
const loginSalesUser = async (email, password) => {
    const user = await (0, exports.findSalesUserByEmail)(email);
    if (!user || user.status !== 'active') {
        throw new Error('Invalid credentials');
    }
    const matches = await bcrypt_1.default.compare(password, user.password_hash);
    if (!matches) {
        throw new Error('Invalid credentials');
    }
    const token = (0, jwt_1.signToken)({
        sub: user.id,
        role: 'sales',
        email: user.email,
    });
    return {
        token,
        user: sanitizeUser(user),
    };
};
exports.loginSalesUser = loginSalesUser;
