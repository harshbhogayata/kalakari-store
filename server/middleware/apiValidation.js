// API Validation Middleware
const { body, query, param, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Generic validation error handler
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Product validation rules
exports.productValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .isIn(['Pottery', 'Textiles', 'Jewelry', 'Woodwork', 'Metalwork', 'Leather', 'Bamboo', 'Stone', 'Glass', 'Paper', 'Home Decor', 'Kitchenware', 'Accessories', 'Clothing', 'Footwear', 'Other'])
    .withMessage('Invalid category'),
  body('price')
    .isFloat({ min: 1 })
    .withMessage('Price must be at least ₹1'),
  body('originalPrice')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Original price must be at least ₹1'),
  body('subcategory')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Subcategory cannot exceed 50 characters'),
  body('inventory.total')
    .isInt({ min: 0 })
    .withMessage('Total inventory must be a non-negative number'),
  body('inventory.available')
    .isInt({ min: 0 })
    .withMessage('Available inventory must be a non-negative number'),
  body('inventory.reserved')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Reserved inventory must be a non-negative number')
];

// User validation rules
exports.userValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid Indian phone number')
];

// Order validation rules
exports.orderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.productId')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('shippingAddress.name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Shipping name is required'),
  body('shippingAddress.street')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Shipping street is required'),
  body('shippingAddress.city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Shipping city is required'),
  body('shippingAddress.state')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Shipping state is required'),
  body('shippingAddress.pincode')
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage('Please enter a valid Indian pincode'),
  body('shippingAddress.phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid Indian phone number')
];

// Artisan validation rules
exports.artisanValidation = [
  body('businessName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be between 20 and 1000 characters'),
  body('craftType')
    .isIn(['Pottery', 'Textiles', 'Jewelry', 'Woodwork', 'Metalwork', 'Leather', 'Bamboo', 'Stone', 'Glass', 'Paper', 'Other'])
    .withMessage('Invalid craft type'),
  body('state')
    .isLength({ min: 2, max: 50 })
    .withMessage('State is required'),
  body('city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City is required'),
  body('experience')
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience must be between 0 and 50 years')
];

// Review validation rules
exports.reviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('comment')
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Comment must be between 20 and 1000 characters')
];

// Query parameter validation
exports.paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sort')
    .optional()
    .isIn(['createdAt', 'price', 'name', 'rating', 'views', 'orders'])
    .withMessage('Invalid sort field'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc')
];

// MongoID parameter validation
exports.validateMondoId = (paramName = 'id') => {
  return param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} format`);
};

// API Response standardization
exports.standardResponse = (req, res, next) => {
  // Original send function
  const originalSend = res.send;
  
  // Override send function
  res.send = function(data) {
    let jsonData;
    
    try {
      jsonData = JSON.parse(data);
    } catch (e) {
      jsonData = data;
    }
    
    // If response doesn't follow standard format, wrap it
    if (!jsonData.success && !jsonData.error) {
      jsonData = {
        success: true,
        data: jsonData
      };
    }
    
    originalSend.call(this, JSON.stringify(jsonData));
  };
  
  next();
};

// Request sanitization
exports.sanitizeRequest = (req, res, next) => {
  // Remove any potential script tags from string inputs
  const sanitizeString = (str) => {
    if (typeof str === 'string') {
      return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    return str;
  };
  
  // Sanitize body
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    }
  }
  
  // Sanitize query
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key]);
      }
    }
  }
  
  next();
};

// API Rate limiting per endpoint
exports.createEndpointRateLimit = (maxRequests, windowMs, message) => {
  const rateLimit = require('express-rate-limit');
  
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: {
      success: false,
      message: message || 'Too many requests from this endpoint, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Custom key generator for endpoint-specific rate limiting
    keyGenerator: (req) => {
      return `${req.ip}-${req.route.path}`;
    }
  });
};

module.exports = exports;
