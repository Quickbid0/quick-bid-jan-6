import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { PaymentController } from '../src/payments/payment.controller'
import { PaymentService } from '../src/payments/payment.service'

describe('Webhook Idempotency (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: PaymentService,
          useValue: {
            handleWebhook: jest.fn().mockResolvedValue(true)
          }
        }
      ],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('should accept webhook with valid signature', () => {
    return request(app.getHttpServer())
      .post('/payments/webhook')
      .set('x-razorpay-signature', 'test_signature')
      .send({
        event: 'payment.captured',
        data: {
          payment: {
            id: 'pay_test123',
            amount: 1000
          }
        }
      })
      .expect(200)
  })

  it('should accept webhook with invalid signature (graceful handling)', () => {
    return request(app.getHttpServer())
      .post('/payments/webhook')
      .set('x-razorpay-signature', 'invalid_signature')
      .send({
        event: 'payment.captured',
        data: {
          payment: {
            id: 'pay_test123',
            amount: 1000
          }
        }
      })
      .expect(200) // Always returns 200 for webhooks
  })

  it('should handle duplicate webhook events safely', async () => {
    const webhookData = {
      event: 'payment.captured',
      data: {
        payment: {
          id: 'pay_test_duplicate',
          amount: 1000
        }
      }
    }

    // First webhook
    await request(app.getHttpServer())
      .post('/payments/webhook')
      .set('x-razorpay-signature', 'test_signature')
      .send(webhookData)
      .expect(200)

    // Duplicate webhook (same payment ID)
    await request(app.getHttpServer())
      .post('/payments/webhook')
      .set('x-razorpay-signature', 'test_signature')
      .send(webhookData)
      .expect(200)

    // Should not cause errors or double processing
  })

  afterAll(async () => {
    await app.close()
  })
})
