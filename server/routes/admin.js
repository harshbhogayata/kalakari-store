const express = require('express');
const { body, validationResult } = require('express-validator');
const Artisan = require('../models/Artisan');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require admin role
router.use(protect);
router.use(authorize('admin'));

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      totalArtisans,
      totalProducts,
      totalOrders,
      pendingArtisans,
      pendingProducts,
      recentOrders,
      topArtisans
    ] = await Promise.all([
      User.countDocuments(),
      Artisan.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Artisan.countDocuments({ isApproved: false }),
      Product.countDocuments({ isApproved: false }),
      Order.find().sort({ createdAt: -1 }).limit(10).populate('customerId', 'name email'),
      Artisan.find({ isApproved: true }).sort({ totalSales: -1 }).limit(5).populate('userId', 'name email')
    ]);

    // Calculate revenue
    const revenueData = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, totalRevenue: { $sum: '$pricing.total' } } }
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalArtisans,
          totalProducts,
          totalOrders,
          pendingArtisans,
          pendingProducts,
          totalRevenue
        },
        recentOrders,
        topArtisans
      }
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get all artisans for admin
// @route   GET /api/admin/artisans
// @access  Private (Admin)
router.get('/artisans', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, craftType, state } = req.query;

    const query = {};
    
    if (status === 'pending') {
      query.isApproved = false;
    } else if (status === 'approved') {
      query.isApproved = true;
    }
    
    if (craftType) query.craftType = craftType;
    if (state) query.state = state;

    const artisans = await Artisan.find(query)
      .populate('userId', 'name email phone createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Artisan.countDocuments(query);

    res.json({
      success: true,
      data: {
        artisans,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get admin artisans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single artisan for admin
// @route   GET /api/admin/artisans/:id
// @access  Private (Admin)
router.get('/artisans/:id', async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.params.id)
      .populate('userId', 'name email phone createdAt');

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    // Get artisan's products
    const products = await Product.find({ artisanId: artisan._id })
      .sort({ createdAt: -1 });

    // Get artisan's orders
    const orders = await Order.find({ 'items.artisanId': artisan._id })
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        artisan,
        products,
        orders
      }
    });
  } catch (error) {
    console.error('Get admin artisan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Approve/reject artisan
// @route   PUT /api/admin/artisans/:id/approve
// @access  Private (Admin)
router.put('/artisans/:id/approve', [
  body('isApproved').isBoolean().withMessage('isApproved must be a boolean'),
  body('notes').optional().trim()
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

    const { isApproved, notes } = req.body;

    const artisan = await Artisan.findByIdAndUpdate(
      req.params.id,
      { 
        isApproved,
        isVerified: isApproved // Auto-verify when approved
      },
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    res.json({
      success: true,
      message: `Artisan ${isApproved ? 'approved' : 'rejected'} successfully`,
      data: { artisan }
    });
  } catch (error) {
    console.error('Approve artisan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get all products for admin
// @route   GET /api/admin/products
// @access  Private (Admin)
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category } = req.query;

    const query = {};
    
    if (status === 'pending') {
      query.isApproved = false;
    } else if (status === 'approved') {
      query.isApproved = true;
    }
    
    if (category) query.category = category;

    const products = await Product.find(query)
      .populate('artisanId', 'businessName state city')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single product for admin
// @route   GET /api/admin/products/:id
// @access  Private (Admin)
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('artisanId', 'businessName state city craftType');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Get admin product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Approve/reject product
// @route   PUT /api/admin/products/:id/approve
// @access  Private (Admin)
router.put('/products/:id/approve', [
  body('isApproved').isBoolean().withMessage('isApproved must be a boolean'),
  body('notes').optional().trim()
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

    const { isApproved, notes } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true, runValidators: true }
    ).populate('artisanId', 'businessName');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: `Product ${isApproved ? 'approved' : 'rejected'} successfully`,
      data: { product }
    });
  } catch (error) {
    console.error('Approve product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get all orders for admin
// @route   GET /api/admin/orders
// @access  Private (Admin)
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = {};
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('customerId', 'name email phone')
      .populate('items.productId', 'name')
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
    console.error('Get admin orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get all users for admin
// @route   GET /api/admin/users
// @access  Private (Admin)
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;

    const query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
router.put('/users/:id/status', [
  body('isActive').isBoolean().withMessage('isActive must be a boolean')
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

    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

