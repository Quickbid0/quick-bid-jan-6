import { WalletService } from './wallet.service';
export declare class WalletController {
    private readonly walletService;
    constructor(walletService: WalletService);
    getBalance(req: any): Promise<{
        balance: import("./wallet.service").WalletBalance;
        currency: string;
    }>;
    addFunds(addFundsDto: {
        amount: number;
    }, req: any): Promise<{
        success: boolean;
        transactionId: string;
        newBalance: import("./wallet.service").WalletBalance;
    }>;
    getTransactions(req: any): Promise<import("./wallet.service").WalletTransaction[]>;
    placeBid(bidDto: {
        amount: number;
    }, req: any): Promise<{
        success: boolean;
        transactionId: string;
        newBalance: import("./wallet.service").WalletBalance;
    }>;
    refundBid(refundDto: {
        amount: number;
    }, req: any): Promise<{
        success: boolean;
        transactionId: string;
        newBalance: import("./wallet.service").WalletBalance;
    }>;
}
