const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Journal model (you'll need to create this)
const Journal = require('../models/Journal');

// @desc    Get all journal articles
// @route   GET /api/journal
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, featured, search } = req.query;
    
    const query = { isPublished: true };
    
    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const articles = await Journal.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Journal.countDocuments(query);

    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get journal articles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single journal article
// @route   GET /api/journal/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const article = await Journal.findById(req.params.id)
      .populate('author', 'name email');

    if (!article || !article.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Increment view count
    await Journal.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({
      success: true,
      data: { article }
    });
  } catch (error) {
    console.error('Get journal article error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new journal article
// @route   POST /api/journal
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('content').trim().isLength({ min: 100 }).withMessage('Content must be at least 100 characters'),
  body('category').notEmpty().withMessage('Category is required'),
  body('excerpt').optional().trim().isLength({ max: 300 }).withMessage('Excerpt must not exceed 300 characters')
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

    const { title, content, category, excerpt, tags, isFeatured } = req.body;

    const article = await Journal.create({
      title,
      content,
      category,
      excerpt: excerpt || content.substring(0, 200) + '...',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      author: req.user._id,
      isFeatured: isFeatured === 'true' || false,
      isPublished: true
    });

    const populatedArticle = await Journal.findById(article._id)
      .populate('author', 'name email');

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: { article: populatedArticle }
    });
  } catch (error) {
    console.error('Create journal article error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update journal article
// @route   PUT /api/journal/:id
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), [
  body('title').optional().trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('content').optional().trim().isLength({ min: 100 }).withMessage('Content must be at least 100 characters'),
  body('excerpt').optional().trim().isLength({ max: 300 }).withMessage('Excerpt must not exceed 300 characters')
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

    const article = await Journal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'name email');

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    res.json({
      success: true,
      message: 'Article updated successfully',
      data: { article }
    });
  } catch (error) {
    console.error('Update journal article error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete journal article
// @route   DELETE /api/journal/:id
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const article = await Journal.findByIdAndDelete(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    res.json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    console.error('Delete journal article error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
