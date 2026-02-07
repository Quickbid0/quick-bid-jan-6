import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { WalletService } from './wallet.service';

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
  async addFunds(@Body() addFundsDto: { amount: number }, @Req() req: any) {
    const userId = req.user?.id || 'buyer1';
    return this.walletService.addFunds(userId, addFundsDto.amount);
  }

  @Get('transactions')
  async getTransactions(@Req() req: any) {
    const userId = req.user?.id || 'buyer1';
    const result = await this.walletService.getTransactionHistory(userId);
    return result.transactions;
  }

  @Post('place-bid')
  async placeBid(@Body() bidDto: { amount: number }, @Req() req: any) {
    const userId = req.user?.id || 'buyer1';
    return this.walletService.deductFunds(userId, bidDto.amount, 'bid_placement');
  }

  @Post('refund-bid')
  async refundBid(@Body() refundDto: { amount: number }, @Req() req: any) {
    const userId = req.user?.id || 'buyer1';
    return this.walletService.processRefund({
      userId,
      amount: refundDto.amount,
      reason: 'Bid refund'
    });
  }
}
