import { Injectable } from '@nestjs/common';

@Injectable()
export class VoiceParserService {
  async parseVoiceInput(text: string, userId: string, auctionId: string): Promise<any> {
    const intent = this.classifyIntent(text);
    if (intent === 'bid') {
      const winProb = await this.getWinProbability(userId, auctionId);
      const fraud = await this.getFraudRisk(userId);
      if (winProb > 0.45 && fraud < 0.6) {
        const suggestedBid = this.calculateSuggestedBid(auctionId);
        return {
          suggestedBid,
          newProbability: winProb,
          riskLevel: fraud > 0.5 ? 'high' : 'low',
          confirmationMessage: 'Bid placed successfully',
        };
      } else {
        return {
          suggestedBid: 0,
          newProbability: winProb,
          riskLevel: 'high',
          confirmationMessage: 'Bid not recommended due to risk',
        };
      }
    }
    return { error: 'Invalid intent' };
  }

  private classifyIntent(text: string): string {
    if (text.toLowerCase().includes('bid')) return 'bid';
    return 'unknown';
  }

  private async getWinProbability(userId: string, auctionId: string): Promise<number> {
    // Inject BiddingAiService
    return 0.6;
  }

  private async getFraudRisk(userId: string): Promise<number> {
    return 0.2;
  }

  private calculateSuggestedBid(auctionId: string): number {
    return 1000;
  }
}
