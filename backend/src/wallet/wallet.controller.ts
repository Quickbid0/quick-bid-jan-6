import { Controller, Get, Post, Body, Req, Query } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { AddFundsDto, PlaceBidDto, RefundBidDto, WalletTransactionQueryDto } from './dto/wallet.dto';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  async getBalance(@Req() req: any) {
    const userId = req.user?.id || 'buyer1';
    const balance = await this.walletService.getBalance(userId);
    return { balance, currency: 'INR' };
  }

  @Post('add-funds')
  async addFunds(@Body() addFundsDto: AddFundsDto, @Req() req: any) {
    const userId = req.user?.id || 'buyer1';
    return this.walletService.addFunds(userId, addFundsDto.amount);
  }

  @Get('transactions')
  async getTransactions(@Query() query: WalletTransactionQueryDto, @Req() req: any) {
    const userId = req.user?.id || 'buyer1';
    const result = await this.walletService.getTransactionHistory(
      userId,
      query.limit || 20,
      ((query.page || 1) - 1) * (query.limit || 20),
      query.type,
      query.purpose
    );
    return result;
  }

  @Post('place-bid')
  async placeBid(@Body() bidDto: PlaceBidDto, @Req() req: any) {
    const userId = req.user?.id || 'buyer1';
    return this.walletService.deductFunds(userId, bidDto.amount, 'bid_placement');
  }

  @Post('refund-bid')
  async refundBid(@Body() refundDto: RefundBidDto, @Req() req: any) {
    const userId = req.user?.id || 'buyer1';
    return this.walletService.processRefund({
      userId,
      amount: refundDto.amount,
      reason: refundDto.reason || 'Bid refund'
    });
  }
}
