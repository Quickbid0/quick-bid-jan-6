"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.escrowClient = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
exports.escrowClient = {
    async release({ escrowId, netToSellerCents, feeToPlatformCents, reference }) {
        const baseUrl = process.env.ESCROW_API_URL;
        const apiKey = process.env.ESCROW_API_KEY;
        if (!baseUrl || !apiKey) {
            console.error('escrowClient.release: ESCROW_API_URL or ESCROW_API_KEY not configured');
            return { ok: false, error: 'escrow_api_not_configured' };
        }
        const resp = await (0, node_fetch_1.default)(baseUrl.replace(/\/$/, '') + '/release', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({ escrowId, netToSellerCents, feeToPlatformCents, reference }),
        });
        if (!resp.ok) {
            const body = await resp.text().catch(() => '');
            return { ok: false, status: resp.status, body };
        }
        let json = null;
        try {
            json = await resp.json();
        }
        catch {
            // ignore
        }
        return { ok: true, reference: json?.reference };
    },
};
