"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rbacRouter = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../../../middleware/authMiddleware");
const requirePermission_1 = require("../middleware/requirePermission");
const Role_1 = require("../models/Role");
const Permission_1 = require("../models/Permission");
const RolePermission_1 = require("../models/RolePermission");
const UserRole_1 = require("../models/UserRole");
exports.rbacRouter = (0, express_1.Router)();
// -------- Roles --------
// List roles for admin UIs
exports.rbacRouter.get('/roles', authMiddleware_1.requireAuth, async (_req, res) => {
    try {
        const roles = await Role_1.Role.find().lean();
        res.json(roles);
    }
    catch (err) {
        console.error('List roles error', err);
        res.status(500).json({ message: 'Failed to list roles' });
    }
});
// Create role
exports.rbacRouter.post('/roles', authMiddleware_1.requireAuth, (0, requirePermission_1.requirePermission)('rbac.roles.manage'), async (req, res) => {
    try {
        const role = await Role_1.Role.create(req.body);
        res.status(201).json(role);
    }
    catch (err) {
        console.error('Create role error', err);
        res.status(400).json({ message: 'Failed to create role', error: err.message });
    }
});
// Update role
exports.rbacRouter.put('/roles/:id', authMiddleware_1.requireAuth, (0, requirePermission_1.requirePermission)('rbac.roles.manage'), async (req, res) => {
    try {
        const { id } = req.params;
        const role = await Role_1.Role.findByIdAndUpdate(id, req.body, { new: true }).lean();
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        res.json(role);
    }
    catch (err) {
        console.error('Update role error', err);
        res.status(400).json({ message: 'Failed to update role', error: err.message });
    }
});
// Delete role (prevent deleting system roles in future if needed)
exports.rbacRouter.delete('/roles/:id', authMiddleware_1.requireAuth, (0, requirePermission_1.requirePermission)('rbac.roles.manage'), async (req, res) => {
    try {
        const { id } = req.params;
        const role = await Role_1.Role.findByIdAndDelete(id).lean();
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        res.status(204).send();
    }
    catch (err) {
        console.error('Delete role error', err);
        res.status(400).json({ message: 'Failed to delete role', error: err.message });
    }
});
// -------- Permissions --------
// Permission list
exports.rbacRouter.get('/permissions', authMiddleware_1.requireAuth, async (_req, res) => {
    try {
        const permissions = await Permission_1.Permission.find().lean();
        res.json(permissions);
    }
    catch (err) {
        console.error('List permissions error', err);
        res.status(500).json({ message: 'Failed to list permissions' });
    }
});
// Assign permissions to role
exports.rbacRouter.post('/roles/:roleId/permissions', authMiddleware_1.requireAuth, (0, requirePermission_1.requirePermission)('rbac.permissions.manage'), async (req, res) => {
    try {
        const { roleId } = req.params;
        const { permissionIds, allowed = true } = req.body;
        if (!Array.isArray(permissionIds) || !permissionIds.length) {
            return res.status(400).json({ message: 'permissionIds array is required' });
        }
        const docs = permissionIds.map((permissionId) => ({
            roleId,
            permissionId,
            allowed,
        }));
        const created = await RolePermission_1.RolePermission.insertMany(docs, { ordered: false }).catch((err) => {
            // ignore duplicate key errors to make this idempotent-ish
            console.error('Assign permissions error', err);
            return [];
        });
        res.status(201).json(created);
    }
    catch (err) {
        console.error('Assign permissions error', err);
        res.status(400).json({ message: 'Failed to assign permissions', error: err.message });
    }
});
// Remove a permission from role
exports.rbacRouter.delete('/roles/:roleId/permissions/:permissionId', authMiddleware_1.requireAuth, (0, requirePermission_1.requirePermission)('rbac.permissions.manage'), async (req, res) => {
    try {
        const { roleId, permissionId } = req.params;
        await RolePermission_1.RolePermission.findOneAndDelete({ roleId, permissionId }).lean();
        res.status(204).send();
    }
    catch (err) {
        console.error('Remove role permission error', err);
        res.status(400).json({ message: 'Failed to remove permission', error: err.message });
    }
});
// -------- User Roles --------
// Get roles for a user
exports.rbacRouter.get('/users/:userId/roles', authMiddleware_1.requireAuth, (0, requirePermission_1.requirePermission)('rbac.user_roles.manage'), async (req, res) => {
    try {
        const { userId } = req.params;
        const roles = await UserRole_1.UserRole.find({ supabaseUserId: userId }).lean();
        res.json(roles);
    }
    catch (err) {
        console.error('Get user roles error', err);
        res.status(500).json({ message: 'Failed to get user roles' });
    }
});
// Assign a role to a user (with optional scope)
exports.rbacRouter.post('/users/:userId/roles', authMiddleware_1.requireAuth, (0, requirePermission_1.requirePermission)('rbac.user_roles.manage'), async (req, res) => {
    try {
        const { userId } = req.params;
        const body = req.body || {};
        const userRole = await UserRole_1.UserRole.create({
            supabaseUserId: userId,
            roleId: body.roleId,
            stateId: body.stateId,
            branchId: body.branchId,
            mandalId: body.mandalId,
            departmentId: body.departmentId,
            isPrimary: !!body.isPrimary,
            assignedBy: req.user?.id || 'system',
        });
        res.status(201).json(userRole);
    }
    catch (err) {
        console.error('Assign user role error', err);
        res.status(400).json({ message: 'Failed to assign user role', error: err.message });
    }
});
// Update a user role (e.g. status or scope)
exports.rbacRouter.put('/users/:userId/roles/:userRoleId', authMiddleware_1.requireAuth, (0, requirePermission_1.requirePermission)('rbac.user_roles.manage'), async (req, res) => {
    try {
        const { userId, userRoleId } = req.params;
        const updates = req.body || {};
        const userRole = await UserRole_1.UserRole.findOneAndUpdate({ _id: userRoleId, supabaseUserId: userId }, updates, { new: true }).lean();
        if (!userRole) {
            return res.status(404).json({ message: 'User role not found' });
        }
        res.json(userRole);
    }
    catch (err) {
        console.error('Update user role error', err);
        res.status(400).json({ message: 'Failed to update user role', error: err.message });
    }
});
// Delete a user role
exports.rbacRouter.delete('/users/:userId/roles/:userRoleId', authMiddleware_1.requireAuth, (0, requirePermission_1.requirePermission)('rbac.user_roles.manage'), async (req, res) => {
    try {
        const { userId, userRoleId } = req.params;
        await UserRole_1.UserRole.findOneAndDelete({ _id: userRoleId, supabaseUserId: userId }).lean();
        res.status(204).send();
    }
    catch (err) {
        console.error('Delete user role error', err);
        res.status(400).json({ message: 'Failed to delete user role', error: err.message });
    }
});
// -------- Role-permission matrix for UI --------
exports.rbacRouter.get('/roles/matrix', authMiddleware_1.requireAuth, async (_req, res) => {
    try {
        const [roles, permissions, rolePermissions] = await Promise.all([
            Role_1.Role.find().lean(),
            Permission_1.Permission.find().lean(),
            RolePermission_1.RolePermission.find().lean(),
        ]);
        res.json({ roles, permissions, rolePermissions });
    }
    catch (err) {
        console.error('Role matrix error', err);
        res.status(500).json({ message: 'Failed to load role matrix' });
    }
});
