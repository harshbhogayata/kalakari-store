const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');
const router = express.Router();

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      data: {
        items: user.cart || []
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { productId, quantity = 1, variant } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user.cart) {
      user.cart = [];
    }

    // Check if item already exists in cart
    const existingItemIndex = user.cart.findIndex(item => 
      item.productId.toString() === productId && 
      JSON.stringify(item.variant) === JSON.stringify(variant)
    );

    if (existingItemIndex > -1) {
      // Update quantity
      user.cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      user.cart.push({
        productId,
        quantity,
        variant: variant || {},
        addedAt: new Date()
      });
    }

    await user.save();

    res.json({
      success: true,
      message: 'Item added to cart',
      data: {
        cart: user.cart
      }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
router.put('/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, variant } = req.body;

    const user = await User.findById(req.user._id);
    if (!user.cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    const itemIndex = user.cart.findIndex(item => 
      item.productId.toString() === productId && 
      JSON.stringify(item.variant) === JSON.stringify(variant)
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    if (quantity <= 0) {
      // Remove item
      user.cart.splice(itemIndex, 1);
    } else {
      // Update quantity
      user.cart[itemIndex].quantity = quantity;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Cart updated',
      data: {
        cart: user.cart
      }
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
router.delete('/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const { variant } = req.body;

    const user = await User.findById(req.user._id);
    if (!user.cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    const itemIndex = user.cart.findIndex(item => 
      item.productId.toString() === productId && 
      JSON.stringify(item.variant) === JSON.stringify(variant)
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    user.cart.splice(itemIndex, 1);
    await user.save();

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: {
        cart: user.cart
      }
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();

    res.json({
      success: true,
      message: 'Cart cleared',
      data: {
        cart: []
      }
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
