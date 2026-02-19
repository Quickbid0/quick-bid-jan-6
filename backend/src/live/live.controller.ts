import { Controller, Post, Get, Body } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Controller('live')
export class LiveController {
  constructor(private prisma: PrismaService) {}

  @Cron('0 * * * * *') // Every minute
  async activateScheduledAuctions() {
    const now = new Date();
    const auctions = await this.prisma.liveAuctionSession.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: { lte: now }
      }
    });

    for (const auction of auctions) {
      await this.prisma.liveAuctionSession.update({
        where: { id: auction.id },
        data: { status: 'LIVE' }
      });
      console.log(`Activated live auction: ${auction.id}`);
    }
  }

  @Post('schedule')
  async schedule(@Body() data: { sellerId: string, title: string, scheduledAt: Date, streamUrl: string }) {
    return this.prisma.liveAuctionSession.create({
      data: {
        sellerId: data.sellerId,
        title: data.title,
        scheduledAt: data.scheduledAt,
        status: 'SCHEDULED',
        streamUrl: data.streamUrl,
      },
    });
  }

  @Get('sessions')
  async getSessions() {
    return this.prisma.liveAuctionSession.findMany({
      where: { status: 'LIVE' },
      include: { _count: { select: { LiveBid: true } } }
    });
  }

  @Post('activate/:id')
  async activate(@Param('id') id: string) {
    return this.prisma.liveAuctionSession.update({
      where: { id },
      data: { status: 'LIVE' },
    });
  }
}
