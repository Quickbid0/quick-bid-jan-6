import mongoose from 'mongoose';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app';
import dotenv from 'dotenv';
import { selectAdForContext, recordImpression } from './modules/ads/services/liveAdEngine.service';
import { initAuctionsEvents } from './socket/auctionEvents';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

dotenv.config();

const PORT = process.env.COMMUNITY_BACKEND_PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/quickmela-community';

const start = async () => {
  try {
    const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces';
    const exporter = new OTLPTraceExporter({ url: otlpEndpoint });
    const sdk = new NodeSDK({
      traceExporter: exporter,
      instrumentations: [getNodeAutoInstrumentations()],
    });
    await sdk.start();

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const app = createApp();
    const server = http.createServer(app);

    const io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_ORIGIN || '*',
        credentials: true,
      },
    });

    // Initialize auctions namespace and event helpers
    initAuctionsEvents(io);

    const shutdown = async (signal: string) => {
      try {
        await mongoose.connection.close();
      } catch {}
      try {
        io.close();
      } catch {}
      server.close(() => {
        process.exit(0);
      });
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    (app as any).locals.gracefulShutdownEnabled = true;

    io.on('connection', (socket) => {
      socket.on('ad_request', async (payload: { eventId?: string; slotType: any; userId?: string }) => {
        try {
          const ad = await selectAdForContext({
            eventId: payload.eventId,
            slotType: payload.slotType,
          });
          if (!ad) return;
          socket.emit('ad_inject', ad);
        } catch (err) {
          console.error('ad_request error', err);
        }
      });

      socket.on(
        'ad_impression',
        async (payload: {
          sponsorId: string;
          slotId: string;
          campaignId: string;
          eventId?: string;
          userId?: string;
          durationMs: number;
        }) => {
          try {
            await recordImpression({
              ...payload,
              clicked: false,
            });
          } catch (err) {
            console.error('ad_impression error', err);
          }
        }
      );

      socket.on(
        'ad_click',
        async (payload: {
          sponsorId: string;
          slotId: string;
          campaignId: string;
          eventId?: string;
          userId?: string;
          durationMs: number;
        }) => {
          try {
            await recordImpression({
              ...payload,
              clicked: true,
            });
          } catch (err) {
            console.error('ad_click error', err);
          }
        }
      );
    });

    server.listen(PORT, () => {
      console.log(`QuickMela community backend listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start backend', err);
    process.exit(1);
  }
};

start();
