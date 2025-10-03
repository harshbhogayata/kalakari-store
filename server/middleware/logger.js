const fs = require('fs');
const path = require('path');

// Request ID generator
const generateRequestId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Comprehensive logging middleware
const loggerMiddleware = (req, res, next) => {
  // Generate unique request ID
  req.id = req.id || generateRequestId();
  
  // Start time for duration calculation
  const startTime = Date.now();
  
  // Store original end function
  const originalEnd = res.end;
  
  // Override end function to log response
  res.end = function(chunk, encoding) {
    const duration = Date.now() - startTime;
    const logData = {
      requestId: req.id,
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      timestamp: new Date().toISOString(),
      userId: req.user?._id || 'anonymous'
    };

    // Log to console with color coding
    const statusColor = res.statusCode >= 500 ? '\x1b[31m' : // Red for 5xx
                       res.statusCode >= 400 ? '\x1b[33m' : // Yellow for 4xx
                       res.statusCode >= 300 ? '\x1b[36m' : // Cyan for 3xx
                       '\x1b[32m'; // Green for 2xx
    
    console.log(`${statusColor}Request: ${JSON.stringify(logData)}\x1b[0m`);

    // Log errors to file (optional)
    if (res.statusCode >= 400) {
      const errorLog = {
        ...logData,
        error: true,
        body: req.body,
        query: req.query,
        params: req.params
      };
      
      // In production, you might want to log to a file or external service
      if (process.env.NODE_ENV === 'production') {
        // Log to file or external service
        console.error('Error Request:', JSON.stringify(errorLog));
      }
    }

    // Call original end function
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Performance monitoring middleware
const performanceMiddleware = (req, res, next) => {
  const startTime = process.hrtime.bigint();
  
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    
    // Log slow requests (>1 second)
    if (duration > 1000) {
      console.warn(`🐌 Slow request detected: ${req.method} ${req.url} took ${duration.toFixed(2)}ms`);
    }
    
    // Log very slow requests (>5 seconds)
    if (duration > 5000) {
      console.error(`🚨 Very slow request: ${req.method} ${req.url} took ${duration.toFixed(2)}ms`);
    }
  });
  
  next();
};

module.exports = {
  loggerMiddleware,
  performanceMiddleware,
  generateRequestId
};