"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adSlotRouter = void 0;
const express_1 = require("express");
const slot_service_1 = require("../services/slot.service");
exports.adSlotRouter = (0, express_1.Router)();
exports.adSlotRouter.post('/adslots', async (req, res, next) => {
    try {
        const slot = await (0, slot_service_1.createAdSlot)(req.body);
        res.status(201).json(slot);
    }
    catch (err) {
        next(err);
    }
});
exports.adSlotRouter.get('/adslots', async (_req, res, next) => {
    try {
        const slots = await (0, slot_service_1.listAdSlots)();
        res.json(slots);
    }
    catch (err) {
        next(err);
    }
});
exports.adSlotRouter.patch('/adslots/:id', async (req, res, next) => {
    try {
        const slot = await (0, slot_service_1.updateAdSlot)(req.params.id, req.body);
        if (!slot) {
            res.status(404).json({ message: 'Ad slot not found' });
            return;
        }
        res.json(slot);
    }
    catch (err) {
        next(err);
    }
});
exports.adSlotRouter.delete('/adslots/:id', async (req, res, next) => {
    try {
        await (0, slot_service_1.deleteAdSlot)(req.params.id);
        res.status(204).end();
    }
    catch (err) {
        next(err);
    }
});
