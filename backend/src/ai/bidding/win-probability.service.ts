import { Injectable } from '@nestjs/common';

@Injectable()
export class WinProbabilityService {
  calculate(
    userAggression: number,
    timePressure: number,
    walletStrength: number,
    bidPosition: number,
    historicalWinRate: number,
  ): number {
    const w = (
      userAggression * 0.3 +
      timePressure * 0.2 +
      walletStrength * 0.2 +
      bidPosition * 0.2 +
      historicalWinRate * 0.1
    );
    return Math.min(1, Math.max(0, w));
  }
}
