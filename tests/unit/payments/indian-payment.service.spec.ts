// tests/unit/payments/indian-payment.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { IndianPaymentService } from '../../../src/payments/indian-payment.service';
import { PrismaService } from '../../../src/prisma/prisma.service';

describe('IndianPaymentService', () => {
  let service: IndianPaymentService;
  let prismaService: PrismaService;
  let configService: ConfigService;

  const mockPrismaService = {
    payment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        'RAZORPAY_KEY_ID': 'test_key_id',
        'RAZORPAY_KEY_SECRET': 'test_key_secret',
        'RAZORPAY_WEBHOOK_SECRET': 'test_webhook_secret',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IndianPaymentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<IndianPaymentService>(IndianPaymentService);
    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUPIPayment', () => {
    it('should create UPI payment order successfully', async () => {
      const paymentData = {
        amount: 1000,
        currency: 'INR',
        orderId: 'order_123',
        customerId: 'user_123',
        customerEmail: 'test@example.com',
        customerPhone: '+919876543210',
        paymentMethod: 'upi' as const,
        upiId: 'test@upi',
        upiApp: 'gpay',
      };

      const mockRazorpayResponse = {
        id: 'order_test123',
        amount: 100000, // paisa
        currency: 'INR',
        receipt: 'order_123',
        status: 'created',
      };

      const mockPayment = {
        id: 'order_test123',
        orderId: 'order_123',
        amount: 1000,
        currency: 'INR',
        paymentMethod: 'upi',
        provider: 'razorpay',
        status: 'created',
        customerId: 'user_123',
        metadata: {
          upiId: 'test@upi',
          upiApp: 'gpay',
          razorpayOrderId: 'order_test123',
        },
      };

      // Mock axios post
      jest.spyOn(require('axios'), 'post').mockResolvedValue({
        data: mockRazorpayResponse,
      });

      mockPrismaService.payment.create.mockResolvedValue(mockPayment);

      const result = await service.createUPIPayment(paymentData);

      expect(result.success).toBe(true);
      expect(result.paymentId).toBe('order_test123');
      expect(result.razorpayOrderId).toBe('order_test123');
      expect(mockPrismaService.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          orderId: 'order_123',
          amount: 1000,
          paymentMethod: 'upi',
          customerId: 'user_123',
        }),
      });
    });

    it('should throw error for invalid amount', async () => {
      const paymentData = {
        amount: -100,
        currency: 'INR',
        orderId: 'order_123',
        customerId: 'user_123',
        customerEmail: 'test@example.com',
        customerPhone: '+919876543210',
        paymentMethod: 'upi' as const,
      };

      await expect(service.createUPIPayment(paymentData)).rejects.toThrow();
    });
  });

  describe('verifyPayment', () => {
    it('should verify payment successfully', async () => {
      const paymentId = 'order_test123';
      const razorpayPaymentId = 'pay_test123';
      const razorpaySignature = 'test_signature';

      const mockPayment = {
        id: paymentId,
        orderId: 'order_123',
        amount: 1000,
        transactionId: null,
        status: 'created',
      };

      const mockRazorpayPayment = {
        id: razorpayPaymentId,
        amount: 100000,
        currency: 'INR',
        status: 'captured',
        order_id: paymentId,
      };

      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);
      mockPrismaService.payment.update.mockResolvedValue({
        ...mockPayment,
        status: 'completed',
        transactionId: razorpayPaymentId,
      });

      // Mock crypto
      jest.spyOn(require('crypto'), 'createHmac').mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue(razorpaySignature),
      });

      // Mock axios get
      jest.spyOn(require('axios'), 'get').mockResolvedValue({
        data: mockRazorpayPayment,
      });

      const result = await service.verifyPayment(paymentId, razorpayPaymentId, razorpaySignature);

      expect(result.success).toBe(true);
      expect(result.payment.status).toBe('completed');
    });

    it('should throw error for invalid signature', async () => {
      const paymentId = 'order_test123';
      const razorpayPaymentId = 'pay_test123';
      const razorpaySignature = 'invalid_signature';

      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: paymentId,
        status: 'created',
      });

      // Mock crypto to return different signature
      jest.spyOn(require('crypto'), 'createHmac').mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('different_signature'),
      });

      await expect(service.verifyPayment(paymentId, razorpayPaymentId, razorpaySignature))
        .rejects.toThrow('Payment signature verification failed');
    });
  });

  describe('createNetBankingPayment', () => {
    it('should create net banking payment order', async () => {
      const paymentData = {
        amount: 5000,
        currency: 'INR',
        orderId: 'order_net123',
        customerId: 'user_123',
        customerEmail: 'test@example.com',
        customerPhone: '+919876543210',
        paymentMethod: 'netbanking' as const,
        bankCode: 'HDFC',
      };

      const mockRazorpayResponse = {
        id: 'order_net123',
        amount: 500000,
        currency: 'INR',
        status: 'created',
      };

      jest.spyOn(require('axios'), 'post').mockResolvedValue({
        data: mockRazorpayResponse,
      });

      mockPrismaService.payment.create.mockResolvedValue({
        id: 'order_net123',
        ...paymentData,
        status: 'created',
        provider: 'razorpay',
      });

      const result = await service.createNetBankingPayment(paymentData);

      expect(result.success).toBe(true);
      expect(result.paymentId).toBe('order_net123');
      expect(result.bankDetails.code).toBe('HDFC');
    });

    it('should throw error for invalid bank code', async () => {
      const paymentData = {
        amount: 5000,
        currency: 'INR',
        orderId: 'order_net123',
        customerId: 'user_123',
        customerEmail: 'test@example.com',
        customerPhone: '+919876543210',
        paymentMethod: 'netbanking' as const,
        bankCode: 'INVALID_BANK',
      };

      await expect(service.createNetBankingPayment(paymentData))
        .rejects.toThrow('Invalid bank code');
    });
  });
});
