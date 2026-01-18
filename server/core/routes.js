/**
 * Consolidated Routes System
 * All API routes organized in one file with clear sections
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// Models
const User = require('../models/User');
const Artisan = require('../models/Artisan');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Wishlist = require('../models/Wishlist');

// Middleware
const { protect, optionalAuth, authorize } = require('./middleware');

// ==================== AUTHENTICATION ROUTES ====================

const authRoutes = express.Router();

// Register
authRoutes.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').trim().isLength({ min: 10 }).withMessage('Valid phone number is required'),
  body('role').isIn(['customer', 'artisan']).withMessage('Role must be customer or artisan')
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

    const { name, email, password, phone, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role
    });

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('kalakari-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Login
authRoutes.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
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

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('kalakari-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get current user
authRoutes.get('/me', protect, async (req, res) => {
  try {
    const user = req.user;
    
    let artisanProfile = null;
    if (user.role === 'artisan') {
      artisanProfile = await Artisan.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          addresses: user.addresses
        },
        artisanProfile
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Logout
authRoutes.post('/logout', protect, (req, res) => {
  res.clearCookie('kalakari-token');
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// ==================== PRODUCT ROUTES ====================

const productRoutes = express.Router();

// Get all products
productRoutes.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      category, 
      artisanId, 
      minPrice, 
      maxPrice, 
      search, 
      state,
      minRating,
      materials,
      colors,
      inStock,
      featured,
      page = 1, 
      limit = 12,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = { isActive: true, isApproved: true };
    
    // Basic filters
    if (category) query.category = category;
    if (artisanId) query.artisanId = artisanId;
    if (featured === 'true') query.isFeatured = true;
    
    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Stock filter
    if (inStock === 'true') {
      query['inventory.available'] = { $gt: 0 };
    }
    
    // Rating filter
    if (minRating) {
      query['rating.average'] = { $gte: parseFloat(minRating) };
    }
    
    // Materials filter
    if (materials) {
      const materialArray = Array.isArray(materials) ? materials : materials.split(',');
      query.materials = { $in: materialArray };
    }
    
    // Colors filter
    if (colors) {
      const colorArray = Array.isArray(colors) ? colors : colors.split(',');
      query.colors = { $in: colorArray };
    }
    
    // Text search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = {};
    sortObj[sort] = sortOrder;

    let productsQuery = Product.find(query);
    
    // Add state filter to populated artisan
    if (state) {
      productsQuery = productsQuery.populate({
        path: 'artisanId',
        match: { state: state },
        select: 'businessName state city craftType'
      });
    } else {
      productsQuery = productsQuery.populate('artisanId', 'businessName state city craftType');
    }

    const total = await Product.countDocuments(query);
    const products = await productsQuery
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Filter out products with null artisans (for state filter)
    const filteredProducts = products.filter(product => product.artisanId !== null);

    res.json({
      success: true,
      data: {
        products: filteredProducts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get single product
productRoutes.get('/:id', optionalAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('artisanId', 'businessName state city craftType description rating')
      .populate('reviews.userId', 'name');

    if (!product || !product.isActive || !product.isApproved) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count
    await Product.findByIdAndUpdate(req.params.id, {
      $inc: { 'stats.views': 1 }
    });

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create product
productRoutes.post('/', protect, authorize('artisan'), [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('category').isIn(['Pottery', 'Textiles', 'Jewelry', 'Woodwork', 'Metalwork', 'Leather', 'Bamboo', 'Stone', 'Glass', 'Paper', 'Home Decor', 'Kitchenware', 'Accessories', 'Clothing', 'Footwear', 'Other']).withMessage('Invalid category'),
  body('price').isFloat({ min: 1 }).withMessage('Price must be at least ₹1'),
  body('inventory.total').isInt({ min: 0 }).withMessage('Total inventory must be a non-negative number'),
  body('inventory.available').isInt({ min: 0 }).withMessage('Available inventory must be a non-negative number')
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

    // Get artisan profile
    const artisan = await Artisan.findOne({ userId: req.user._id });
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    if (!artisan.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Artisan profile must be approved to add products'
      });
    }

    const productData = {
      artisanId: artisan._id,
      ...req.body
    };

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ==================== ORDER ROUTES ====================

const orderRoutes = express.Router();

// Create order
orderRoutes.post('/', protect, authorize('customer'), [
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

    const { items, shippingAddress, paymentMethod = 'cod' } = req.body;

    // Validate products and calculate totals
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive || !product.isApproved) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.productId} not available`
        });
      }

      if (product.inventory.available < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        total: itemTotal,
        artisanId: product.artisanId
      });
    }

    // Create order
    const order = await Order.create({
      userId: req.user._id,
      items: validatedItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      status: paymentMethod === 'cod' ? 'pending' : 'processing'
    });

    // Update inventory
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: {
          'inventory.available': -item.quantity,
          'inventory.reserved': item.quantity,
          'stats.orders': 1
        }
      });
    }

    res.status(201).json({
      success: true,
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

// Get user orders
orderRoutes.get('/', protect, authorize('customer'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { userId: req.user._id };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('items.productId', 'name images')
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
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ==================== HEALTH ROUTES ====================

const healthRoutes = express.Router();

healthRoutes.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0'
    }
  });
});

healthRoutes.get('/database', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    res.json({
      success: true,
      data: {
        status: states[state],
        readyState: state,
        host: mongoose.connection.host,
        database: mongoose.connection.name
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Database health check failed'
    });
  }
});

// ==================== API DOCS ROUTES ====================

const docsRoutes = express.Router();

docsRoutes.get('/', (req, res) => {
  const apiDoc = {
    name: 'Kalakari API',
    version: '1.0.0',
    description: 'E-commerce API for traditional Indian handicrafts marketplace',
    baseUrl: `${req.protocol}://${req.get('host')}/api`,
    documentation: `${req.protocol}://${req.get('host')}/api/docs`,
    
    endpoints: {
      auth: '/auth',
      products: '/products',
      orders: '/orders',
      artisans: '/artisans',
      cart: '/cart',
      wishlist: '/wishlist',
      reviews: '/reviews',
      admin: '/admin',
      search: '/search',
      health: '/health'
    },
    
    authentication: {
      type: 'Bearer Token (JWT)',
      cookie: 'kalakari-token (HTTP-only)',
      csrf: 'X-CSRF-Token header required'
    },
    
    rateLimits: {
      general: '100 requests per 15 minutes',
      auth: '5 requests per 15 minutes',
      upload: '10 requests per 15 minutes'
    }
  };
  
  res.json(apiDoc);
});

// ==================== EXPORTS ====================

module.exports = {
  authRoutes,
  productRoutes,
  orderRoutes,
  healthRoutes,
  docsRoutes
};
