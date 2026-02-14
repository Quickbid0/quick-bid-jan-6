"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMarketingEmail = sendMarketingEmail;
const mail_1 = __importDefault(require("@sendgrid/mail"));
const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.MARKETING_FROM_EMAIL;
if (!apiKey) {
    console.warn('[marketing] SENDGRID_API_KEY is not set. Email sends will be no-ops.');
}
else {
    mail_1.default.setApiKey(apiKey);
}
async function sendMarketingEmail(params) {
    if (!apiKey || !fromEmail) {
        console.warn('[marketing] Missing SENDGRID_API_KEY or MARKETING_FROM_EMAIL; skipping email');
        return;
    }
    await mail_1.default.send({
        to: params.to,
        from: fromEmail,
        subject: params.subject,
        html: params.html,
    });
}
