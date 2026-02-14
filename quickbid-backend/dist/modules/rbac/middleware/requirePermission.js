"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = void 0;
const UserRole_1 = require("../models/UserRole");
const Role_1 = require("../models/Role");
const Permission_1 = require("../models/Permission");
const RolePermission_1 = require("../models/RolePermission");
const requirePermission = (permissionKey) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const supabaseUserId = req.user.id;
        try {
            const userRoles = await UserRole_1.UserRole.find({
                supabaseUserId,
                status: 'active',
            }).lean();
            if (!userRoles.length) {
                return res.status(403).json({ message: 'Forbidden: no active roles' });
            }
            const roleIds = userRoles.map((r) => r.roleId);
            const roles = await Role_1.Role.find({ _id: { $in: roleIds } }).lean();
            const isSuperAdmin = roles.some((r) => r.key === 'super_admin');
            if (isSuperAdmin) {
                return next();
            }
            const permission = await Permission_1.Permission.findOne({ key: permissionKey }).lean();
            if (!permission) {
                return res.status(500).json({ message: 'Permission not configured', permissionKey });
            }
            const rolePermission = await RolePermission_1.RolePermission.findOne({
                roleId: { $in: roleIds },
                permissionId: permission._id,
                allowed: true,
            }).lean();
            if (!rolePermission) {
                return res.status(403).json({ message: 'Forbidden: missing permission', permissionKey });
            }
            // TODO: enforce branch/state/mandal/department scope constraints here using userRoles + rolePermission.constraints
            return next();
        }
        catch (err) {
            console.error('requirePermission error', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };
};
exports.requirePermission = requirePermission;
