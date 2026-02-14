"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.overlayRouter = void 0;
const express_1 = require("express");
const OverlayPreset_1 = require("../models/OverlayPreset");
exports.overlayRouter = (0, express_1.Router)();
exports.overlayRouter.get('/overlays', async (_req, res, next) => {
    try {
        const presets = await OverlayPreset_1.OverlayPreset.find().lean();
        res.json(presets);
    }
    catch (err) {
        next(err);
    }
});
exports.overlayRouter.get('/overlays/by-event/:eventId', async (req, res, next) => {
    try {
        const { eventId } = req.params;
        const preset = await OverlayPreset_1.OverlayPreset.findOne({ eventIds: eventId }).lean();
        if (!preset) {
            res.status(404).json({ message: 'No overlay preset for this event' });
            return;
        }
        res.json(preset);
    }
    catch (err) {
        next(err);
    }
});
exports.overlayRouter.post('/overlays', async (req, res, next) => {
    try {
        const { presetId, name, description, layout, eventIds, createdBy } = req.body;
        if (!presetId || !name) {
            res.status(400).json({ message: 'presetId and name are required' });
            return;
        }
        const existing = await OverlayPreset_1.OverlayPreset.findOne({ presetId });
        if (existing) {
            res.status(400).json({ message: 'presetId must be unique' });
            return;
        }
        const preset = await OverlayPreset_1.OverlayPreset.create({
            presetId,
            name,
            description,
            layout: Array.isArray(layout) ? layout : [],
            eventIds: Array.isArray(eventIds) ? eventIds : [],
            createdBy,
        });
        res.status(201).json(preset);
    }
    catch (err) {
        next(err);
    }
});
exports.overlayRouter.patch('/overlays/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, layout, eventIds } = req.body;
        const update = {};
        if (name !== undefined)
            update.name = name;
        if (description !== undefined)
            update.description = description;
        if (layout !== undefined)
            update.layout = Array.isArray(layout) ? layout : [];
        if (eventIds !== undefined)
            update.eventIds = Array.isArray(eventIds) ? eventIds : [];
        const updated = await OverlayPreset_1.OverlayPreset.findByIdAndUpdate(id, update, { new: true });
        if (!updated) {
            res.status(404).json({ message: 'Overlay preset not found' });
            return;
        }
        res.json(updated);
    }
    catch (err) {
        next(err);
    }
});
exports.overlayRouter.delete('/overlays/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await OverlayPreset_1.OverlayPreset.findByIdAndDelete(id);
        if (!deleted) {
            res.status(404).json({ message: 'Overlay preset not found' });
            return;
        }
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
});
