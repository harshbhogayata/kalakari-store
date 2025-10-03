const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const { protect, authorize } = require('../middleware/auth');
const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Max 5 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// @desc    Get reviews for a product
// @route   GET /api/products/:productId/reviews
// @access  Public
router.get('/products/:productId/reviews', async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      rating,
      status = 'approved'
    } = req.query;

    // Build query
    const query = { productId, status };
    if (rating) {
      query.rating = parseInt(rating);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get reviews
    const reviews = await Review.find(query)
      .populate('customerId', 'name avatar')
      .populate('response.respondedBy', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Review.countDocuments(query);

    // Calculate stats
    const stats = await Review.aggregate([
      { $match: { productId, status: 'approved' } },
      {
        $group: {
          _id: null,
          average: { $avg: '$rating' },
          total: { $sum: 1 },
          breakdown: {
            $push: '$rating'
          }
        }
      }
    ]);

    // Process breakdown
    const breakdown = [1, 2, 3, 4, 5].map(rating => ({
      _id: rating,
      count: stats[0]?.breakdown.filter(r => r === rating).length || 0
    }));

    const reviewStats = {
      average: stats[0]?.average || 0,
      total: stats[0]?.total || 0,
      breakdown
    };

    res.json({
      success: true,
      data: {
        reviews,
        stats: reviewStats,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          hasMore: skip + reviews.length < total
        }
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create a review
// @route   POST /api/products/:productId/reviews
// @access  Private (Customer)
router.post('/products/:productId/reviews', 
  protect,
  authorize('customer'),
  upload.array('images', 5),
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters'),
    body('comment').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { productId } = req.params;
      const { rating, title, comment } = req.body;
      const images = req.files || [];

      // Check if product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Check if user has already reviewed this product
      const existingReview = await Review.findOne({
        productId,
        customerId: req.user._id
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this product'
        });
      }

      // TODO: Check if user has purchased this product (for verified reviews)

      // Process images (upload to S3 in production)
      const imageUrls = images.map(file => ({
        url: `https://via.placeholder.com/300x300?text=Review+Image`, // Placeholder for now
        alt: `Review image for ${product.name}`
      }));

      // Create review
      const review = await Review.create({
        productId,
        customerId: req.user._id,
        rating: parseInt(rating),
        title,
        comment,
        images: imageUrls,
        status: 'pending' // Admin approval required
      });

      // Populate the review
      await review.populate('customerId', 'name avatar');

      res.status(201).json({
        success: true,
        message: 'Review submitted successfully and is pending approval',
        data: { review }
      });
    } catch (error) {
      console.error('Create review error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
);

// @desc    Mark review as helpful
// @route   POST /api/reviews/:reviewId/helpful
// @access  Private (Customer)
router.post('/reviews/:reviewId/helpful', protect, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user has already marked as helpful
    const hasMarkedHelpful = review.helpful.users.includes(userId);
    
    if (hasMarkedHelpful) {
      // Remove from helpful
      review.helpful.users = review.helpful.users.filter(id => id.toString() !== userId.toString());
      review.helpful.count = Math.max(0, review.helpful.count - 1);
    } else {
      // Add to helpful
      review.helpful.users.push(userId);
      review.helpful.count += 1;
    }

    await review.save();

    res.json({
      success: true,
      message: hasMarkedHelpful ? 'Removed from helpful' : 'Marked as helpful',
      data: {
        helpful: review.helpful
      }
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Respond to a review (Artisan)
// @route   POST /api/reviews/:reviewId/respond
// @access  Private (Artisan)
router.post('/reviews/:reviewId/respond',
  protect,
  authorize('artisan'),
  [
    body('response').trim().isLength({ min: 1, max: 500 }).withMessage('Response must be between 1 and 500 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { reviewId } = req.params;
      const { response } = req.body;

      const review = await Review.findById(reviewId).populate('productId');
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      // Check if the artisan owns the product
      if (review.productId.artisanId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only respond to reviews for your own products'
        });
      }

      // Check if already responded
      if (review.response) {
        return res.status(400).json({
          success: false,
          message: 'You have already responded to this review'
        });
      }

      // Add response
      review.response = {
        text: response,
        respondedBy: req.user._id,
        respondedAt: new Date()
      };

      await review.save();
      await review.populate('response.respondedBy', 'name');

      res.json({
        success: true,
        message: 'Response added successfully',
        data: { review }
      });
    } catch (error) {
      console.error('Respond to review error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
);

// @desc    Report a review
// @route   POST /api/reviews/:reviewId/report
// @access  Private
router.post('/reviews/:reviewId/report',
  protect,
  [
    body('reason').trim().isLength({ min: 1, max: 500 }).withMessage('Reason must be between 1 and 500 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { reviewId } = req.params;
      const { reason } = req.body;

      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      // Check if user has already reported this review
      if (review.reports.some(report => report.reportedBy.toString() === req.user._id.toString())) {
        return res.status(400).json({
          success: false,
          message: 'You have already reported this review'
        });
      }

      // Add report
      review.reports.push({
        reportedBy: req.user._id,
        reason,
        reportedAt: new Date()
      });

      await review.save();

      res.json({
        success: true,
        message: 'Review reported successfully'
      });
    } catch (error) {
      console.error('Report review error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
);

// @desc    Get review statistics for admin
// @route   GET /api/admin/reviews/stats
// @access  Private (Admin)
router.get('/admin/reviews/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const stats = await Review.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalReviews = await Review.countDocuments();
    const pendingReviews = await Review.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      data: {
        total: totalReviews,
        pending: pendingReviews,
        breakdown: stats
      }
    });
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Approve/reject review
// @route   PUT /api/admin/reviews/:reviewId/approve
// @access  Private (Admin)
router.put('/admin/reviews/:reviewId/approve',
  protect,
  authorize('admin'),
  [
    body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected'),
    body('notes').optional().trim().isLength({ max: 200 }).withMessage('Notes must be less than 200 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { reviewId } = req.params;
      const { status, notes } = req.body;

      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      review.status = status;
      if (notes) {
        review.adminNotes = notes;
      }

      await review.save();

      res.json({
        success: true,
        message: `Review ${status} successfully`,
        data: { review }
      });
    } catch (error) {
      console.error('Approve review error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
);

module.exports = router;