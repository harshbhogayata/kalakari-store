const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Validation middleware
const validateAddress = [
  body('type').isIn(['home', 'work', 'other']).withMessage('Invalid address type'),
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('street').trim().isLength({ min: 5, max: 200 }).withMessage('Street address must be between 5 and 200 characters'),
  body('city').trim().isLength({ min: 2, max: 50 }).withMessage('City must be between 2 and 50 characters'),
  body('state').trim().isLength({ min: 2, max: 50 }).withMessage('State must be between 2 and 50 characters'),
  body('pincode').matches(/^[1-9][0-9]{5}$/).withMessage('Please enter a valid 6-digit pincode'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit Indian mobile number'),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be a boolean')
];

// @desc    Get all addresses for user
// @route   GET /api/addresses
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('addresses');
    
    res.json({
      success: true,
      data: {
        addresses: user.addresses || []
      }
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Add new address
// @route   POST /api/addresses
// @access  Private
router.post('/', protect, validateAddress, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { type, name, street, city, state, pincode, phone, isDefault } = req.body;

    const user = await User.findById(req.user._id);
    
    // If setting as default, unset other default addresses
    if (isDefault) {
      user.addresses = user.addresses.map(addr => ({
        ...addr.toObject(),
        isDefault: false
      }));
    }
    
    // Add new address
    const newAddress = {
      type,
      name,
      street,
      city,
      state,
      pincode,
      phone,
      isDefault: isDefault || user.addresses.length === 0 // First address is default
    };
    
    user.addresses.push(newAddress);
    await user.save();
    
    const addedAddress = user.addresses[user.addresses.length - 1];
    
    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: {
        address: addedAddress
      }
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
router.put('/:id', protect, validateAddress, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { type, name, street, city, state, pincode, phone, isDefault } = req.body;
    const addressId = req.params.id;

    const user = await User.findById(req.user._id);
    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // If setting as default, unset other default addresses
    if (isDefault) {
      user.addresses = user.addresses.map(addr => ({
        ...addr.toObject(),
        isDefault: false
      }));
    }

    // Update address
    user.addresses[addressIndex] = {
      _id: user.addresses[addressIndex]._id,
      type,
      name,
      street,
      city,
      state,
      pincode,
      phone,
      isDefault
    };

    await user.save();

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: {
        address: user.addresses[addressIndex]
      }
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const addressId = req.params.id;
    const user = await User.findById(req.user._id);
    
    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    const wasDefault = user.addresses[addressIndex].isDefault;
    user.addresses.splice(addressIndex, 1);

    // If deleted address was default, set first address as default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Set address as default
// @route   PATCH /api/addresses/:id/default
// @access  Private
router.patch('/:id/default', protect, async (req, res) => {
  try {
    const addressId = req.params.id;
    const user = await User.findById(req.user._id);
    
    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Unset all default addresses
    user.addresses = user.addresses.map(addr => ({
      ...addr.toObject(),
      isDefault: false
    }));

    // Set this address as default
    user.addresses[addressIndex].isDefault = true;

    await user.save();

    res.json({
      success: true,
      message: 'Default address updated',
      data: {
        address: user.addresses[addressIndex]
      }
    });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
