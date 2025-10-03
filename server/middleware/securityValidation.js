// Security validation middleware
const validator = require('validator');

// Validate and sanitize request data
const validateRequest = (req, res, next) => {
  try {
    // Validate request size
    const contentLength = parseInt(req.get('content-length') || '0');
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (contentLength > maxSize) {
      return res.status(413).json({
        success: false,
        message: 'Request too large',
        code: 'REQUEST_TOO_LARGE'
      });
    }

    // Validate content type for POST/PUT requests
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid content type',
          code: 'INVALID_CONTENT_TYPE'
        });
      }
    }

    // Validate URL parameters
    if (req.params) {
      for (const [key, value] of Object.entries(req.params)) {
        if (typeof value === 'string' && !validator.isAlphanumeric(value.replace(/[-_]/g, ''))) {
          return res.status(400).json({
            success: false,
            message: `Invalid parameter: ${key}`,
            code: 'INVALID_PARAMETER'
          });
        }
      }
    }

    // Validate query parameters
    if (req.query) {
      for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === 'string') {
          // Check for suspicious patterns
          if (value.includes('..') || value.includes('script') || value.includes('eval')) {
            return res.status(400).json({
              success: false,
              message: `Suspicious query parameter: ${key}`,
              code: 'SUSPICIOUS_QUERY'
            });
          }
        }
      }
    }

    next();
  } catch (error) {
    console.error('Request validation error:', error);
    res.status(400).json({
      success: false,
      message: 'Request validation failed',
      code: 'VALIDATION_ERROR'
    });
  }
};

// Validate email format
const validateEmail = (email) => {
  return validator.isEmail(email) && email.length <= 254;
};

// Validate password strength
const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }

  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }

  if (password.length > 128) {
    return { valid: false, message: 'Password must be less than 128 characters' };
  }

  // Check for at least one uppercase, lowercase, number, and special character
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
    return { 
      valid: false, 
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
    };
  }

  return { valid: true };
};

// Validate phone number (Indian format)
const validatePhoneNumber = (phone) => {
  return validator.isMobilePhone(phone, 'en-IN');
};

// Sanitize string input
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  return str
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
};

// Validate and sanitize object properties
const sanitizeObject = (obj, schema) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (schema[key]) {
      if (schema[key].type === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (schema[key].type === 'email') {
        sanitized[key] = validateEmail(value) ? value.toLowerCase() : null;
      } else if (schema[key].type === 'number') {
        sanitized[key] = isNaN(value) ? null : parseFloat(value);
      } else {
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
};

// Rate limiting for specific endpoints
const createEndpointRateLimit = (endpoint, windowMs, max) => {
  const requests = new Map();
  
  return (req, res, next) => {
    // Skip in development
    if (process.env.NODE_ENV === 'development') {
      return next();
    }

    const key = `${req.ip}:${endpoint}`;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    for (const [requestKey, timestamps] of requests.entries()) {
      const filteredTimestamps = timestamps.filter(timestamp => timestamp > windowStart);
      if (filteredTimestamps.length === 0) {
        requests.delete(requestKey);
      } else {
        requests.set(requestKey, filteredTimestamps);
      }
    }
    
    // Check current requests
    const userRequests = requests.get(key) || [];
    const recentRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    if (recentRequests.length >= max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests for this endpoint',
        code: 'ENDPOINT_RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000)
      });
    }
    
    // Add current request
    recentRequests.push(now);
    requests.set(key, recentRequests);
    
    next();
  };
};

module.exports = {
  validateRequest,
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  sanitizeString,
  sanitizeObject,
  createEndpointRateLimit
};
