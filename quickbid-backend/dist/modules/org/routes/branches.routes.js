"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.branchesRouter = void 0;
const express_1 = require("express");
const Branch_1 = require("../models/Branch");
const authMiddleware_1 = require("../../../middleware/authMiddleware");
const requirePermission_1 = require("../../rbac/middleware/requirePermission");
exports.branchesRouter = (0, express_1.Router)();
// List branches
exports.branchesRouter.get('/branches', authMiddleware_1.requireAuth, (0, requirePermission_1.requirePermission)('branches.view'), async (_req, res) => {
    try {
        const items = await Branch_1.Branch.find().sort({ createdAt: -1 }).lean();
        res.json(items);
    }
    catch (err) {
        console.error('list branches error', err);
        res.status(500).json({ message: 'Failed to list branches', error: err.message });
    }
});
// Create branch
exports.branchesRouter.post('/branches', authMiddleware_1.requireAuth, (0, requirePermission_1.requirePermission)('branches.manage'), async (req, res) => {
    try {
        const doc = await Branch_1.Branch.create(req.body);
        res.status(201).json(doc);
    }
    catch (err) {
        console.error('create branch error', err);
        res.status(400).json({ message: 'Failed to create branch', error: err.message });
    }
});
// Update branch
exports.branchesRouter.patch('/branches/:id', authMiddleware_1.requireAuth, (0, requirePermission_1.requirePermission)('branches.manage'), async (req, res) => {
    try {
        const doc = await Branch_1.Branch.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }).lean();
        if (!doc)
            return res.status(404).json({ message: 'Branch not found' });
        res.json(doc);
    }
    catch (err) {
        console.error('update branch error', err);
        res.status(400).json({ message: 'Failed to update branch', error: err.message });
    }
});
// Delete / soft-disable branch (mark inactive)
exports.branchesRouter.delete('/branches/:id', authMiddleware_1.requireAuth, (0, requirePermission_1.requirePermission)('branches.manage'), async (req, res) => {
    try {
        const doc = await Branch_1.Branch.findByIdAndUpdate(req.params.id, { $set: { isActive: false } }, { new: true }).lean();
        if (!doc)
            return res.status(404).json({ message: 'Branch not found' });
        res.json({ deleted: true });
    }
    catch (err) {
        console.error('delete branch error', err);
        res.status(400).json({ message: 'Failed to delete branch', error: err.message });
    }
});
