// Comprehensive API Error Handling Middleware
const mongoose = require('mongoose');

// Custom error class for API errors
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// MongoDB error handler
const handleMongoError = (error) => {
  console.error('MongoDB Error:', error);
  
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return new ApiError(400, `${field} already exists`, true);
  }
  
  if (error.name === 'CastError') {
    return new ApiError(400, 'Invalid data format', true);
  }
  
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message).join(', ');
    return new ApiError(400, `Validation Error: ${errors}`, true);
  }
  
  return new ApiError(500, 'Database error occurred', true);
};

// MongoDB connection error handler
const handleMongoConnectionError = (error) => {
  console.error('MongoDB Connection Error:', error);
  return new ApiError(503, 'Database connection failed', true);
};

// JWT error handler
const handleJWTError = () => {
  return new ApiError(401, 'Invalid token. Please log in again.', true);
};

const handleJWTExpiredError = () => {
  return new ApiError(401, 'Your token has expired! Please log in again.', true);
};

// File upload error handler
const handleFileUploadError = (error) => {
  console.error('File Upload Error:', error);
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return new ApiError(400, 'File size too large', true);
  }
  
  if (error.code === 'LIMIT_FILE_COUNT') {
    return new ApiError(400, 'Too many files', true);
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return new ApiError(400, 'Unexpected field name', true);
  }
  
  return new ApiError(400, 'File upload error', true);
};

// Authentication error handler
const handleAuthError = () => {
  return new ApiError(401, 'Authentication required', true);
};

// Authorization error handler
const handleAuthorizationError = () => {
  return new ApiError(403, 'You do not have permission to access this resource', true);
};

// Payment processing error handler
const handlePaymentError = (error) => {
  console.error('Payment Error:', error);
  return new ApiError(400, 'Payment processing failed', true);
};

// Main error handler middleware
const errorHandler = (error, req, res, next) => {
  let err = { ...error };
  err.message = error.message;
  
  // Log error details
  console.error('Error Details:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  // MongoDB errors
  if (error.name === 'CastError') {
    err = handleMongoError(error);
  }
  
  if (error.code === 11000) {
    err = handleMongoError(error);
  }
  
  if (error.name === 'ValidationError') {
    err = handleMongoError(error);
  }
  
  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    err = handleJWTError();
  }
  
  if (error.name === 'TokenExpiredError') {
    err = handleJWTExpiredError();
  }
  
  // File upload errors
  if (error.code === 'LIMIT_FILE_SIZE' || error.code === 'LIMIT_FILE_COUNT' || error.code === 'LIMIT_UNEXPECTED_FILE') {
    err = handleFileUploadError(error);
  }
  
  // Authentication/Authorization errors
  if (error.message.includes('login') && error.message.includes('token')) {
    err = handleAuthError();
  }
  
  if (error.message.includes('permission') || error.message.includes('authorized')) {
    err = handleAuthorizationError();
  }
  
  // Payment errors
  if (error.message.includes('razorpay') || error.message.includes('payment')) {
    err = handlePaymentError(error);
  }
  
  // Set default error values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  err.message = err.message || 'An error occurred';
  
  // Send error response
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err 
    })
  });
};

// Async error handler wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler for API routes
const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `API route ${req.originalUrl} not found`);
  next(error);
};

// Validation error handler
const handleValidationError = (validationResult) => {
  const errors = validationResult.array();
  return new ApiError(400, 'Validation failed', true);
};

// Database transaction error handler
const handleTransactionError = (error, session) => {
  console.error('Transaction Error:', error);
  session.abortTransaction();
  return new ApiError(500, 'Transaction failed', true);
};

// Network error handler
const handleNetworkError = (error) => {
  console.error('Network Error:', error);
  return new ApiError(503, 'Service temporarily unavailable', true);
};

// External API error handler
const handleExternalAPIError = (error, serviceName) => {
  console.error(`${serviceName} API Error:`, error);
  return new ApiError(502, `${serviceName} service temporarily unavailable`, true);
};

// Rate limit error handler
const handleRateLimitError = (error) => {
  return new ApiError(429, 'Too many requests, please try again later', true);
};

// Custom error handlers for specific scenarios
const validateMongoObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid ID format', true);
  }
  return true;
};

const checkResourceExists = async (Model, id, resourceName) => {
  const resource = await Model.findById(id);
  if (!resource) {
    throw new ApiError(404, `${resourceName} not found`, true);
  }
  return resource;
};

const validateOwnership = (resource, userId) => {
  if (resource.user.toString() !== userId.toString()) {
    throw new ApiError(403, 'You do not have permission to access this resource', true);
  }
};

// Error logging utility
const logError = (error, context = {}) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode || 500,
    context
  };
  
  // In production, log to external service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with logging service
    console.error('Production Error Log:', errorLog);
  } else {
    console.error('Development Error Log:', errorLog);
  }
};

module.exports = {
  ApiError,
  errorHandler,
  asyncHandler,
  notFoundHandler,
  handleValidationError,
  handleTransactionError,
  handleNetworkError,
  handleExternalAPIError,
  handleRateLimitError,
  validateMongoObjectId,
  checkResourceExists,
  validateOwnership,
  logError
};
