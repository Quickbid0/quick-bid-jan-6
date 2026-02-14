import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuctionsService } from './auctions.service';
interface BidData {
    auctionId: string;
    userId: string;
    amount: number;
    userName: string;
}
interface JoinAuctionData {
    auctionId: string;
    userId: string;
    userName: string;
}
export declare class AuctionsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly auctionsService;
    server: Server;
    private readonly logger;
    private auctionRooms;
    constructor(auctionsService: AuctionsService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    handleJoinAuction(data: JoinAuctionData, client: Socket): Promise<{
        success: boolean;
        message: string;
    }>;
    handleLeaveAuction(data: {
        auctionId: string;
    }, client: Socket): Promise<{
        success: boolean;
        message: string;
    }>;
    handlePlaceBid(data: BidData, client: Socket): Promise<{
        success: boolean;
        bid: any;
        reason?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        reason: string;
        bid?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        bid?: undefined;
        reason?: undefined;
    }>;
    handleGetAuctionState(data: {
        auctionId: string;
    }, client: Socket): Promise<{
        success: boolean;
        auctionState: import("./auctions.service").AuctionState;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        auctionState?: undefined;
    }>;
    handleStartAuction(data: {
        auctionId: string;
        adminId: string;
    }, client: Socket): Promise<{
        success: boolean;
        startTime?: Date;
        endTime?: Date;
        message?: string;
        error?: string;
    } | {
        success: boolean;
        error: any;
    }>;
    handleEndAuction(data: {
        auctionId: string;
        adminId: string;
    }, client: Socket): Promise<{
        success: boolean;
        winner?: any;
        finalPrice?: number;
        endTime?: Date;
        message?: string;
        error?: string;
    } | {
        success: boolean;
        error: any;
    }>;
    handlePauseAuction(data: {
        auctionId: string;
        adminId: string;
    }, client: Socket): Promise<{
        success: boolean;
        pauseTime?: Date;
        reason?: string;
        message?: string;
        error?: string;
    } | {
        success: boolean;
        error: any;
    }>;
    broadcastAuctionUpdate(auctionId: string, update: any): void;
    notifyUser(userId: string, event: string, data: any): void;
    getRoomStats(auctionId: string): {
        auctionId: string;
        totalUsers: number;
        userList: string[];
    };
}
export {};
