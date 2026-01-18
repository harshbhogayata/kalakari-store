const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const Product = require('../models/Product');
const Artisan = require('../models/Artisan');

// @desc    Get search suggestions
// @route   GET /api/search/suggestions
// @access  Public
router.get('/suggestions', optionalAuth, async (req, res) => {
  try {
    const { q, limit = 8 } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: { suggestions: [] }
      });
    }
    
    const searchRegex = new RegExp(q, 'i');
    
    // Search products
    const products = await Product.find({
      $and: [
        { isActive: true, isApproved: true },
        { $or: [
          { name: searchRegex },
          { description: searchRegex },
          { category: searchRegex },
          { tags: { $in: [searchRegex] } }
        ]}
      ]
    })
    .limit(5)
    .select('name category _id');
    
    // Search artisans
    const artisans = await Artisan.find({
      $and: [
        { isActive: true },
        { $or: [
          { businessName: searchRegex },
          { craftType: searchRegex },
          { description: searchRegex }
        ]}
      ]
    })
    .limit(3)
    .select('businessName craftType _id');
    
    const suggestions = [
      ...products.map(product => ({
        _id: product._id,
        name: product.name,
        type: 'product'
      })),
      ...artisans.map(artisan => ({
        _id: artisan._id,
        name: artisan.businessName,
        type: 'artisan'
      })),
      // Add category suggestions
      ...new Set(products.map(p => p.category)).slice(0, 3).map(category => ({
        _id: category,
        name: category,
        type: 'category'
      }))
    ].slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: { suggestions }
    });
  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get trending searches
// @route   GET /api/search/trending
// @access  Public
router.get('/trending', optionalAuth, async (req, res) => {
  try {
    // Get most searched/viewed categories and products
    const trendingCategories = await Product.aggregate([
      { $match: { isActive: true, isApproved: true } },
      { $group: { _id: '$category', count: { $sum: 1 }, views: { $sum: '$stats.views' } } },
      { $sort: { views: -1 } },
      { $limit: 6 },
      { $project: { name: '$_id', _id: 0 } }
    ]);
    
    const trending = trendingCategories.map(item => item.name);
    
    res.json({
      success: true,
      data: { trending }
    });
  } catch (error) {
    console.error('Get trending searches error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

