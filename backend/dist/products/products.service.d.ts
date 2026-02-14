import { PrismaService } from '../prisma/prisma.service';
export interface UserProfile {
    id: string;
    user_type: string;
    is_verified: boolean;
    verification_status: string;
}
export interface AuctionType {
    type: 'standard' | 'reserve' | 'dutch' | 'tender';
    reservePrice?: number;
    startingPrice: number;
    minimumBid?: number;
    buyNowPrice?: number;
    bidIncrement: number;
    duration: number;
    dutchDecrement?: number;
    dutchInterval?: number;
}
export interface Wallet {
    userId: string;
    balance: number;
    currency: string;
}
export interface Bid {
    id: number;
    productId: number;
    amount: number;
    bidderId: string;
    bidderName: string;
    createdAt: Date;
}
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    private products;
    private userProfiles;
    private bids;
    private wallets;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        title: string;
        category: string;
        price: number;
        images: string[];
        sellerId: string;
        status: string;
        updatedAt: Date;
    }[]>;
    findOne(id: number): Promise<any>;
    create(createProductDto: any, sellerId: string): Promise<any>;
    placeBid(productId: number, bidAmount: number, bidderId: string, bidderName: string): Promise<{
        id: number;
        productId: number;
        amount: number;
        bidderId: string;
        bidderName: string;
        createdAt: Date;
    }>;
    private calculateDutchPrice;
    getWalletBalance(userId: string): Promise<number>;
    addWalletFunds(userId: string, amount: number): Promise<{
        success: boolean;
        newBalance?: number;
    }>;
    bulkCreate(bulkProductDto: any, sellerId: string): Promise<{
        message: string;
        products: any[];
    }>;
    getMyProducts(sellerId: string): Promise<{
        products: any[];
        total: number;
        active: number;
        sold: number;
    }>;
    verifySeller(sellerId: string): Promise<void>;
}
