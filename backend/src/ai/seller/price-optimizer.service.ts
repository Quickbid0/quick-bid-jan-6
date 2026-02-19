import { Injectable } from '@nestjs/common';

@Injectable()
export class PriceOptimizerService {
  optimizeStartingPrice(similarAuctions: any[]): number {
    if (similarAuctions.length === 0) return 1000;
    const avg = similarAuctions.reduce((sum, a) => sum + a.finalPrice, 0) / similarAuctions.length;
    return avg * 0.8;
  }
}
