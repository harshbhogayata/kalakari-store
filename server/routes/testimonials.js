const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Testimonial model
const Testimonial = require('../models/Testimonial');

// @desc    Get all testimonials
// @route   GET /api/testimonials
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, featured, rating } = req.query;
    
    const query = { isApproved: true };
    
    if (featured === 'true') query.isFeatured = true;
    if (rating) query.rating = parseInt(rating);

    const testimonials = await Testimonial.find(query)
      .populate('user', 'name email')
      .populate('product', 'name images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Testimonial.countDocuments(query);

    res.json({
      success: true,
      data: {
        testimonials,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single testimonial
// @route   GET /api/testimonials/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id)
      .populate('user', 'name email')
      .populate('product', 'name images artisanId')
      .populate('product.artisanId', 'businessName');

    if (!testimonial || !testimonial.isApproved) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.json({
      success: true,
      data: { testimonial }
    });
  } catch (error) {
    console.error('Get testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new testimonial
// @route   POST /api/testimonials
// @access  Private (Customer)
router.post('/', protect, authorize('customer'), [
  body('content').trim().isLength({ min: 10, max: 1000 }).withMessage('Content must be between 10 and 1000 characters'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('productId').isMongoId().withMessage('Valid product ID is required')
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

    const { content, rating, productId, images } = req.body;

    // Check if user already submitted testimonial for this product
    const existingTestimonial = await Testimonial.findOne({
      user: req.user._id,
      product: productId
    });

    if (existingTestimonial) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a testimonial for this product'
      });
    }

    // Check if user has purchased this product
    const Order = require('../models/Order');
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'items.productId': productId,
      status: { $in: ['confirmed', 'shipped', 'delivered'] }
    });

    if (!hasPurchased) {
      return res.status(400).json({
        success: false,
        message: 'You can only submit testimonials for products you have purchased'
      });
    }

    const testimonial = await Testimonial.create({
      content,
      rating,
      product: productId,
      user: req.user._id,
      images: images || [],
      isApproved: false,
      isFeatured: false
    });

    const populatedTestimonial = await Testimonial.findById(testimonial._id)
      .populate('user', 'name email')
      .populate('product', 'name images');

    res.status(201).json({
      success: true,
      message: 'Testimonial submitted successfully. It will be reviewed and published soon.',
      data: { testimonial: populatedTestimonial }
    });
  } catch (error) {
    console.error('Create testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update testimonial
// @route   PUT /api/testimonials/:id
// @access  Private (Customer - own testimonial only)
router.put('/:id', protect, authorize('customer'), [
  body('content').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Content must be between 10 and 1000 characters'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
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

    const testimonial = await Testimonial.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    // Update testimonial
    Object.assign(testimonial, req.body);
    testimonial.isApproved = false; // Reset approval status when updated
    
    await testimonial.save();

    const populatedTestimonial = await Testimonial.findById(testimonial._id)
      .populate('user', 'name email')
      .populate('product', 'name images');

    res.json({
      success: true,
      message: 'Testimonial updated successfully. It will be reviewed again.',
      data: { testimonial: populatedTestimonial }
    });
  } catch (error) {
    console.error('Update testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private (Customer - own testimonial only)
router.delete('/:id', protect, authorize('customer'), async (req, res) => {
  try {
    const testimonial = await Testimonial.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Approve testimonial (Admin only)
// @route   PUT /api/testimonials/:id/approve
// @access  Private (Admin)
router.put('/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const { isApproved, isFeatured } = req.body;

    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { isApproved, isFeatured },
      { new: true, runValidators: true }
    ).populate('user', 'name email')
     .populate('product', 'name images');

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.json({
      success: true,
      message: 'Testimonial status updated successfully',
      data: { testimonial }
    });
  } catch (error) {
    console.error('Approve testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
