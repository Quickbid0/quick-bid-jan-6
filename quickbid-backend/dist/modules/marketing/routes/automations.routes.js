"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.automationsRouter = void 0;
const express_1 = require("express");
const automation_model_1 = require("../models/automation.model");
exports.automationsRouter = (0, express_1.Router)();
// TODO: plug in real auth/RBAC when ready
exports.automationsRouter.post('/api/v1/automations', async (req, res) => {
    try {
        const automation = await automation_model_1.AutomationModel.create(req.body);
        res.status(201).json(automation);
    }
    catch (err) {
        console.error('create automation error', err);
        res.status(500).json({ message: 'Failed to create automation', error: err.message });
    }
});
exports.automationsRouter.get('/api/v1/automations', async (_req, res) => {
    try {
        const items = await automation_model_1.AutomationModel.find().sort({ created_at: -1 }).lean();
        res.json(items);
    }
    catch (err) {
        console.error('list automations error', err);
        res.status(500).json({ message: 'Failed to list automations', error: err.message });
    }
});
exports.automationsRouter.get('/api/v1/automations/:id', async (req, res) => {
    try {
        const item = await automation_model_1.AutomationModel.findById(req.params.id).lean();
        if (!item)
            return res.status(404).json({ message: 'Automation not found' });
        res.json(item);
    }
    catch (err) {
        console.error('get automation error', err);
        res.status(500).json({ message: 'Failed to fetch automation', error: err.message });
    }
});
exports.automationsRouter.patch('/api/v1/automations/:id', async (req, res) => {
    try {
        const item = await automation_model_1.AutomationModel.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }).lean();
        if (!item)
            return res.status(404).json({ message: 'Automation not found' });
        res.json(item);
    }
    catch (err) {
        console.error('update automation error', err);
        res.status(500).json({ message: 'Failed to update automation', error: err.message });
    }
});
exports.automationsRouter.delete('/api/v1/automations/:id', async (req, res) => {
    try {
        const item = await automation_model_1.AutomationModel.findByIdAndDelete(req.params.id).lean();
        if (!item)
            return res.status(404).json({ message: 'Automation not found' });
        res.json({ deleted: true });
    }
    catch (err) {
        console.error('delete automation error', err);
        res.status(500).json({ message: 'Failed to delete automation', error: err.message });
    }
});
