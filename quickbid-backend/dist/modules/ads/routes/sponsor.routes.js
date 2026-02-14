"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sponsorRouter = void 0;
const express_1 = require("express");
const sponsor_service_1 = require("../services/sponsor.service");
exports.sponsorRouter = (0, express_1.Router)();
exports.sponsorRouter.post('/sponsors', async (req, res, next) => {
    try {
        const sponsor = await (0, sponsor_service_1.createSponsor)(req.body);
        res.status(201).json(sponsor);
    }
    catch (err) {
        next(err);
    }
});
exports.sponsorRouter.get('/sponsors', async (_req, res, next) => {
    try {
        const sponsors = await (0, sponsor_service_1.listSponsors)();
        res.json(sponsors);
    }
    catch (err) {
        next(err);
    }
});
exports.sponsorRouter.get('/sponsors/:id', async (req, res, next) => {
    try {
        const sponsor = await (0, sponsor_service_1.getSponsorById)(req.params.id);
        if (!sponsor) {
            res.status(404).json({ message: 'Sponsor not found' });
            return;
        }
        res.json(sponsor);
    }
    catch (err) {
        next(err);
    }
});
exports.sponsorRouter.patch('/sponsors/:id', async (req, res, next) => {
    try {
        const sponsor = await (0, sponsor_service_1.updateSponsor)(req.params.id, req.body);
        if (!sponsor) {
            res.status(404).json({ message: 'Sponsor not found' });
            return;
        }
        res.json(sponsor);
    }
    catch (err) {
        next(err);
    }
});
exports.sponsorRouter.delete('/sponsors/:id', async (req, res, next) => {
    try {
        await (0, sponsor_service_1.deleteSponsor)(req.params.id);
        res.status(204).end();
    }
    catch (err) {
        next(err);
    }
});
