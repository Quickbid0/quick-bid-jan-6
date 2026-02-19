import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnomalyDetectionService {
  constructor(private prisma: PrismaService) {}

  async detectWalletAnomaly(userId: string): Promise<number> {
    // Implement wallet anomaly detection
    return 0.05;
  }
}
