import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly httpService: HttpService,
  ) {}

  @Get('health')
  getHealth() {
    return this.aiService.getHealth();
  }

  @Post('win-probability')
  async calculateWinProbability(@Body() data: { userId: string, auctionId: string }) {
    const features = await this.aiService.buildFeaturesForPrediction(data.userId, data.auctionId);
    try {
      const response = await this.httpService.post('http://localhost:8001/predict/win', { features });
      return response.data;
    } catch (error) {
      throw new HttpException('AI service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  @Post('fraud-score')
  async calculateFraudScore(@Body() data: { userId: string }) {
    const features = await this.aiService.buildFraudFeatures(data.userId);
    try {
      const response = await this.httpService.post('http://localhost:8001/predict/fraud', { features });
      return response.data;
    } catch (error) {
      throw new HttpException('AI service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  @Post('price-optimizer')
  async optimizePrice(@Body() data: { auctionId: string }) {
    // Call seller AI
    return { optimalPrice: 1500 };
  }

  @Post('auto-bid-decision')
  async decideAutoBid(@Body() data: { userId: string, auctionId: string, currentPrice: number, timeLeft: number }) {
    const state = { price_norm: data.currentPrice / 2000, time_norm: data.timeLeft / 100 };
    try {
      const response = await this.httpService.post('http://localhost:8001/predict/auto-bid', state);
      return response.data;
    } catch (error) {
      throw new HttpException('AI service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}
