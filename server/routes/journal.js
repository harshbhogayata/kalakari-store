const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const Journal = require('../models/Journal');

// @desc    Get all journal posts
// @route   GET /api/journal
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    
    const query = { isPublished: true };
    if (category) {
      query.category = category;
    }
    
    const posts = await Journal.find(query)
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-content'); // Don't include full content in list view
    
    const total = await Journal.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get journal posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single journal post
// @route   GET /api/journal/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await Journal.findOne({ 
      _id: req.params.id, 
      isPublished: true 
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Journal post not found'
      });
    }

    // Increment view count
    await Journal.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({
      success: true,
      data: { post }
    });
  } catch (error) {
    console.error('Get journal post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;