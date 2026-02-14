"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAuctionsEvents = initAuctionsEvents;
exports.getAuctionsEvents = getAuctionsEvents;
const auctions_1 = require("./auctions");
let auctionsEvents = null;
function initAuctionsEvents(io) {
    auctionsEvents = (0, auctions_1.registerAuctionsNamespace)(io);
}
function getAuctionsEvents() {
    return auctionsEvents;
}
