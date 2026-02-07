import { Controller, Post, Body, Req, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentService } from './payment.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-order')
  @ApiOperation({ summary: 'Create Razorpay order' })
  @ApiResponse({ status: 200, description: 'Order created successfully' })
  async createOrder(@Body() body: { amount: number; currency?: string; receipt?: string; notes?: Record<string, string> }) {
    try {
      const order = await this.paymentService.createOrder(body);
      return {
        success: true,
        order,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to create order',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify Razorpay payment' })
  @ApiResponse({ status: 200, description: 'Payment verified' })
  async verifyPayment(@Body() body: { paymentId: string; orderId: string; signature: string }) {
    try {
      const isVerified = await this.paymentService.verifyPayment(body);

      if (!isVerified) {
        throw new HttpException(
          {
            success: false,
            message: 'Payment verification failed',
          },
          HttpStatus.BAD_REQUEST
        );
      }

      return {
        success: true,
        verified: true,
        message: 'Payment verified successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Payment verification failed',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('auction-payment')
  @ApiOperation({ summary: 'Process auction payment' })
  @ApiResponse({ status: 200, description: 'Payment processed' })
  async processAuctionPayment(
    @Body() body: { auctionId: string; amount: number; paymentId: string; orderId: string; userId: string; sellerId: string; signature: string },
    @Req() req: any
  ) {
    try {
      // First verify the payment
      const isVerified = await this.paymentService.verifyPayment({
        paymentId: body.paymentId,
        orderId: body.orderId,
        signature: body.signature,
      });

      if (!isVerified) {
        throw new HttpException(
          {
            success: false,
            message: 'Payment verification failed',
          },
          HttpStatus.BAD_REQUEST
        );
      }

      // Process the auction payment
      const result = await this.paymentService.processAuctionPayment({
        auctionId: body.auctionId,
        amount: body.amount,
        paymentId: body.paymentId,
        orderId: body.orderId,
        userId: body.userId,
        sellerId: body.sellerId,
      });

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Payment processing failed',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('refund')
  @ApiOperation({ summary: 'Process refund' })
  @ApiResponse({ status: 200, description: 'Refund processed' })
  async processRefund(
    @Body() body: { paymentId: string; amount?: number; notes?: Record<string, string> }
  ) {
    try {
      const result = await this.paymentService.processRefund(body);
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Refund processing failed',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('payment/:paymentId')
  @ApiOperation({ summary: 'Get payment details' })
  @ApiResponse({ status: 200, description: 'Payment details retrieved' })
  async getPayment(@Param('paymentId') paymentId: string) {
    try {
      const payment = await this.paymentService.getPayment(paymentId);
      return {
        success: true,
        payment,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch payment details',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get order details' })
  @ApiResponse({ status: 200, description: 'Order details retrieved' })
  async getOrder(@Param('orderId') orderId: string) {
    try {
      const order = await this.paymentService.getOrder(orderId);
      return {
        success: true,
        order,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch order details',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle Razorpay webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleWebhook(@Body() webhookData: any, @Req() req: any) {
    try {
      const signature = req.headers['x-razorpay-signature'];
      if (!signature) {
        throw new HttpException(
          {
            success: false,
            message: 'Missing webhook signature',
          },
          HttpStatus.BAD_REQUEST
        );
      }

      const isValid = await this.paymentService.handleWebhook(webhookData, signature);

      if (!isValid) {
        throw new HttpException(
          {
            success: false,
            message: 'Invalid webhook signature',
          },
          HttpStatus.BAD_REQUEST
        );
      }

      return {
        success: true,
        message: 'Webhook processed successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Webhook processing failed',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
