import { AuctionsService } from './auctions.service';
import { CreateAuctionDto, PlaceBidDto, UpdateAuctionDto, AuctionQueryDto } from './dto/auction.dto';
export declare class AuctionsController {
    private readonly auctionsService;
    constructor(auctionsService: AuctionsService);
    create(createAuctionDto: CreateAuctionDto, req: any): Promise<import("./auctions.service").Auction>;
    findAll(query: AuctionQueryDto): Promise<import("./auctions.service").Auction[]>;
    findActive(query: AuctionQueryDto): Promise<import("./auctions.service").Auction[]>;
    findDraft(query: AuctionQueryDto): Promise<import("./auctions.service").Auction[]>;
    findEnded(query: AuctionQueryDto): Promise<import("./auctions.service").Auction[]>;
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
    placeBid(id: string, bidDto: PlaceBidDto, req: any): Promise<{
        success: boolean;
        bid?: any;
        auctionState?: import("./auctions.service").AuctionState;
        shouldExtend?: boolean;
        newEndTime?: Date;
        reason?: string;
        message?: string;
    }>;
    update(id: string, updateAuctionDto: UpdateAuctionDto): Promise<import("./auctions.service").Auction>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getStats(id: string): Promise<any>;
}
