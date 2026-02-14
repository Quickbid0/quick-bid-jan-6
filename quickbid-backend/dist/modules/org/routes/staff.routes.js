"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffRouter = void 0;
const express_1 = require("express");
const StaffProfile_1 = require("../models/StaffProfile");
const UserRole_1 = require("../../rbac/models/UserRole");
const authMiddleware_1 = require("../../../middleware/authMiddleware");
const requirePermission_1 = require("../../rbac/middleware/requirePermission");
exports.staffRouter = (0, express_1.Router)();
// List staff with basic filters
exports.staffRouter.get('/staff', authMiddleware_1.requireAuth, (0, requirePermission_1.requirePermission)('staff.view'), async (req, res) => {
    try {
        const { status } = req.query;
        const query = {};
        if (status)
            query.status = status;
        const items = await StaffProfile_1.StaffProfile.find(query).sort({ createdAt: -1 }).lean();
        res.json(items);
    }
    catch (err) {
        console.error('list staff error', err);
        res.status(500).json({ message: 'Failed to list staff', error: err.message });
    }
});
// Create or upsert a staff profile and (optionally) assign a role
exports.staffRouter.post('/staff', authMiddleware_1.requireAuth, (0, requirePermission_1.requirePermission)('staff.manage'), async (req, res) => {
    try {
        const { supabaseUserId, fullName, phone, email, primaryBranchId, primaryDepartmentId, roleId, isPrimary } = req.body || {};
        if (!supabaseUserId) {
            return res.status(400).json({ message: 'supabaseUserId is required' });
        }
        const profile = await StaffProfile_1.StaffProfile.findOneAndUpdate({ supabaseUserId }, {
            $set: {
                fullName,
                phone,
                email,
                primaryBranchId,
                primaryDepartmentId,
                status: 'active',
            },
        }, { upsert: true, new: true }).lean();
        // Optional: assign a role for this staff member
        if (roleId) {
            await UserRole_1.UserRole.findOneAndUpdate({
                supabaseUserId,
                roleId,
                branchId: primaryBranchId,
                departmentId: primaryDepartmentId,
            }, {
                $setOnInsert: {
                    isPrimary: !!isPrimary,
                    assignedBy: req.user?.id || 'system',
                },
            }, { upsert: true, new: true }).lean();
        }
        res.status(201).json(profile);
    }
    catch (err) {
        console.error('create staff error', err);
        res.status(400).json({ message: 'Failed to create staff', error: err.message });
    }
});
// Update staff profile (and optionally status)
exports.staffRouter.patch('/staff/:id', authMiddleware_1.requireAuth, (0, requirePermission_1.requirePermission)('staff.manage'), async (req, res) => {
    try {
        const updates = req.body || {};
        const profile = await StaffProfile_1.StaffProfile.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true }).lean();
        if (!profile)
            return res.status(404).json({ message: 'Staff not found' });
        res.json(profile);
    }
    catch (err) {
        console.error('update staff error', err);
        res.status(400).json({ message: 'Failed to update staff', error: err.message });
    }
});
// Disable staff account (soft)
exports.staffRouter.post('/staff/:id/disable', authMiddleware_1.requireAuth, (0, requirePermission_1.requirePermission)('staff.manage'), async (req, res) => {
    try {
        const profile = await StaffProfile_1.StaffProfile.findByIdAndUpdate(req.params.id, { $set: { status: 'disabled' } }, { new: true }).lean();
        if (!profile)
            return res.status(404).json({ message: 'Staff not found' });
        res.json(profile);
    }
    catch (err) {
        console.error('disable staff error', err);
        res.status(400).json({ message: 'Failed to disable staff', error: err.message });
    }
});
// Approve staff role assignments in future (placeholder for staff.approve)
// Currently, staff.approve can be used when we add pending UserRole flows.
