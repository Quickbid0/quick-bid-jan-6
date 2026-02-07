import { loadScript } from '../utils/razorpayUtils';

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  handler: (response: any) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color: string;
  };
}

export class RealRazorpayService {
  private isLoaded = false;
  private key: string;

  constructor() {
    this.key = import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_1234567890';
  }

  async loadRazorpay(): Promise<void> {
    if (this.isLoaded) return;
    
    try {
      await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      this.isLoaded = true;
    } catch (error) {
      console.error('Failed to load Razorpay:', error);
      throw new Error('Payment gateway unavailable');
    }
  }

  async createOrder(amount: number): Promise<{ orderId: string; amount: number }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ amount, currency: 'INR' })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment order');
      }

      const data = await response.json();
      return {
        orderId: data.orderId,
        amount: data.amount
      };
    } catch (error) {
      console.error('Order creation failed:', error);
      throw error;
    }
  }

  async initiatePayment(options: Partial<RazorpayOptions>): Promise<any> {
    await this.loadRazorpay();

    const razorpayOptions: RazorpayOptions = {
      key: this.key,
      amount: options.amount || 0,
      currency: 'INR',
      name: 'QuickMela',
      description: options.description || 'Auction Payment',
      handler: options.handler || (() => {}),
      prefill: options.prefill,
      theme: {
        color: '#3399cc'
      }
    };

    const rzp = new (window as any).Razorpay(razorpayOptions);
    return rzp.open();
  }

  async verifyPayment(paymentId: string, orderId: string, signature: string): Promise<boolean> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          paymentId,
          orderId,
          signature
        })
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      const data = await response.json();
      return data.verified;
    } catch (error) {
      console.error('Payment verification failed:', error);
      return false;
    }
  }

  async processWalletTopup(amount: number): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // Create order first
      const { orderId } = await this.createOrder(amount);

      // Initiate payment
      const result = await new Promise((resolve: any) => {
        this.initiatePayment({
          amount: amount * 100, // Razorpay expects amount in paise
          description: `Wallet Topup - ₹${amount}`,
          handler: (response: any) => {
            resolve(response);
          },
          prefill: {
            email: localStorage.getItem('userEmail') || ''
          }
        });
      });

      // Verify payment
      const verified = await this.verifyPayment(
        result.razorpay_payment_id,
        orderId,
        result.razorpay_signature
      );

      if (verified) {
        // Update wallet balance
        const updateResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/wallet/add-funds`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({ amount })
        });

        if (updateResponse.ok) {
          return {
            success: true,
            transactionId: result.razorpay_payment_id
          };
        }
      }

      throw new Error('Payment verification failed');
    } catch (error) {
      console.error('Wallet topup failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      };
    }
  }

  async processAuctionPayment(auctionId: string, amount: number): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // Create order first
      const { orderId } = await this.createOrder(amount);

      // Initiate payment
      const result = await new Promise((resolve: any) => {
        this.initiatePayment({
          amount: amount * 100, // Razorpay expects amount in paise
          description: `Auction Payment - ${auctionId}`,
          handler: (response: any) => {
            resolve(response);
          },
          prefill: {
            email: localStorage.getItem('userEmail') || ''
          }
        });
      });

      // Verify payment
      const verified = await this.verifyPayment(
        result.razorpay_payment_id,
        orderId,
        result.razorpay_signature
      );

      if (verified) {
        // Process auction payment
        const paymentResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/auction-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({
            auctionId,
            amount,
            transactionId: result.razorpay_payment_id
          })
        });

        if (paymentResponse.ok) {
          return {
            success: true,
            transactionId: result.razorpay_payment_id
          };
        }
      }

      throw new Error('Payment verification failed');
    } catch (error) {
      console.error('Auction payment failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      };
    }
  }
}

export const realRazorpayService = new RealRazorpayService();
