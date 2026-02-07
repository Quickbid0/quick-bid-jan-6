import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService {
  constructor(private prisma: PrismaClient) {}

  get account() {
    return this.prisma.account;
  }

  get profile() {
    return this.prisma.profile;
  }

  get userSession() {
    return this.prisma.userSession;
  }

  get auditLog() {
    return this.prisma.auditLog;
  }

  get product() {
    return this.prisma.product;
  }

  get auction() {
    return this.prisma.auction;
  }
}
