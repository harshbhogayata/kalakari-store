const express = require('express');
const { body, validationResult } = require('express-validator');
const Artisan = require('../models/Artisan');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get artisan dashboard stats
// @route   GET /api/artisans/dashboard/stats
// @access  Private (Artisan)
router.get('/dashboard/stats', protect, authorize('artisan'), async (req, res) => {
  try {
    // Get artisan profile
    const artisan = await Artisan.findOne({ userId: req.user._id });
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    // Get product stats
    const totalProducts = await Product.countDocuments({ artisanId: artisan._id });
    const approvedProducts = await Product.countDocuments({ artisanId: artisan._id, isApproved: true });
    const pendingProducts = await Product.countDocuments({ artisanId: artisan._id, isApproved: false });

    // Get order stats
    const totalOrders = await Order.countDocuments({ 
      'items.artisanId': artisan._id 
    });
    const completedOrders = await Order.countDocuments({ 
      'items.artisanId': artisan._id, 
      status: 'delivered' 
    });
    const pendingOrders = await Order.countDocuments({ 
      'items.artisanId': artisan._id, 
      status: { $in: ['confirmed', 'processing', 'shipped'] } 
    });

    // Calculate total revenue
    const revenueOrders = await Order.find({ 
      'items.artisanId': artisan._id, 
      status: 'delivered' 
    });
    
    let totalRevenue = 0;
    revenueOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.artisanId.toString() === artisan._id.toString()) {
          totalRevenue += item.price * item.quantity;
        }
      });
    });

    // Get recent products
    const recentProducts = await Product.find({ artisanId: artisan._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name price isApproved createdAt');

    res.json({
      success: true,
      data: {
        stats: {
          products: {
            total: totalProducts,
            approved: approvedProducts,
            pending: pendingProducts
          },
          orders: {
            total: totalOrders,
            completed: completedOrders,
            pending: pendingOrders
          },
          revenue: {
            total: totalRevenue,
            monthly: Math.round(totalRevenue * 0.8), // Mock monthly revenue
            growth: 12.5 // Mock growth percentage
          },
          rating: artisan.rating || { average: 0, count: 0 },
          views: artisan.views || 0
        },
        recentProducts
      }
    });
  } catch (error) {
    console.error('Get artisan stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create artisan profile
// @route   POST /api/artisans
// @access  Private (Artisan)
router.post('/', protect, authorize('artisan'), [
  body('businessName').trim().isLength({ min: 2, max: 100 }).withMessage('Business name must be between 2 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('craftType').isIn(['Pottery', 'Textiles', 'Jewelry', 'Woodwork', 'Metalwork', 'Leather', 'Bamboo', 'Stone', 'Glass', 'Paper', 'Other']).withMessage('Invalid craft type'),
  body('state').notEmpty().withMessage('State is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('experience').isInt({ min: 0 }).withMessage('Experience must be a non-negative number')
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

    // Check if artisan profile already exists
    const existingArtisan = await Artisan.findOne({ userId: req.user._id });
    if (existingArtisan) {
      return res.status(400).json({
        success: false,
        message: 'Artisan profile already exists'
      });
    }

    const artisanData = {
      userId: req.user._id,
      ...req.body
    };

    const artisan = await Artisan.create(artisanData);

    res.status(201).json({
      success: true,
      message: 'Artisan profile created successfully',
      data: { artisan }
    });
  } catch (error) {
    console.error('Create artisan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get artisan profile
// @route   GET /api/artisans/profile
// @access  Private (Artisan)
router.get('/profile', protect, authorize('artisan'), async (req, res) => {
  try {
    const artisan = await Artisan.findOne({ userId: req.user._id })
      .populate('userId', 'name email phone');

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    res.json({
      success: true,
      data: { artisan }
    });
  } catch (error) {
    console.error('Get artisan profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update artisan profile
// @route   PUT /api/artisans/profile
// @access  Private (Artisan)
router.put('/profile', protect, authorize('artisan'), [
  body('businessName').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Business name must be between 2 and 100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('craftType').optional().isIn(['Pottery', 'Textiles', 'Jewelry', 'Woodwork', 'Metalwork', 'Leather', 'Bamboo', 'Stone', 'Glass', 'Paper', 'Other']).withMessage('Invalid craft type'),
  body('state').optional().notEmpty().withMessage('State cannot be empty'),
  body('city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('experience').optional().isInt({ min: 0 }).withMessage('Experience must be a non-negative number')
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

    const artisan = await Artisan.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone');

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Artisan profile updated successfully',
      data: { artisan }
    });
  } catch (error) {
    console.error('Update artisan profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get all artisans (public)
// @route   GET /api/artisans
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { craftType, state, page = 1, limit = 10 } = req.query;
    
    const query = { isApproved: true, isVerified: true };
    
    if (craftType) query.craftType = craftType;
    if (state) query.state = state;

    const artisans = await Artisan.find(query)
      .populate('userId', 'name email')
      .select('-bankDetails -documents')
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
    console.error('Get artisans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single artisan by ID (public)
// @route   GET /api/artisans/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.params.id)
      .populate('userId', 'name email')
      .select('-bankDetails -documents');

    if (!artisan || !artisan.isApproved) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    res.json({
      success: true,
      data: { artisan }
    });
  } catch (error) {
    console.error('Get artisan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get artisan dashboard stats
// @route   GET /api/artisans/dashboard/stats
// @access  Private (Artisan)
router.get('/dashboard/stats', protect, authorize('artisan'), async (req, res) => {
  try {
    const artisan = await Artisan.findOne({ userId: req.user._id });
    
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    // Get product count
    const Product = require('../models/Product');
    const Order = require('../models/Order');
    
    const productCount = await Product.countDocuments({ artisanId: artisan._id });
    const activeProductCount = await Product.countDocuments({ 
      artisanId: artisan._id, 
      isActive: true, 
      isApproved: true 
    });
    
    // Get order stats
    const orderStats = await Order.aggregate([
      { $match: { 'items.artisanId': artisan._id } },
      { $group: {
        _id: '$status',
        count: { $sum: 1 },
        total: { $sum: '$pricing.total' }
      }}
    ]);

    const stats = {
      totalProducts: productCount,
      activeProducts: activeProductCount,
      totalSales: artisan.totalSales,
      rating: artisan.rating,
      orders: orderStats.reduce((acc, stat) => {
        acc[stat._id] = { count: stat.count, total: stat.total };
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get artisan stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update bank details
// @route   PUT /api/artisans/bank-details
// @access  Private (Artisan)
router.put('/bank-details', protect, authorize('artisan'), [
  body('accountHolderName').trim().notEmpty().withMessage('Account holder name is required'),
  body('accountNumber').trim().notEmpty().withMessage('Account number is required'),
  body('ifscCode').trim().notEmpty().withMessage('IFSC code is required'),
  body('bankName').trim().notEmpty().withMessage('Bank name is required')
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

    const artisan = await Artisan.findOneAndUpdate(
      { userId: req.user._id },
      { bankDetails: req.body },
      { new: true, runValidators: true }
    );

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Bank details updated successfully'
    });
  } catch (error) {
    console.error('Update bank details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

