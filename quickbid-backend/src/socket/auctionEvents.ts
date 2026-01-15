import type { Server } from 'socket.io';
import { registerAuctionsNamespace } from './auctions';

export interface AuctionsEvents {
  emitBidAccepted: (auctionId: string, payload: any) => void;
  emitOutbid: (auctionId: string, bidderId: string, payload: any) => void;
  emitAuctionExtended: (auctionId: string, payload: any) => void;
  emitAuctionFinalized: (auctionId: string, payload: any) => void;
}

let auctionsEvents: AuctionsEvents | null = null;

export function initAuctionsEvents(io: Server) {
  auctionsEvents = registerAuctionsNamespace(io);
}

export function getAuctionsEvents(): AuctionsEvents | null {
  return auctionsEvents;
}
