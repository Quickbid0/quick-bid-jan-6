import { AuctionsService } from './auctions.service';
export declare class AuctionsController {
    private readonly auctionsService;
    constructor(auctionsService: AuctionsService);
    create(createAuctionDto: any, req: any): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        sellerId: string;
        status: string;
        updatedAt: Date;
        productId: string;
        startPrice: number;
        currentBid: number;
        endTime: Date;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        sellerId: string;
        status: string;
        updatedAt: Date;
        productId: string;
        startPrice: number;
        currentBid: number;
        endTime: Date;
    }[]>;
    findActive(): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        sellerId: string;
        status: string;
        updatedAt: Date;
        productId: string;
        startPrice: number;
        currentBid: number;
        endTime: Date;
    }[]>;
    findDraft(): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        sellerId: string;
        status: string;
        updatedAt: Date;
        productId: string;
        startPrice: number;
        currentBid: number;
        endTime: Date;
    }[]>;
    findEnded(): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        sellerId: string;
        status: string;
        updatedAt: Date;
        productId: string;
        startPrice: number;
        currentBid: number;
        endTime: Date;
    }[]>;
    findOne(id: string): Promise<import("./auctions.service").AuctionState>;
    startAuction(id: string, req: any): Promise<{
        success: boolean;
        startTime?: Date;
        endTime?: Date;
        message?: string;
        error?: string;
    }>;
    endAuction(id: string, req: any): Promise<{
        success: boolean;
        winner?: any;
        finalPrice?: number;
        endTime?: Date;
        message?: string;
        error?: string;
    }>;
    pauseAuction(id: string, req: any): Promise<{
        success: boolean;
        pauseTime?: Date;
        reason?: string;
        message?: string;
        error?: string;
    }>;
    placeBid(id: string, bidDto: any, req: any): Promise<{
        success: boolean;
        bid?: any;
        auctionState?: import("./auctions.service").AuctionState;
        shouldExtend?: boolean;
        newEndTime?: Date;
        reason?: string;
        message?: string;
    }>;
    update(id: string, updateAuctionDto: any): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        sellerId: string;
        status: string;
        updatedAt: Date;
        productId: string;
        startPrice: number;
        currentBid: number;
        endTime: Date;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getStats(id: string): Promise<any>;
}
