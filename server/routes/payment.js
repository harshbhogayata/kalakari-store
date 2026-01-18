const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrfProtection');
const router = express.Router();

// Rate limiting for payment endpoints
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many payment attempts, please try again later.'
  }
});

// Initialize Razorpay - SECURE: NO FALLBACK SECRETS
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Validate required environment variables
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('Missing required Razorpay environment variables. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment.');
}

// Create order - PROTECTED (Customer only)
router.post('/create-order', paymentLimiter, csrfProtection, protect, authorize('customer'), [
  body('amount').isNumeric().isFloat({ min: 1 }).withMessage('Amount must be at least ₹1'),
  body('currency').optional().isIn(['INR']).withMessage('Only INR currency is supported'),
  body('receipt').optional().trim().isLength({ max: 50 }).withMessage('Receipt ID too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required'
      });
    }

    // VALIDATION: Ensure amount is reasonable (max ₹1,000,000)
    if (amount > 1000000) {
      return res.status(400).json({
        success: false,
        message: 'Maximum order amount is ₹10,00,000'
      });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise (rounded to avoid decimal issues)
      currency,
      receipt: receipt || `receipt_${Date.now()}_${req.user._id}`,
      payment_capture: 1,
      notes: {
        customerId: req.user._id.toString(),
        timestamp: new Date().toISOString()
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      }
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// Verify payment - PROTECTED (Customer only)
router.post('/verify', paymentLimiter, csrfProtection, protect, authorize('customer'), [
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('paymentId').notEmpty().withMessage('Payment ID is required'),
  body('signature').notEmpty().withMessage('Signature is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { orderId, paymentId, signature } = req.body;

    // Create signature for verification - SECURE: NO FALLBACK SECRET
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (expectedSignature === signature) {
      // Payment verified successfully - update order status
      const order = await Order.findOne({ orderId });
      if (order) {
        await Order.findByIdAndUpdate(order._id, {
          $set: {
            'payment.status': 'completed',
            'payment.razorpayPaymentId': paymentId,
            'payment.razorpayOrderId': orderId,
            'payment.verifiedAt': new Date(),
            status: 'confirmed'
          }
        });

        // Move inventory from reserved to sold
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: {
              'inventory.reserved': -item.quantity,
              'inventory.sold': item.quantity
            }
          });
        }

        // TODO: Send confirmation email to customer
        // TODO: Notify artisans about new order
        
        console.log(`✅ Payment verified for order ${order._id}`);
      }

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          orderId,
          paymentId,
          verified: true
        }
      });
    } else {
      // Payment verification failed - rollback inventory
      const order = await Order.findOne({ orderId });
      if (order) {
        // Rollback inventory reservation
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: {
              'inventory.available': item.quantity,
              'inventory.reserved': -item.quantity
            }
          });
        }

        // Update order status to failed
        await Order.findByIdAndUpdate(order._id, {
          $set: {
            'payment.status': 'failed',
            'payment.failureReason': 'Signature verification failed',
            status: 'cancelled'
          }
        });
      }

      console.error(`❌ Payment verification failed for order: ${orderId}`);
      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        code: 'PAYMENT_VERIFICATION_FAILED'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

// Get order payment status - PROTECTED
router.get('/status/:orderId', protect, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({ orderId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify user owns this order
    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to order'
      });
    }

    res.json({
      success: true,
      data: {
        orderId: order.orderId,
        status: order.status,
        paymentStatus: order.payment.status,
        amount: order.totalAmount,
        paymentMethod: order.payment.method,
        verifiedAt: order.payment.verifiedAt,
        failureReason: order.payment.failureReason
      }
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment status',
      error: error.message
    });
  }
});

// Retry payment verification - PROTECTED (for failed payments)
router.post('/retry/:orderId', protect, authorize('customer'), async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentId, signature } = req.body;

    if (!paymentId || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID and signature are required'
      });
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only allow retry for failed or pending payments
    if (!['failed', 'pending'].includes(order.payment.status)) {
      return res.status(400).json({
        success: false,
        message: 'Payment cannot be retried',
        code: 'PAYMENT_RETRY_NOT_ALLOWED'
      });
    }

    // Verify signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Mark as verified
    await Order.findByIdAndUpdate(order._id, {
      $set: {
        'payment.status': 'completed',
        'payment.razorpayPaymentId': paymentId,
        'payment.razorpayOrderId': orderId,
        'payment.verifiedAt': new Date(),
        status: 'confirmed'
      }
    });

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: { orderId, paymentId, verified: true }
    });

  } catch (error) {
    console.error('Payment retry error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment retry failed'
    });
  }
});

// Get payment details - PROTECTED (Customer/Admin only)
router.get('/payment/:paymentId', protect, async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await razorpay.payments.fetch(paymentId);
    
    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Fetch payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: error.message
    });
  }
});

// Webhook endpoint for Razorpay
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const crypto = require('crypto');
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (!signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing signature'
      });
    }

    if (!webhookSecret) {
      console.error('RAZORPAY_WEBHOOK_SECRET not configured');
      return res.status(500).json({
        success: false,
        message: 'Webhook secret not configured'
      });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    const event = JSON.parse(req.body);
    
    // Handle different payment events
    switch (event.event) {
      case 'payment.captured':
        handlePaymentCaptured(event.payload.payment.entity);
        break;
      case 'payment.failed':
        handlePaymentFailed(event.payload.payment.entity);
        break;
      case 'order.paid':
        handleOrderPaid(event.payload.order.entity);
        break;
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
});

// Handle successful payment capture
async function handlePaymentCaptured(payment) {
  try {
    // Find order by Razorpay order ID
    const order = await Order.findOne({ 'payment.razorpayOrderId': payment.order_id });
    
    if (order) {
      // Update order status
      order.status = 'confirmed';
      order.payment.status = 'completed';
      order.payment.razorpayPaymentId = payment.id;
      order.payment.paidAt = new Date();
      
      await order.save();
      
      // TODO: Send confirmation email to customer
      // TODO: Notify artisans about new order
      
      console.log(`Order ${order._id} payment captured successfully`);
    }
  } catch (error) {
    console.error('Error handling payment capture:', error);
  }
}

// Handle failed payment
async function handlePaymentFailed(payment) {
  try {
    const order = await Order.findOne({ 'payment.razorpayOrderId': payment.order_id });
    
    if (order) {
      order.status = 'failed';
      order.payment.status = 'failed';
      order.payment.failureReason = payment.error_description;
      
      await order.save();
      
      // TODO: Send failure notification to customer
      
      console.log(`Order ${order._id} payment failed: ${payment.error_description}`);
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

// Handle order paid event
async function handleOrderPaid(order) {
  try {
    const dbOrder = await Order.findOne({ 'payment.razorpayOrderId': order.id });
    
    if (dbOrder) {
      dbOrder.status = 'confirmed';
      dbOrder.payment.status = 'completed';
      dbOrder.payment.paidAt = new Date();
      
      await dbOrder.save();
      
      console.log(`Order ${dbOrder._id} marked as paid`);
    }
  } catch (error) {
    console.error('Error handling order paid:', error);
  }
}

module.exports = router;