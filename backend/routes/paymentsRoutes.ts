import express from 'express';
import * as Razorpay from 'razorpay';
import crypto from 'crypto';
import { authMiddleware } from '../middleware/auth';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!
});

/**
 * POST /api/payments/create-order
 * Create Razorpay order for payment
 */
router.post('/create-order', authMiddleware, async (req, res) => {
  const { amount, currency, receipt, notes } = req.body;
  const userId = req.user?.id;

  try {
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const options = {
      amount: Math.round(amount), // Amount in paise
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        ...notes,
        userId,
        created_at: new Date().toISOString()
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      id: order.id,
      entity: order.entity,
      amount: order.amount,
      amount_paid: order.amount_paid,
      amount_due: order.amount_due,
      currency: order.currency,
      receipt: order.receipt,
      offer_id: order.offer_id,
      status: order.status,
      attempts: order.attempts,
      notes: order.notes,
      created_at: order.created_at
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

/**
 * POST /api/payments/verify
 * Verify Razorpay payment signature
 */
router.post('/verify', authMiddleware, async (req, res) => {
  const { orderId, paymentId, signature } = req.body;
  const userId = req.user?.id;

  try {
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ error: 'Missing verification parameters' });
    }

    // Generate signature for verification
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(paymentId);

    if (payment.status !== 'captured') {
      return res.status(400).json({ error: 'Payment not captured' });
    }

    // Update transaction status in database
    // Note: This would require a database connection pool
    // For now, we'll just return success
    console.log('Payment verified:', { orderId, paymentId, userId });

    res.json({
      verified: true,
      paymentId,
      orderId,
      amount: payment.amount / 100, // Convert to rupees
      currency: payment.currency,
      status: payment.status
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

/**
 * POST /api/payments/refund
 * Process refund for a payment
 */
router.post('/refund', authMiddleware, async (req, res) => {
  const { paymentId, amount } = req.body;
  const userId = req.user?.id;

  try {
    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID required' });
    }

    const refundOptions: any = {
      payment_id: paymentId
    };

    if (amount) {
      refundOptions.amount = Math.round(amount * 100); // Convert to paise
    }

    const refund = await razorpay.payments.refund(refundOptions);

    // Update transaction status
    // Note: This would require a database connection pool
    console.log('Refund processed:', { paymentId, refund });

    res.json({
      id: (refund as any).id,
      entity: (refund as any).entity,
      amount: (refund as any).amount / 100, // Convert to rupees
      currency: (refund as any).currency,
      payment_id: (refund as any).payment_id,
      status: (refund as any).status,
      created_at: (refund as any).created_at
    });

  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ error: 'Refund failed' });
  }
});

/**
 * GET /api/payments/orders/:orderId
 * Get order details
 */
router.get('/orders/:orderId', authMiddleware, async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await razorpay.orders.fetch(orderId);

    res.json(order);

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

/**
 * GET /api/payments/payments/:paymentId
 * Get payment details
 */
router.get('/payments/:paymentId', authMiddleware, async (req, res) => {
  const { paymentId } = req.params;

  try {
    const payment = await razorpay.payments.fetch(paymentId);

    res.json(payment);

  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

/**
 * POST /api/payments/webhook
 * Razorpay webhook handler
 */
router.post('/webhook', async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  const signature = req.headers['x-razorpay-signature'] as string;

  try {
    // Verify webhook signature
    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body;

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event);
        break;
      case 'refund.processed':
        await handleRefundProcessed(event);
        break;
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    res.json({ status: 'ok' });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * Handle payment captured webhook event
 */
async function handlePaymentCaptured(event: any) {
  const payment = event.payload.payment.entity;
  const orderId = payment.order_id;
  const paymentId = payment.id;
  const amount = payment.amount;
  const userId = payment.notes?.userId;

  if (!userId) {
    console.error('User ID not found in payment notes');
    return;
  }

  // Update transaction status
  // Note: This would require a database connection pool
  console.log('Payment captured and processed:', paymentId);
}

/**
 * Handle payment failed webhook event
 */
async function handlePaymentFailed(event: any) {
  const payment = event.payload.payment.entity;
  const orderId = payment.order_id;
  const userId = payment.notes?.userId;

  if (!userId) {
    console.error('User ID not found in payment notes');
    return;
  }

  // Update transaction status
  // Note: This would require a database connection pool
  console.log('Payment failed recorded:', orderId);
}

/**
 * Handle refund processed webhook event
 */
async function handleRefundProcessed(event: any) {
  const refund = event.payload.refund.entity;
  const paymentId = refund.payment_id;

  // Update transaction status
  // Note: This would require a database connection pool
  console.log('Refund processed:', refund.id);
}

export default router;
