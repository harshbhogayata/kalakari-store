const { validationResult } = require('express-validator');

// Enhanced validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
      location: error.location
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
      requestId: req.id
    });
  }

  next();
};

// Custom validation helpers
const validateRequest = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));
    
    // Handle validation errors
    return handleValidationErrors(req, res, next);
  };
};

// Sanitization helpers
const sanitizeRequestBody = (req, res, next) => {
  // Trim whitespace from string fields
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  // Remove null/undefined values
  req.body = Object.fromEntries(
    Object.entries(req.body).filter(([_, value]) => value != null)
  );

  next();
};

module.exports = {
  handleValidationErrors,
  validateRequest,
  sanitizeRequestBody
};