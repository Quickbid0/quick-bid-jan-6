"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAuctionsNamespace = registerAuctionsNamespace;
function registerAuctionsNamespace(io) {
    const nsp = io.of('/auctions');
    nsp.on('connection', (socket) => {
        socket.on('join_auction', ({ auctionId }) => {
            if (!auctionId)
                return;
            socket.join(`auction:${auctionId}`);
        });
        socket.on('leave_auction', ({ auctionId }) => {
            if (!auctionId)
                return;
            socket.leave(`auction:${auctionId}`);
        });
    });
    return {
        emitBidAccepted(auctionId, payload) {
            nsp.to(`auction:${auctionId}`).emit('bid_accepted', payload);
        },
        emitOutbid(auctionId, bidderId, payload) {
            nsp.to(`auction:${auctionId}:user:${bidderId}`).emit('outbid', payload);
        },
        emitAuctionExtended(auctionId, payload) {
            nsp.to(`auction:${auctionId}`).emit('auction_extended', payload);
        },
        emitAuctionFinalized(auctionId, payload) {
            nsp.to(`auction:${auctionId}`).emit('auction_finalized', payload);
        },
    };
}
