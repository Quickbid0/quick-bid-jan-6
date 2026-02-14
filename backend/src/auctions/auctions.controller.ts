import { Controller, Get, Post, Body, Param, Delete, Put, Req, UseGuards } from '@nestjs/common';
import { AuctionsService } from './auctions.service';

@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  @Post()
  async create(@Body() createAuctionDto: any, @Req() req: any) {
    const sellerId = req.user?.id || 'seller1';
    return this.auctionsService.createAuction(createAuctionDto);
  }

  @Get()
  async findAll() {
    return this.auctionsService.getAuctionsByType('active');
  }

  @Get('active')
  async findActive() {
    return this.auctionsService.getAuctionsByType('active');
  }

  @Get('draft')
  async findDraft() {
    return this.auctionsService.getAuctionsByType('draft');
  }

  @Get('ended')
  async findEnded() {
    return this.auctionsService.getAuctionsByType('ended');
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.auctionsService.getAuctionState(id);
  }

  @Post(':id/start')
  async startAuction(@Param('id') id: string, @Req() req: any) {
    const adminId = req.user?.id || 'admin';
    return this.auctionsService.startAuction(id, adminId);
  }

  @Post(':id/end')
  async endAuction(@Param('id') id: string, @Req() req: any) {
    const adminId = req.user?.id || 'admin';
    return this.auctionsService.endAuction(id, adminId);
  }

  @Post(':id/pause')
  async pauseAuction(@Param('id') id: string, @Req() req: any) {
    const adminId = req.user?.id || 'admin';
    return this.auctionsService.pauseAuction(id, adminId);
  }

  @Post(':id/bid')
  async placeBid(@Param('id') id: string, @Body() bidDto: any, @Req() req: any) {
    const userId = req.user?.id || 'bidder1';
    const userName = req.user?.name || 'Demo Bidder';
    return this.auctionsService.placeBid({
      auctionId: id,
      userId,
      amount: bidDto.amount,
      userName
    });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateAuctionDto: any) {
    return this.auctionsService.updateAuctionSettings(id, updateAuctionDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    // Implementation would mark auction as cancelled
    return { message: 'Auction removal not implemented' };
  }

  @Get(':id/stats')
  async getStats(@Param('id') id: string) {
    return this.auctionsService.getAuctionStats(id);
  }
}
