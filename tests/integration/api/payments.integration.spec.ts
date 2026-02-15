// tests/integration/api/payments.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/prisma/prisma.service';

describe('Payments API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Clean database
    await prisma.payment.deleteMany();

    await app.init();

    // Create test user and get token
    authToken = await createTestUserAndGetToken(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/payments/upi (POST)', () => {
    it('should create UPI payment order', () => {
      return request(app.getHttpServer())
        .post('/payments/upi')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 1000,
          currency: 'INR',
          orderId: 'test_order_upi_001',
          customerId: 'test_user_001',
          customerEmail: 'test@example.com',
          customerPhone: '+919876543210',
          upiId: 'test@upi',
          upiApp: 'gpay',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('paymentId');
          expect(res.body.data).toHaveProperty('razorpayOrderId');
          expect(res.body.data).toHaveProperty('upiApps');
        });
    });

    it('should return 400 for missing required fields', () => {
      return request(app.getHttpServer())
        .post('/payments/upi')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 1000,
          // missing orderId and customerId
        })
        .expect(400);
    });
  });

  describe('/payments/netbanking (POST)', () => {
    it('should create net banking payment order', () => {
      return request(app.getHttpServer())
        .post('/payments/netbanking')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 5000,
          currency: 'INR',
          orderId: 'test_order_net_001',
          customerId: 'test_user_001',
          customerEmail: 'test@example.com',
          customerPhone: '+919876543210',
          bankCode: 'HDFC',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('paymentId');
          expect(res.body.data).toHaveProperty('bankDetails');
          expect(res.body.data.bankDetails.code).toBe('HDFC');
        });
    });

    it('should return 400 for invalid bank code', () => {
      return request(app.getHttpServer())
        .post('/payments/netbanking')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 5000,
          currency: 'INR',
          orderId: 'test_order_net_002',
          customerId: 'test_user_001',
          customerEmail: 'test@example.com',
          customerPhone: '+919876543210',
          bankCode: 'INVALID_BANK',
        })
        .expect(400);
    });
  });

  describe('/payments/wallet (POST)', () => {
    it('should create wallet payment order', () => {
      return request(app.getHttpServer())
        .post('/payments/wallet')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 2000,
          currency: 'INR',
          orderId: 'test_order_wallet_001',
          customerId: 'test_user_001',
          customerEmail: 'test@example.com',
          customerPhone: '+919876543210',
          walletCode: 'paytm',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('walletDetails');
          expect(res.body.data.walletDetails.code).toBe('paytm');
        });
    });
  });

  describe('/payments/methods (GET)', () => {
    it('should return available payment methods', () => {
      return request(app.getHttpServer())
        .get('/payments/methods')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('upi');
          expect(res.body.data).toHaveProperty('netbanking');
          expect(res.body.data).toHaveProperty('wallet');
          expect(res.body.data).toHaveProperty('card');
        });
    });
  });
});

// Helper function to create test user and get token
async function createTestUserAndGetToken(app: INestApplication): Promise<string> {
  // Create test user
  const userResponse = await request(app.getHttpServer())
    .post('/auth/register')
    .send({
      email: 'test@example.com',
      password: 'TestPass123!',
      name: 'Test User',
      phone: '+919876543210',
    });

  // Login to get token
  const loginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      email: 'test@example.com',
      password: 'TestPass123!',
    });

  return loginResponse.body.accessToken;
}
