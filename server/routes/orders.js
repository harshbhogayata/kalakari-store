const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Artisan = require('../models/Artisan');
const { protect, authorize } = require('../middleware/auth');
const emailService = require('../services/email');
const smsService = require('../services/sms');

const router = express.Router();

// @desc    Create order
// @route   POST /api/orders
// @access  Private (Customer)
router.post('/', protect, authorize('customer'), [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.productId').isMongoId().withMessage('Valid product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shippingAddress.name').trim().notEmpty().withMessage('Shipping name is required'),
  body('shippingAddress.street').trim().notEmpty().withMessage('Shipping street is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('Shipping city is required'),
  body('shippingAddress.state').trim().notEmpty().withMessage('Shipping state is required'),
  body('shippingAddress.pincode').trim().notEmpty().withMessage('Shipping pincode is required'),
  body('shippingAddress.phone').trim().notEmpty().withMessage('Shipping phone is required')
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

    const { items, shippingAddress, billingAddress, paymentMethod = 'razorpay' } = req.body;

    // Validate products and calculate totals
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId)
        .populate('artisanId');

      if (!product || !product.isActive || !product.isApproved) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.productId} is not available`
        });
      }

      if (product.inventory.available < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for product ${product.name}`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        productId: product._id,
        artisanId: product.artisanId._id,
        quantity: item.quantity,
        price: product.price,
        variant: item.variant || {}
      });
    }

    // Calculate totals
    const shipping = subtotal >= 1000 ? 0 : 50; // Free shipping above ₹1000 (Fixed: >= for consistency)
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const total = subtotal + shipping + tax;

    // Generate unique order ID
    const orderId = `ORD${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create order
    const orderData = {
      orderId,
      customerId: req.user._id,
      items: validatedItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      pricing: {
        subtotal,
        shipping,
        tax,
        total
      },
      payment: {
        method: paymentMethod,
        status: 'pending'
      },
      status: 'pending'
    };

    const order = await Order.create(orderData);

    // Reserve inventory
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: {
          'inventory.available': -item.quantity,
          'inventory.reserved': item.quantity
        }
      });
    }

    // Send dual email notifications
    try {
      await emailService.sendOrderConfirmation(order);
      console.log(`✅ Order confirmation emails sent for order ${order.orderId}`);
    } catch (emailError) {
      console.error('❌ Failed to send order confirmation emails:', emailError);
      // Don't fail the order creation if email fails
    }

    // Send SMS notification
    try {
      const smsResult = await smsService.sendOrderConfirmation(
        shippingAddress.phone, 
        {
          orderId: order.orderId,
          total: order.pricing.total
        }
      );
      if (smsResult.success) {
        console.log(`✅ Order confirmation SMS sent for order ${order.orderId}`);
      }
    } catch (smsError) {
      console.error('❌ Failed to send order confirmation SMS:', smsError);
      // Don't fail the order creation if SMS fails
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get customer orders
// @route   GET /api/orders
// @access  Private (Customer)
router.get('/', protect, authorize('customer'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { customerId: req.user._id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('items.productId', 'name images price')
      .populate('items.artisanId', 'businessName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('items.productId', 'name images price category')
      .populate('items.artisanId', 'businessName state city');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user has access to this order
    if (order.customerId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      // Check if user is an artisan with products in this order
      const artisan = await Artisan.findOne({ userId: req.user._id });
      if (!artisan || !order.items.some(item => item.artisanId._id.toString() === artisan._id.toString())) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get artisan orders
// @route   GET /api/orders/artisan/my-orders
// @access  Private (Artisan)
router.get('/artisan/my-orders', protect, authorize('artisan'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    // Get artisan profile
    const artisan = await Artisan.findOne({ userId: req.user._id });
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    const query = { 'items.artisanId': artisan._id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('customerId', 'name email phone')
      .populate('items.productId', 'name images price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Filter items to only show artisan's products
    const filteredOrders = orders.map(order => ({
      ...order.toObject(),
      items: order.items.filter(item => 
        item.artisanId.toString() === artisan._id.toString()
      )
    }));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders: filteredOrders,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get artisan orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update order status (Artisan)
// @route   PUT /api/orders/:id/status
// @access  Private (Artisan)
router.put('/:id/status', protect, authorize('artisan'), [
  body('status').isIn(['confirmed', 'processing', 'shipped', 'delivered']).withMessage('Invalid status'),
  body('note').optional().trim()
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

    const { status, note, trackingNumber, carrier } = req.body;

    // Get artisan profile
    const artisan = await Artisan.findOne({ userId: req.user._id });
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if artisan has products in this order
    const hasArtisanProducts = order.items.some(item => 
      item.artisanId.toString() === artisan._id.toString()
    );

    if (!hasArtisanProducts) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this order'
      });
    }

    // Update order
    const updateData = { status };
    
    if (trackingNumber) {
      updateData['tracking.number'] = trackingNumber;
    }
    
    if (carrier) {
      updateData['tracking.carrier'] = carrier;
    }

    if (status === 'shipped') {
      updateData['tracking.estimatedDelivery'] = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: updateData,
        $push: {
          timeline: {
            status,
            note: note || `Order status updated to ${status}`,
            updatedBy: req.user.name
          }
        }
      },
      { new: true }
    );

    // If order is delivered, update inventory and sales
    if (status === 'delivered') {
      for (const item of order.items) {
        if (item.artisanId.toString() === artisan._id.toString()) {
          // Update product stats
          await Product.findByIdAndUpdate(item.productId, {
            $inc: {
              'inventory.reserved': -item.quantity,
              'stats.orders': 1
            }
          });

          // Update artisan sales
          await Artisan.findByIdAndUpdate(artisan._id, {
            $inc: { totalSales: item.price * item.quantity }
          });
        }
      }
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order: updatedOrder }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private (Customer)
router.put('/:id/cancel', protect, authorize('customer'), [
  body('reason').optional().trim()
], async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (['cancelled', 'delivered', 'shipped'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled'
      });
    }

    // Update order
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: { status: 'cancelled' },
        $push: {
          timeline: {
            status: 'cancelled',
            note: reason || 'Order cancelled by customer',
            updatedBy: req.user.name
          }
        }
      },
      { new: true }
    );

    // Release reserved inventory
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: {
          'inventory.available': item.quantity,
          'inventory.reserved': -item.quantity
        }
      });
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order: updatedOrder }
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get artisan's orders
// @route   GET /api/orders/artisan/my-orders
// @access  Private (Artisan)
router.get('/artisan/my-orders', protect, authorize('artisan'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    // Get artisan profile
    const artisan = await Artisan.findOne({ userId: req.user._id });
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    // Build query for orders containing artisan's products
    const query = { 'items.artisanId': artisan._id };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('customerId', 'name email phone')
      .populate('items.productId', 'name images price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get artisan orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

