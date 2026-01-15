import type { Server, Socket } from 'socket.io';

export function registerAuctionsNamespace(io: Server) {
  const nsp = io.of('/auctions');

  nsp.on('connection', (socket: Socket) => {
    socket.on('join_auction', ({ auctionId }: { auctionId: string }) => {
      if (!auctionId) return;
      socket.join(`auction:${auctionId}`);
    });

    socket.on('leave_auction', ({ auctionId }: { auctionId: string }) => {
      if (!auctionId) return;
      socket.leave(`auction:${auctionId}`);
    });
  });

  return {
    emitBidAccepted(auctionId: string, payload: any) {
      nsp.to(`auction:${auctionId}`).emit('bid_accepted', payload);
    },
    emitOutbid(auctionId: string, bidderId: string, payload: any) {
      nsp.to(`auction:${auctionId}:user:${bidderId}`).emit('outbid', payload);
    },
    emitAuctionExtended(auctionId: string, payload: any) {
      nsp.to(`auction:${auctionId}`).emit('auction_extended', payload);
    },
    emitAuctionFinalized(auctionId: string, payload: any) {
      nsp.to(`auction:${auctionId}`).emit('auction_finalized', payload);
    },
  };
}
