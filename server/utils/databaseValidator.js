// Database Validation Utilities
const mongoose = require('mongoose');

// Validate email format
exports.validateEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

// Validate Indian phone number
exports.validateIndianPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

 // Validate Indian pincode
exports.validateIndianPincode = (pincode) => {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
};

// Validate password strength
exports.validatePassword = (password) => {
  // Minimum 6 characters, at least one letter and one number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
  return passwordRegex.test(password);
};

// Validate MongoDB ObjectId
exports.validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Validate price format
exports.validatePrice = (price) => {
  return typeof price === 'number' && price >= 0 && price <= 1000000; // Max ₹10 lakhs
};

// Validate inventory numbers
exports.validateInventory = (total, available, reserved = 0) => {
  if (available > total) {
    return { valid: false, error: 'Available inventory cannot exceed total inventory' };
  }
  if (reserved > available) {
    return { valid: false, error: 'Reserved inventory cannot exceed available inventory' };
  }
  return { valid: true };
};


// Validate order total calculation
exports.validateOrderTotal = (items) => {
  let total = 0;
  
  for (const item of items) {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    
    // Validate item integrity
    if (!item.productId || !item.quantity || !item.price) {
      return { valid: false, error: 'Invalid item data' };
    }
    if (item.quantity <= 0 || item.price < 0) {
      return { valid: false, error: 'Invalid item quantity or price' };
    }
  }
  
  return { valid: true, total };
};

// Validate discount percentage
exports.validateDiscount = (discount) => {
  return discount >= 0 && discount <= 100;
};

// Validate rating (1-5 stars)
exports.validateRating = (rating) => {
  return Number.isInteger(Number(rating)) && rating >= 1 && rating <= 5;
};

// Validate file upload type
exports.validateFileType = (filename, allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp']) => {
  const extension = filename.toLowerCase().split('.').pop();
  return allowedTypes.includes(extension);
};

// Validate file size (in bytes)
exports.validateFileSize = (sizeBytes, maxSizeMB = 5) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return sizeBytes <= maxSizeBytes;
};

// Sanitize text input
exports.sanitizeText = (text) => {
  if (typeof text !== 'string') return '';
  return text.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

// Validate username format
exports.validateUsername = (username) => {
  // Username should be 3-20 characters, alphanumeric and underscore only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

// Validate business name
exports.validateBusinessName = (businessName) => {
  // Business name should be 2-100 characters, allow letters, numbers, spaces, and common punctuation
  const businessRegex = /^[a-zA-Z0-9\s\.\,\-\&']{2,100}$/;
  return businessRegex.test(businessName);
};

// Validate GST number format
exports.validateGSTNumber = (gstNumber) => {
  // GST number format: 2 letters, 10 digits, 1 letter, 1 digit, 1 letter, 2 digits (example: 22AAAAA0000A1Z5)
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gstNumber.toUpperCase());
};

// Validate PAN number format
exports.validatePANNumber = (panNumber) => {
  // PAN format: 5 letters, 4 digits, 1 letter (example: ABCDE1234F)
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(panNumber.toUpperCase());
};

// Validate IFSC code format
exports.validateIFSCCode = (ifscCode) => {
  // IFSC format: 4 letters, 7 alphanumeric characters (example: HDFC0000123)
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return ifscRegex.test(ifscCode.toUpperCase());
};

// Generic validation wrapper
exports.validateData = (data, rules) => {
  const errors = [];
  
  for (const field in rules) {
    const value = data[field];
    const rule = rules[field];
    
    // Required validation
    if (rule.required && (!value || value === '')) {
      errors.push({ field, error: `${field} is required` });
      continue;
    }
    
    // Skip other validations if value is empty and not required
    if (!value || value === '') continue;
    
    // Type validation
    if (rule.type && typeof value !== rule.type) {
      errors.push({ field, error: `${field} must be of type ${rule.type}` });
      continue;
    }
    
    // Min/Max validation
    if (rule.min !== undefined && value < rule.min) {
      errors.push({ field, error: `${field} must be at least ${rule.min}` });
    }
    if (rule.max !== undefined && value > rule.max) {
      errors.push({ field, error: `${field} cannot exceed ${rule.max}` });
    }
    
    // Length validation
    if (rule.minLength !== undefined && value.length < rule.minLength) {
      errors.push({ field, error: `${field} must be at least ${rule.minLength} characters` });
    }
    if (rule.maxLength !== undefined && value.length > rule.maxLength) {
      errors.push({ field, error: `${field} cannot exceed ${rule.maxLength} characters` });
    }
    
    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      errors.push({ field, error: `${field} format is invalid` });
    }
    
    // Custom validation function
    if (rule.validate && typeof rule.validate === 'function') {
      const customResult = rule.validate(value);
      if (customResult !== true) {
        errors.push({ field, error: customResult || `${field} is invalid` });
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

module.exports = exports;
