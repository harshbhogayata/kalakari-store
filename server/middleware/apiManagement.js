/**
 * API Management Middleware
 * Handles request/response standardization, logging, and monitoring
 */

const crypto = require('crypto');

// Generate unique request ID
const generateRequestId = () => {
  return crypto.randomBytes(8).toString('hex');
};

// Standardize API responses
const standardizeResponse = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Don't modify non-JSON responses
    if (res.get('Content-Type') !== 'application/json' && 
        !res.get('Content-Type')?.includes('application/json')) {
      return originalSend.call(this, data);
    }
    
    let responseData;
    try {
      responseData = typeof data === 'string' ? JSON.parse(data) : data;
    } catch (e) {
      return originalSend.call(this, data);
    }
    
    // Add metadata to successful responses
    if (responseData && responseData.success !== false) {
      responseData.meta = {
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
        version: req.apiVersionInfo?.version || '1.0.0',
        ...responseData.meta
      };
    }
    
    // Add request ID to error responses
    if (responseData && responseData.success === false) {
      responseData.requestId = req.requestId;
    }
    
    return originalSend.call(this, JSON.stringify(responseData));
  };
  
  next();
};

// Request logging and monitoring
const apiLogger = (req, res, next) => {
  const startTime = Date.now();
  req.requestId = generateRequestId();
  
  // Add request ID to response headers
  res.set('X-Request-ID', req.requestId);
  
  // Log request details
  const logData = {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    apiVersion: req.apiVersion || 'v1'
  };
  
  // Add user info if authenticated
  if (req.user) {
    logData.userId = req.user._id;
    logData.userRole = req.user.role;
  }
  
  console.log('API Request:', JSON.stringify(logData, null, 2));
  
  // Log response details
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const responseLog = {
      requestId: req.requestId,
      status: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    };
    
    console.log('API Response:', JSON.stringify(responseLog, null, 2));
    
    // Log slow requests
    if (duration > 5000) {
      console.warn('SLOW REQUEST:', JSON.stringify({
        requestId: req.requestId,
        duration: `${duration}ms`,
        url: req.originalUrl,
        method: req.method
      }, null, 2));
    }
  });
  
  next();
};

// API usage analytics
const apiAnalytics = (req, res, next) => {
  // Track API usage metrics
  const metrics = {
    endpoint: req.path,
    method: req.method,
    version: req.apiVersion || 'v1',
    timestamp: new Date().toISOString(),
    userRole: req.user?.role || 'anonymous'
  };
  
  // Store metrics (in production, send to analytics service)
  console.log('API Metrics:', JSON.stringify(metrics, null, 2));
  
  next();
};

// Error handling for API routes
const apiErrorHandler = (err, req, res, next) => {
  const requestId = req.requestId || generateRequestId();
  
  // Log error details
  console.error('API Error:', {
    requestId,
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // Standardized error response
  const errorResponse = {
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    requestId,
    timestamp: new Date().toISOString()
  };
  
  // Add validation errors if present
  if (err.name === 'ValidationError') {
    errorResponse.errors = Object.values(err.errors).map(e => e.message);
    errorResponse.message = 'Validation failed';
    return res.status(422).json(errorResponse);
  }
  
  // Add JWT errors
  if (err.name === 'JsonWebTokenError') {
    errorResponse.message = 'Invalid token';
    return res.status(401).json(errorResponse);
  }
  
  if (err.name === 'TokenExpiredError') {
    errorResponse.message = 'Token expired';
    return res.status(401).json(errorResponse);
  }
  
  // Default to 500 error
  res.status(err.status || 500).json(errorResponse);
};

// Rate limiting information
const rateLimitInfo = (req, res, next) => {
  res.set('X-RateLimit-Limit', '100');
  res.set('X-RateLimit-Remaining', '99'); // This would be dynamic in production
  res.set('X-RateLimit-Reset', new Date(Date.now() + 15 * 60 * 1000).toISOString());
  
  next();
};

module.exports = {
  standardizeResponse,
  apiLogger,
  apiAnalytics,
  apiErrorHandler,
  rateLimitInfo,
  generateRequestId
};
