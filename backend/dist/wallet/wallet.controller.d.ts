import { WalletService } from './wallet.service';
import { AddFundsDto, PlaceBidDto, RefundBidDto, WalletTransactionQueryDto } from './dto/wallet.dto';
export declare class WalletController {
    private readonly walletService;
    constructor(walletService: WalletService);
    getBalance(req: any): Promise<{
        balance: any;
        currency: string;
    }>;
    addFunds(addFundsDto: AddFundsDto, req: any): Promise<any>;
    getTransactions(query: WalletTransactionQueryDto, req: any): Promise<any>;
    placeBid(bidDto: PlaceBidDto, req: any): Promise<any>;
    refundBid(refundDto: RefundBidDto, req: any): Promise<any>;
}
