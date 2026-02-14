"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDeleteLead = exports.handleUpdateLead = exports.handleCreateLead = exports.handleListLeads = exports.handleDashboardSummary = void 0;
const salesDashboard_service_1 = require("../services/salesDashboard.service");
const handleDashboardSummary = async (_req, res) => {
    try {
        const summary = await (0, salesDashboard_service_1.getDashboardSummary)();
        return res.status(200).json(summary);
    }
    catch (err) {
        console.error('dashboard summary error', err);
        return res.status(500).json({ message: 'Unable to fetch dashboard summary' });
    }
};
exports.handleDashboardSummary = handleDashboardSummary;
const handleListLeads = async (req, res) => {
    const { limit, offset, status } = req.query;
    try {
        const leads = await (0, salesDashboard_service_1.listSalesLeads)({
            limit: limit ? Number(limit) : undefined,
            offset: offset ? Number(offset) : undefined,
            status: status ? String(status) : undefined,
        });
        return res.status(200).json(leads);
    }
    catch (err) {
        console.error('list leads error', err);
        return res.status(500).json({ message: 'Unable to fetch leads' });
    }
};
exports.handleListLeads = handleListLeads;
const handleCreateLead = async (req, res) => {
    try {
        const lead = await (0, salesDashboard_service_1.createSalesLead)(req.body);
        return res.status(201).json(lead);
    }
    catch (err) {
        console.error('create lead error', err);
        return res.status(500).json({ message: 'Unable to create lead' });
    }
};
exports.handleCreateLead = handleCreateLead;
const handleUpdateLead = async (req, res) => {
    try {
        const lead = await (0, salesDashboard_service_1.updateSalesLead)(req.params.id, req.body);
        return res.status(200).json(lead);
    }
    catch (err) {
        console.error('update lead error', err);
        return res.status(500).json({ message: 'Unable to update lead' });
    }
};
exports.handleUpdateLead = handleUpdateLead;
const handleDeleteLead = async (req, res) => {
    try {
        await (0, salesDashboard_service_1.deleteSalesLead)(req.params.id);
        return res.status(204).send();
    }
    catch (err) {
        console.error('delete lead error', err);
        return res.status(500).json({ message: 'Unable to delete lead' });
    }
};
exports.handleDeleteLead = handleDeleteLead;
