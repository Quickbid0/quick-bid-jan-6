"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailRouter = void 0;
const express_1 = require("express");
const email_service_1 = require("../services/email.service");
exports.emailRouter = (0, express_1.Router)();
exports.emailRouter.post('/email', async (req, res) => {
    try {
        const { campaignId, subject, body, recipients } = req.body || {};
        if (!campaignId || !subject || !body) {
            return res.status(400).json({ message: 'campaignId, subject, and body are required' });
        }
        const toList = Array.isArray(recipients) && recipients.length > 0 ? recipients : ['marketing-ops@quickbid.example.com'];
        const html = `
      <p><strong>Campaign ID:</strong> ${campaignId}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p>${body}</p>
    `;
        await Promise.all(toList.map((to) => (0, email_service_1.sendMarketingEmail)({
            to,
            subject: `[Campaign ${campaignId}] ${subject}`,
            html,
        })));
        res.status(201).json({ campaignId, emailedTo: toList });
    }
    catch (err) {
        console.error('marketing email error', err);
        res.status(500).json({ message: 'Failed to queue marketing email', error: err.message });
    }
});
