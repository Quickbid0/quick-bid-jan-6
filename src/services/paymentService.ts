import { toast } from 'react-hot-toast';

// Extend the Window interface to include Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface CreateOrderRequest {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface CreateOrderResponse {
  success: boolean;
  order?: {
    orderId: string;
    amount: number;
    currency: string;
    status: string;
    key: string;
    receipt: string;
    notes: Record<string, string>;
    createdAt: number;
  };
  message?: string;
}

export interface PaymentOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler?: (response: RazorpayPaymentResponse) => void;
  modal?: {
    confirm_close?: boolean;
    ondismiss?: () => void;
  };
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentRequest {
  paymentId: string;
  orderId: string;
  signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  verified: boolean;
  message: string;
}

export interface ProcessAuctionPaymentRequest {
  auctionId: string;
  amount: number;
  paymentId: string;
  orderId: string;
  userId: string;
  sellerId: string;
  signature: string;
}

export interface ProcessAuctionPaymentResponse {
  success: boolean;
  transaction?: any;
  message: string;
}

export interface PaymentData {
  userId: string;
  amount: number;
  method: 'card' | 'upi' | 'netbanking' | 'wallet';
  purpose: 'wallet_topup' | 'auction_payment' | 'security_deposit' | 'commission';
  auctionId?: string;
  bidId?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  gatewayResponse?: any;
}

class PaymentService {
  private readonly baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4011';

  /**
   * Load Razorpay SDK dynamically
   */
  private async loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
      document.body.appendChild(script);
    });
  }

  /**
   * Create a Razorpay order
   */
  async createOrder(orderData: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }

      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create order');
    }
  }

  /**
   * Initialize Razorpay payment
   */
  async initiatePayment(
    orderData: CreateOrderRequest,
    paymentOptions: Partial<PaymentOptions> = {},
    userDetails?: {
      name?: string;
      email?: string;
      contact?: string;
    }
  ): Promise<RazorpayPaymentResponse> {
    try {
      // Load Razorpay SDK if not already loaded
      await this.loadRazorpayScript();

      // Create order
      const orderResponse = await this.createOrder(orderData);

      if (!orderResponse.success || !orderResponse.order) {
        throw new Error(orderResponse.message || 'Failed to create order');
      }

      const order = orderResponse.order;

      // Prepare payment options
      const options: PaymentOptions = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: 'QuickMela',
        description: paymentOptions.description || 'Auction Payment',
        order_id: order.orderId,
        prefill: {
          name: userDetails?.name,
          email: userDetails?.email,
          contact: userDetails?.contact,
        },
        notes: order.notes,
        theme: {
          color: '#2563eb', // Blue theme
        },
        modal: {
          confirm_close: true,
          ondismiss: () => {
            toast.error('Payment cancelled by user');
          },
        },
        ...paymentOptions,
      };

      return new Promise((resolve, reject) => {
        // Set up payment handler
        options.handler = (response: RazorpayPaymentResponse) => {
          resolve(response);
        };

        // Create Razorpay instance
        const razorpay = new window.Razorpay(options);

        // Handle payment failure
        razorpay.on('payment.failed', (response: any) => {
          console.error('Payment failed:', response);
          toast.error('Payment failed. Please try again.');
          reject(new Error('Payment failed'));
        });

        // Open payment modal
        razorpay.open();
      });

    } catch (error) {
      console.error('Error initiating payment:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to initiate payment');
    }
  }

  /**
   * Verify payment signature
   */
  async verifyPayment(verifyData: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verifyData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Payment verification failed');
      }

      return data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw new Error(error instanceof Error ? error.message : 'Payment verification failed');
    }
  }

  /**
   * Process auction payment after successful Razorpay payment
   */
  async processAuctionPayment(paymentData: ProcessAuctionPaymentRequest): Promise<ProcessAuctionPaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/payments/auction-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process auction payment');
      }

      return data;
    } catch (error) {
      console.error('Error processing auction payment:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to process auction payment');
    }
  }

  /**
   * Process refund
   */
  async processRefund(refundData: {
    paymentId: string;
    amount?: number;
    notes?: Record<string, string>;
  }): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/payments/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(refundData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Refund processing failed');
      }

      return data;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw new Error(error instanceof Error ? error.message : 'Refund processing failed');
    }
  }

  /**
   * Complete auction payment flow (create order -> payment -> verification -> processing)
   */
  async processAuctionWinPayment(
    auctionData: {
      auctionId: string;
      amount: number;
      userId: string;
      sellerId: string;
    },
    userDetails?: {
      name?: string;
      email?: string;
      contact?: string;
    }
  ): Promise<ProcessAuctionPaymentResponse> {
    try {
      // Step 1: Initiate payment
      const paymentResponse = await this.initiatePayment(
        {
          amount: auctionData.amount,
          currency: 'INR',
          receipt: `auction_${auctionData.auctionId}`,
          notes: {
            auctionId: auctionData.auctionId,
            userId: auctionData.userId,
            sellerId: auctionData.sellerId,
          },
        },
        {
          description: `Payment for auction win - Auction ${auctionData.auctionId}`,
        },
        userDetails
      );

      // Step 2: Verify payment
      const verification = await this.verifyPayment({
        paymentId: paymentResponse.razorpay_payment_id,
        orderId: paymentResponse.razorpay_order_id,
        signature: paymentResponse.razorpay_signature,
      });

      if (!verification.verified) {
        throw new Error('Payment verification failed');
      }

      // Step 3: Process auction payment
      const result = await this.processAuctionPayment({
        auctionId: auctionData.auctionId,
        amount: auctionData.amount,
        paymentId: paymentResponse.razorpay_payment_id,
        orderId: paymentResponse.razorpay_order_id,
        userId: auctionData.userId,
        sellerId: auctionData.sellerId,
        signature: paymentResponse.razorpay_signature,
      });

      toast.success('Payment processed successfully!');

      return result;
    } catch (error) {
      console.error('Error in auction payment flow:', error);
      const message = error instanceof Error ? error.message : 'Payment processing failed';
      toast.error(message);
      throw new Error(message);
    }
  }

  /**
   * Legacy method for backward compatibility - process payment (mock implementation for wallet topups)
   */
  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      // For backward compatibility, handle wallet topups with mock implementation
      // In production, this should also use Razorpay
      if (paymentData.purpose === 'wallet_topup') {
        // Simulate successful wallet topup
        const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        return {
          success: true,
          transactionId,
          gatewayResponse: {
            transactionId,
            status: 'completed',
          },
        };
      }

      // For auction payments, use the new Razorpay flow
      if (paymentData.purpose === 'auction_payment' && paymentData.auctionId) {
        // This would need user details from somewhere - for now, return error
        throw new Error('Use processAuctionWinPayment for auction payments');
      }

      throw new Error('Unsupported payment purpose');
    } catch (error) {
      console.error('Error processing payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
      };
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
export default paymentService;
