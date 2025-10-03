// Performance Optimization Middleware
const { logger } = require('../utils/logger');

// Response caching
const responseCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Performance monitoring
const performanceData = {
  requestTimings: new Map(),
  databaseQueries: [],
  endpoints: new Map()
};

// Cache middleware
exports.cacheResponse = (duration = CACHE_DURATION) => {
  return (req, res, next) => {
    const key = `${req.method}:${req.url}`;
    const cached = responseCache.get(key);
    
    if (cached && Date.now() - cached.timestamp < duration) {
      logger.debug('Cache hit', { url: req.url, age: Date.now() - cached.timestamp });
      return res.json(cached.data);
    }
    
    const originalSend = res.send;
    res.send = function(data) {
      // Cache successful responses only
      if (res.statusCode === 200 && req.method === 'GET') {
        responseCache.set(key, {
          data: JSON.parse(data),
          timestamp: Date.now()
        });
        logger.debug('Cache set', { url: req.url });
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Database query optimization
exports.optimizeQueries = (req, res, next) => {
  const originalPopulate = req.query.populate;
  const originalSelect = req.query.select;
  const originalLimit = req.query.limit;
  
  // Optimize populate queries
  if (originalPopulate && typeof originalPopulate === 'string') {
    // Limit nested population depth
    const validPopulates = originalPopulate.split(',').slice(0, 3); // Max 3 nested populates
    req.query.populate = validPopulates;
    req.optimizedPopulate = true;
  }
  
  // Optimize select fields
  if (!originalSelect && req.method === 'GET') {
    req.query.select = '-__v'; // Exclude version field by default
    req.optimizedSelect = true;
  }
  
  // Set reasonable limits
  if (!originalLimit && req.method === 'GET') {
    req.query.limit = Math.min(parseInt(req.query.limit) || 20, 100); // Max 100 items
    req.optimizedLimit = true;
  }
  
  logger.debug('Query optimized', {
    populate: !!req.optimizedPopulate,
    select: !!req.optimizedSelect,
    limit: req.query.limit
  });
  
  next();
};

// Request timeout
exports.requestTimeout = (timeout = 30000) => {
  return (req, res, next) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        logger.warn('Request timeout', { 
          url: req.url, 
          method: req.method,
          timeout: `${timeout}ms`
        });
        res.status(408).json({
          success: false,
          message: 'Request timeout. Please try again.'
        });
      }
    }, timeout);
    
    res.on('finish', () => {
      clearTimeout(timer);
    });
    
    next();
  };
};

// Gzip compression
exports.compression = (req, res, next) => {
  const compression = require('compression');
  
  // Skip compression for small responses
  const shouldCompress = (req, res) => {
    // Don't compress responses with explicit compression disabled
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Use compression middleware's default filter
    return compression.filter(req, res);
  };
  
  return compression({ filter: shouldCompress })(req, res, next);
};

// API response optimization
exports.optimizeResponse = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(obj) {
    // Remove unnecessary fields
    if (obj && typeof obj === 'object') {
      const optimized = optimizeResponseObject(obj);
      
      // Add performance headers
      res.set('X-Response-Time', Date.now() - res.startTime);
      res.set('X-Cache-Status', req.cacheHit ? 'HIT' : 'MISS');
      
      originalJson.call(this, optimized);
    } else {
      originalJson.call(this, obj);
    }
  };
  
  next();
};

// Optimize response objects
function optimizeResponseObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map(optimizeResponseObject);
  }
  
  if (obj && typeof obj === 'object') {
    const optimized = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Skip sensitive fields
      const sensitiveFields = ['password', 'token', 'secret', '__v'];
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        continue;
      }
      
      // Optimize nested objects
      if (typeof value === 'object' && value !== null) {
        optimized[key] = optimizeResponseObject(value);
      } else if (value !== undefined) {
        optimized[key] = value;
      }
    }
    
    return optimized;
  }
  
  return obj;
}

// Memory usage monitoring
exports.memoryMonitor = (req, res, next) => {
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024)
  };
  
  // Warning if memory usage is high
  if (memUsageMB.heapUsed > 400) { // 400MB threshold
    logger.warn('High memory usage detected', memUsageMB);
  }
  
  res.set('X-Memory-Usage', `${memUsageMB.heapUsed}MB`);
  next();
};

// Database connection pooling optimization
exports.databaseOptimization = (req, res, next) => {
  // Add database performance hints
  req.dbOptimizations = {
    useIndexes: true,
    leanQueries: !req.query.populate, // Use lean() if no populate
    batchSize: Math.min(parseInt(req.query.limit) || 20, 50)
  };
  
  next();
};

// Rate limiting per endpoint
exports.endpointRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const rateLimit = require('express-rate-limit');
  
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: {
      success: false,
      message: 'Too many requests to this endpoint. Please try again later.'
    },
    keyGenerator: (req) => {
      return `${req.ip}_${req.path}`;
    },
    onLimitReached: (req) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        endpoint: req.path,
        userAgent: req.get('User-Agent')
      });
    }
  });
};

// Image optimization hints
exports.imageOptimization = (req, res, next) => {
  if (req.url.includes('/images/') || req.url.includes('/uploads/')) {
    res.set('Cache-Control', 'public, max-age=31536000'); // 1 year for images
    res.set('Vary', 'Accept-Encoding');
  }
  
  next();
};

// Bundle optimization hints
exports.bundleOptimization = (req, res, next) => {
  if (req.url.includes('.js') || req.url.includes('.css')) {
    res.set('Cache-Control', 'public, max-age=86400'); // 1 day for assets
    res.set('Vary', 'Accept-Encoding');
  }
  
  next();
};

// Performance metrics collection
exports.collectMetrics = (req, res, next) => {
  const startTime = Date.now();
  req.startTime = startTime;
  res.startTime = startTime;
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Collect endpoint metrics
    const endpoint = `${req.method} ${req.route?.path || req.url}`;
    if (!performanceData.endpoints.has(endpoint)) {
      performanceData.endpoints.set(endpoint, {
        count: 0,
        totalTime: 0,
        avgTime: 0,
        maxTime: 0,
        minTime: Infinity
      });
    }
    
    const endpointData = performanceData.endpoints.get(endpoint);
    endpointData.count++;
    endpointData.totalTime += duration;
    endpointData.avgTime = endpointData.totalTime / endpointData.count;
    endpointData.maxTime = Math.max(endpointData.maxTime, duration);
    endpointData.minTime = Math.min(endpointData.minTime, duration);
    
    // Log slow endpoints
    if (duration > 1000) {
      logger.warn('Slow endpoint detected', {
        endpoint,
        duration: `${duration}ms`,
        status: res.statusCode
      });
    }
  });
  
  next();
};

// Clean up old cache entries
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of responseCache) {
    if (now - value.timestamp > CACHE_DURATION * 2) {
      responseCache.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean every 5 minutes

// Export performance data
exports.getPerformanceData = () => {
  return {
    endpoints: Object.fromEntries(performanceData.endpoints),
    cacheSize: responseCache.size,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  };
};

module.exports = {
  cacheResponse,
  optimizeQueries,
  requestTimeout,
  compression,
  optimizeResponse,
  memoryMonitor,
  databaseOptimization,
  endpointRateLimit,
  imageOptimization,
  bundleOptimization,
  collectMetrics,
  getPerformanceData
};
