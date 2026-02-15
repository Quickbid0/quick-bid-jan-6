import { WalletService } from './wallet.service';
import { AddFundsDto, PlaceBidDto, RefundBidDto, WalletTransactionQueryDto } from './dto/wallet.dto';
export declare class WalletController {
    private readonly walletService;
    constructor(walletService: WalletService);
    getBalance(req: any): Promise<{
        balance: {
            userId: string;
            availableBalance: number;
            heldBalance: any;
            totalBalance: any;
            currency: any;
            lastUpdated: any;
            transactions: any;
        };
        currency: string;
    }>;
    addFunds(addFundsDto: AddFundsDto, req: any): Promise<{
        success: boolean;
        transactionId: string;
        newBalance: import("./wallet.service").WalletBalance;
    }>;
    getTransactions(query: WalletTransactionQueryDto, req: any): Promise<{
        transactions: import("./wallet.service").WalletTransaction[];
        totalCount: number;
        hasMore: boolean;
    }>;
    placeBid(bidDto: PlaceBidDto, req: any): Promise<{
        success: boolean;
        transactionId: string;
        newBalance: import("./wallet.service").WalletBalance;
    }>;
    refundBid(refundDto: RefundBidDto, req: any): Promise<{
        success: boolean;
        transactionId: string;
        newBalance: import("./wallet.service").WalletBalance;
    }>;
}
