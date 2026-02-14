"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app_1 = require("./app");
const dotenv_1 = __importDefault(require("dotenv"));
const liveAdEngine_service_1 = require("./modules/ads/services/liveAdEngine.service");
const auctionEvents_1 = require("./socket/auctionEvents");
const sdk_node_1 = require("@opentelemetry/sdk-node");
const auto_instrumentations_node_1 = require("@opentelemetry/auto-instrumentations-node");
const exporter_trace_otlp_http_1 = require("@opentelemetry/exporter-trace-otlp-http");
dotenv_1.default.config();
const PORT = process.env.COMMUNITY_BACKEND_PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/quickmela-community';
const start = async () => {
    try {
        const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces';
        const exporter = new exporter_trace_otlp_http_1.OTLPTraceExporter({ url: otlpEndpoint });
        const sdk = new sdk_node_1.NodeSDK({
            traceExporter: exporter,
            instrumentations: [(0, auto_instrumentations_node_1.getNodeAutoInstrumentations)()],
        });
        await sdk.start();
        await mongoose_1.default.connect(MONGO_URI);
        console.log('Connected to MongoDB');
        const app = (0, app_1.createApp)();
        const server = http_1.default.createServer(app);
        const io = new socket_io_1.Server(server, {
            cors: {
                origin: process.env.FRONTEND_ORIGIN || '*',
                credentials: true,
            },
        });
        // Initialize auctions namespace and event helpers
        (0, auctionEvents_1.initAuctionsEvents)(io);
        const shutdown = async (signal) => {
            try {
                await mongoose_1.default.connection.close();
            }
            catch { }
            try {
                io.close();
            }
            catch { }
            server.close(() => {
                process.exit(0);
            });
        };
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        app.locals.gracefulShutdownEnabled = true;
        io.on('connection', (socket) => {
            socket.on('ad_request', async (payload) => {
                try {
                    const ad = await (0, liveAdEngine_service_1.selectAdForContext)({
                        eventId: payload.eventId,
                        slotType: payload.slotType,
                    });
                    if (!ad)
                        return;
                    socket.emit('ad_inject', ad);
                }
                catch (err) {
                    console.error('ad_request error', err);
                }
            });
            socket.on('ad_impression', async (payload) => {
                try {
                    await (0, liveAdEngine_service_1.recordImpression)({
                        ...payload,
                        clicked: false,
                    });
                }
                catch (err) {
                    console.error('ad_impression error', err);
                }
            });
            socket.on('ad_click', async (payload) => {
                try {
                    await (0, liveAdEngine_service_1.recordImpression)({
                        ...payload,
                        clicked: true,
                    });
                }
                catch (err) {
                    console.error('ad_click error', err);
                }
            });
        });
        server.listen(PORT, () => {
            console.log(`QuickMela community backend listening on port ${PORT}`);
        });
    }
    catch (err) {
        console.error('Failed to start backend', err);
        process.exit(1);
    }
};
start();
