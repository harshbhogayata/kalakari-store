// Database Health Check Middleware
const mongoose = require('mongoose');
const { validateObjectId } = require('../utils/databaseValidator');

// Database health check function
exports.checkDatabaseHealth = async (req, res, next) => {
  try {
    // Check MongoDB connection status
    const connectionState = mongoose.connection.readyState;
    
    if (connectionState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection is not available',
        status: 'disconnected',
        readyState: connectionState
      });
    }
    
    // Get database statistics
    const stats = await mongoose.connection.db.stats();
    
    // Check available disk space (warning if > 85% used)
    const diskUsagePercentage = (stats.dataSize / stats.storageSize) * 100;
    const isHealthy = diskUsagePercentage < 85;
    
    if (!isHealthy) {
      console.warn(`Database disk usage high: ${diskUsagePercentage.toFixed(2)}%`);
    }
    
    // Add health info to request
    req.dbHealth = {
      status: 'healthy',
      readyState: connectionState,
      documents: stats.objects,
      collections: stats.collections,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      diskUsagePercentage: diskUsagePercentage.toFixed(2),
      isHealthy
    };
    
    next();
  } catch (error) {
    console.error('Database health check error:', error);
    req.dbHealth = {
      status: 'error',
      error: error.message
    };
    
    return res.status(503).json({
      success: false,
      message: 'Database health check failed',
      error: error.message
    });
  }
};

// Validate MongoDB ObjectId parameter
exports.validateMongoId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: `${paramName} parameter is required`
      });
    }
    
    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`
      });
    }
    
    next();
  };
};

// Validate query parameters
exports.validateQueryParams = (rules) => {
  return (req, res, next) => {
    const errors = [];
    
    for (const param in rules) {
      const value = req.query[param];
      const rule = rules[param];
      
      // Skip validation if parameter is not provided and not required
      if (!value && !rule.required) continue;
      
      if (rule.required && !value) {
        errors.push({ param, error: `${param} parameter is required` });
        continue;
      }
      
      if (value) {
        // Type validation
        if (rule.type === 'number') {
          const numValue = Number(value);
          if (isNaN(numValue)) {
            errors.push({ param, error: `${param} must be a number` });
            continue;
          }
          
          if (rule.min !== undefined && numValue < rule.min) {
            errors.push({ param, error: `${param} must be at least ${rule.min}` });
          }
          
          if (rule.max !== undefined && numValue > rule.max) {
            errors.push({ param, error: `${param} cannot exceed ${rule.max}` });
          }
          
          // Convert to number for further processing
          req.query[param] = numValue;
        }
        
        // Enum validation
        if (rule.enum && !rule.enum.includes(value)) {
          errors.push({ param, error: `${param} must be one of: ${rule.enum.join(', ')}` });
        }
        
        // Pattern validation
        if (rule.pattern && !rule.pattern.test(value)) {
          errors.push({ param, error: `${param} format is invalid` });
        }
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors
      });
    }
    
    next();
  };
};

// Database transaction wrapper
exports.withTransaction = (handler) => {
  return async (req, res, next) => {
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        req.dbSession = session;
        await handler(req, res, next);
      });
    } catch (error) {
      console.error('Transaction error:', error);
      return res.status(500).json({
        success: false,
        message: 'Transaction failed',
        error: error.message
      });
    } finally {
      session.endSession();
    }
  };
};

// Database optimization middleware
exports.optimizeQuery = (options = {}) => {
  return (req, res, next) => {
    // Add query optimization hints to request
    req.queryOptions = {
      lean: options.lean || false, // Return plain objects instead of Mongoose documents
      populate: options.populate || [],
      select: options.select || '',
      sort: options.sort || {},
      skip: req.query.skip ? parseInt(req.query.skip) : 0,
      limit: req.query.limit ? parseInt(req.query.limit) : (options.defaultLimit || 10),
      ...options
    };
    
    // Validate pagination parameters
    if (req.queryOptions.skip < 0) {
      return res.status(400).json({
        success: false,
        message: 'Skip parameter cannot be negative'
      });
    }
    
    if (req.queryOptions.limit < 0 || req.queryOptions.limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit parameter must be between 0 and 100'
      });
    }
    
    next();
  };
};

// Index monitoring middleware
exports.checkIndexUsage = (modelName) => {
  return async (req, res, next) => {
    try {
      // This would typically run as a scheduled job in production
      // For now, just log index suggestions
      const Model = mongoose.model(modelName);
      const explain = req.query.debug === 'true';
      
      if (explain) {
        req.indexDebug = true;
      }
      
      next();
    } catch (error) {
      console.error('Index check error:', error);
      next(error);
    }
  };
};

module.exports = exports;
