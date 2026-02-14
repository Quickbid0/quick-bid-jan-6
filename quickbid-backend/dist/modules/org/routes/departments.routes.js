"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentsRouter = void 0;
const express_1 = require("express");
const Department_1 = require("../models/Department");
const authMiddleware_1 = require("../../../middleware/authMiddleware");
const requirePermission_1 = require("../../rbac/middleware/requirePermission");
exports.departmentsRouter = (0, express_1.Router)();
// List departments
exports.departmentsRouter.get('/departments', authMiddleware_1.requireAuth, (0, requirePermission_1.requirePermission)('departments.view'), async (_req, res) => {
    try {
        const items = await Department_1.Department.find().sort({ createdAt: -1 }).lean();
        res.json(items);
    }
    catch (err) {
        console.error('list departments error', err);
        res.status(500).json({ message: 'Failed to list departments', error: err.message });
    }
});
// Create department
exports.departmentsRouter.post('/departments', authMiddleware_1.requireAuth, (0, requirePermission_1.requirePermission)('departments.manage'), async (req, res) => {
    try {
        const doc = await Department_1.Department.create(req.body);
        res.status(201).json(doc);
    }
    catch (err) {
        console.error('create department error', err);
        res.status(400).json({ message: 'Failed to create department', error: err.message });
    }
});
// Update department
exports.departmentsRouter.patch('/departments/:id', authMiddleware_1.requireAuth, (0, requirePermission_1.requirePermission)('departments.manage'), async (req, res) => {
    try {
        const doc = await Department_1.Department.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }).lean();
        if (!doc)
            return res.status(404).json({ message: 'Department not found' });
        res.json(doc);
    }
    catch (err) {
        console.error('update department error', err);
        res.status(400).json({ message: 'Failed to update department', error: err.message });
    }
});
// Delete / soft-disable department (here we just mark inactive)
exports.departmentsRouter.delete('/departments/:id', authMiddleware_1.requireAuth, (0, requirePermission_1.requirePermission)('departments.manage'), async (req, res) => {
    try {
        const doc = await Department_1.Department.findByIdAndUpdate(req.params.id, { $set: { isActive: false } }, { new: true }).lean();
        if (!doc)
            return res.status(404).json({ message: 'Department not found' });
        res.json({ deleted: true });
    }
    catch (err) {
        console.error('delete department error', err);
        res.status(400).json({ message: 'Failed to delete department', error: err.message });
    }
});
