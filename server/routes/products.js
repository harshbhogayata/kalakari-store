const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const Artisan = require('../models/Artisan');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Create product
// @route   POST /api/products
// @access  Private (Artisan)
router.post('/', protect, authorize('artisan'), [
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
      message: 'Product created successfully',
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

// @desc    Get artisan's own products
// @route   GET /api/products/artisan/my-products
// @access  Private (Artisan)
router.get('/artisan/my-products', protect, authorize('artisan'), async (req, res) => {
  try {
    const { page = 1, limit = 12, status } = req.query;
    
    // Get artisan profile
    const artisan = await Artisan.findOne({ userId: req.user._id });
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    const query = { artisanId: artisan._id };
    if (status) {
      query.isApproved = status === 'approved';
    }

    const products = await Product.find(query)
      .populate('artisanId', 'businessName city state')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get artisan products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get all products (public)
// @route   GET /api/products
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
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
    
    const products = await productsQuery
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Filter out products with null artisanId (when state filter doesn't match)
    const filteredProducts = products.filter(product => product.artisanId !== null);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products: filteredProducts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
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

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('artisanId', 'businessName state city craftType description profileImage rating');

    if (!product || !product.isActive || !product.isApproved) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count
    await Product.findByIdAndUpdate(req.params.id, { $inc: { 'stats.views': 1 } });

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

// @desc    Get artisan's products
// @route   GET /api/products/artisan/my-products
// @access  Private (Artisan)
router.get('/artisan/my-products', protect, authorize('artisan'), async (req, res) => {
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

    const query = { artisanId: artisan._id };
    
    if (status === 'active') {
      query.isActive = true;
      query.isApproved = true;
    } else if (status === 'pending') {
      query.isApproved = false;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const products = await Product.find(query)
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
    console.error('Get artisan products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Artisan)
router.put('/:id', protect, authorize('artisan'), [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('price').optional().isFloat({ min: 1 }).withMessage('Price must be at least ₹1'),
  body('inventory.total').optional().isInt({ min: 0 }).withMessage('Total inventory must be a non-negative number'),
  body('inventory.available').optional().isInt({ min: 0 }).withMessage('Available inventory must be a non-negative number')
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

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, artisanId: artisan._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you do not have permission to update it'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Artisan)
router.delete('/:id', protect, authorize('artisan'), async (req, res) => {
  try {
    // Get artisan profile
    const artisan = await Artisan.findOne({ userId: req.user._id });
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan profile not found'
      });
    }

    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      artisanId: artisan._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you do not have permission to delete it'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({
      isActive: true,
      isApproved: true,
      isFeatured: true
    })
      .populate('artisanId', 'businessName state city craftType')
      .sort({ 'stats.orders': -1, createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const { category } = req.params;

    const products = await Product.find({
      category,
      isActive: true,
      isApproved: true
    })
      .populate('artisanId', 'businessName state city craftType')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments({
      category,
      isActive: true,
      isApproved: true
    });

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
    console.error('Get products by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

