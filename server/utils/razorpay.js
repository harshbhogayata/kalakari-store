const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Initialize Razorpay with secure credentials
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Validate Razorpay configuration
const validateRazorpayConfig = () => {
  if (!process.env.RAZORPAY_KEY_ID) {
    console.warn('⚠️ RAZORPAY_KEY_ID not configured');
  }
  if (!process.env.RAZORPAY_KEY_SECRET) {
    console.warn('⚠️ RAZORPAY_KEY_SECRET not configured');
  }
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    console.warn('⚠️ RAZORPAY_WEBHOOK_SECRET not configured');
  }
};

// Create Razorpay order
const createRazorpayOrder = async (amount, customerId, notes = {}) => {
  try {
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}_${customerId}`,
      payment_capture: 1,
      notes: {
        customerId: customerId.toString(),
        ...notes,
        timestamp: new Date().toISOString()
      },
      timeout: 600 // 10 minutes
    };

    const order = await razorpay.orders.create(options);
    
    console.log(`✅ Razorpay order created: ${order.id} for amount ₹${amount}`);
    
    return {
      success: true,
      orderId: order.id,
      amount: order.amount / 100, // Convert back to rupees
      currency: order.currency,
      receipt: order.receipt,
      createdAt: new Date(order.created_at * 1000)
    };
  } catch (error) {
    console.error('❌ Failed to create Razorpay order:', error.message);
    return {
      success: false,
      error: error.message,
      code: 'RAZORPAY_ORDER_CREATION_FAILED'
    };
  }
};

// Verify payment signature
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const isValid = expectedSignature === signature;
    
    if (isValid) {
      console.log(`✅ Payment signature verified for: ${paymentId}`);
    } else {
      console.warn(`❌ Invalid payment signature for: ${paymentId}`);
    }
    
    return isValid;
  } catch (error) {
    console.error('Error verifying payment signature:', error);
    return false;
  }
};

// Verify webhook signature
const verifyWebhookSignature = (body, signature) => {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
};

// Fetch payment details from Razorpay
const fetchPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return {
      success: true,
      payment: {
        id: payment.id,
        orderId: payment.order_id,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        description: payment.description,
        email: payment.email,
        contact: payment.contact,
        fee: payment.fee / 100,
        tax: payment.tax / 100,
        acquirerData: payment.acquirer_data,
        createdAt: new Date(payment.created_at * 1000)
      }
    };
  } catch (error) {
    console.error('Error fetching payment details:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Refund payment
const refundPayment = async (paymentId, amount = null, reason = '') => {
  try {
    const refundOptions = {
      payment_id: paymentId
    };

    if (amount) {
      refundOptions.amount = Math.round(amount * 100); // Convert to paise
    }

    if (reason) {
      refundOptions.notes = { reason };
    }

    const refund = await razorpay.payments.refund(paymentId, refundOptions);
    
    console.log(`✅ Refund processed: ${refund.id} for payment ${paymentId}`);
    
    return {
      success: true,
      refundId: refund.id,
      paymentId: refund.payment_id,
      amount: refund.amount / 100,
      status: refund.status,
      createdAt: new Date(refund.created_at * 1000)
    };
  } catch (error) {
    console.error('Error refunding payment:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Handle successful payment
const handlePaymentSuccess = async (paymentData) => {
  try {
    const { id: paymentId, order_id: orderId, amount, email, contact } = paymentData;

    // Find order in database
    const order = await Order.findOne({ 'payment.razorpayOrderId': orderId });

    if (!order) {
      console.warn(`⚠️ Order not found for Razorpay Order ID: ${orderId}`);
      return { success: false, error: 'Order not found' };
    }

    // Update order with payment details
    order.payment = {
      ...order.payment,
      status: 'completed',
      razorpayPaymentId: paymentId,
      razorpayOrderId: orderId,
      amount: amount / 100,
      method: paymentData.method || 'razorpay',
      email,
      contact,
      paidAt: new Date()
    };

    order.status = 'confirmed';
    await order.save();

    // Update inventory
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: {
          'inventory.reserved': -item.quantity,
          'inventory.sold': item.quantity
        }
      });
    }

    console.log(`✅ Payment success recorded for order ${order._id}`);

    return {
      success: true,
      orderId: order._id,
      orderStatus: order.status
    };
  } catch (error) {
    console.error('Error handling payment success:', error);
    return { success: false, error: error.message };
  }
};

// Handle failed payment
const handlePaymentFailure = async (paymentData) => {
  try {
    const { order_id: orderId, error_description } = paymentData;

    const order = await Order.findOne({ 'payment.razorpayOrderId': orderId });

    if (!order) {
      console.warn(`⚠️ Order not found for failed payment: ${orderId}`);
      return { success: false, error: 'Order not found' };
    }

    // Update order status
    order.payment.status = 'failed';
    order.payment.failureReason = error_description;
    order.status = 'failed';
    await order.save();

    // Rollback inventory
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: {
          'inventory.reserved': -item.quantity,
          'inventory.available': item.quantity
        }
      });
    }

    console.log(`❌ Payment failure recorded for order ${order._id}`);

    return {
      success: true,
      orderId: order._id,
      failureReason: error_description
    };
  } catch (error) {
    console.error('Error handling payment failure:', error);
    return { success: false, error: error.message };
  }
};

// Check payment status
const checkPaymentStatus = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return {
      success: true,
      status: payment.status,
      id: payment.id,
      amount: payment.amount / 100,
      currency: payment.currency,
      method: payment.method,
      email: payment.email,
      contact: payment.contact,
      createdAt: new Date(payment.created_at * 1000)
    };
  } catch (error) {
    console.error('Error checking payment status:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Validate amount (prevent transaction abuse)
const validateAmount = (amount) => {
  const minAmount = 1; // ₹1
  const maxAmount = 1000000; // ₹10,00,000

  if (amount < minAmount || amount > maxAmount) {
    return {
      valid: false,
      error: `Amount must be between ₹${minAmount} and ₹${maxAmount}`
    };
  }

  return { valid: true };
};

module.exports = {
  razorpay,
  validateRazorpayConfig,
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  fetchPaymentDetails,
  refundPayment,
  handlePaymentSuccess,
  handlePaymentFailure,
  checkPaymentStatus,
  validateAmount
};
