// Comprehensive Logging System
const fs = require('fs');
const path = require('path');

// Log levels
const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn', 
  INFO: 'info',
  DEBUG: 'debug',
  SECURITY: 'security'
};

// Log colors for console output
const LOG_COLORS = {
  error: '\x1b[31m', // Red
  warn: '\x1b[33m',  // Yellow
  info: '\x1b[36m',  // Cyan
  debug: '\x1b[37m', // White
  security: '\x1b[35m', // Magenta
  reset: '\x1b[0m'
};

class Logger {
  constructor(options = {}) {
    this.logLevel = options.logLevel || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
    this.enableConsole = options.enableConsole !== false;
    this.enableFile = options.enableFile !== false;
    this.logDirectory = options.logDirectory || path.join(__dirname, '../logs');
    
    // Ensure log directory exists
    if (this.enableFile && !fs.existsSync(this.logDirectory)) {
      fs.mkdirSync(this.logDirectory, { recursive: true });
    }
    
    // Levels: debug < info < warn < error < security
    this.levels = ['debug', 'info', 'warn', 'error', 'security'];
  }

  _shouldLog(level) {
    const levelIndex = this.levels.indexOf(level);
    const thresholdIndex = this.levels.indexOf(this.logLevel);
    return levelIndex >= thresholdIndex;
  }

  _formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const formattedMessage = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...meta,
      environment: process.env.NODE_ENV || 'development',
      pid: process.pid
    };
    
    return formattedMessage;
  }

  _writeToConsole(level, formattedMessage) {
    if (!this.enableConsole) return;
    
    const color = LOG_COLORS[level] || LOG_COLORS.info;
    const reset = LOG_COLORS.reset;
    
    console.log(`${color}[${formattedMessage.timestamp}] ${level.toUpperCase()}: ${formattedMessage.message}${reset}`);
    
    if (formattedMessage.meta && Object.keys(formattedMessage.meta).length > 0) {
      console.log(`${color}Meta: ${JSON.stringify(formattedMessage.meta, null, 2)}${reset}`);
    }
  }

  _writeToFile(level, formattedMessage) {
    if (!this.enableFile) return;
    
    try {
      const fileName = `${level}.log`;
      const filePath = path.join(this.logDirectory, fileName);
      const logEntry = JSON.stringify(formattedMessage) + '\n';
      
      fs.appendFileSync(filePath, logEntry);
      
      // Also write to general log file
      const generalLogPath = path.join(this.logDirectory, 'application.log');
      fs.appendFileSync(generalLogPath, logEntry);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  log(level, message, meta = {}) {
    if (!this._shouldLog(level)) return;
    
    const formattedMessage = this._formatMessage(level, message, meta);
    
    this._writeToConsole(level, formattedMessage);
    this._writeToFile(level, formattedMessage);
  }

  error(message, meta = {}) {
    this.log(LOG_LEVELS.ERROR, message, meta);
  }

  warn(message, meta = {}) {
    this.log(LOG_LEVELS.WARN, message, meta);
  }

  info(message, meta = {}) {
    this.log(LOG_LEVELS.INFO, message, meta);
  }

  debug(message, meta = {}) {
    this.log(LOG_LEVELS.DEBUG, message, meta);
  }

  security(message, meta = {}) {
    this.log(LOG_LEVELS.SECURITY, message, meta);
  }

  // Specialized logging methods
  request(req, res, responseTime) {
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user ? req.user._id : null,
      contentType: req.get('Content-Type'),
      contentLength: req.get('Content-Length')
    };
    
    this.info(`${req.method} ${req.url} - ${res.statusCode}`, logData);
  }

  auth(action, user, meta = {}) {
    const logData = {
      action,
      userId: user ? user._id : null,
      userRole: user ? user.role : null,
      ip: meta.ip,
      userAgent: meta.userAgent,
      ...meta
    };
    
    this.security(`Auth: ${action}`, logData);
  }

  payment(action, amount, orderId, meta = {}) {
    const logData = {
      action,
      amount,
      orderId,
      currency: 'INR',
      ...meta
    };
    
    this.info(`Payment: ${action}`, logData);
  }

  database(operation, collection, meta = {}) {
    const logData = {
      operation,
      collection,
      ...meta
    };
    
    this.debug(`Database: ${operation} on ${collection}`, logData);
  }

  upload(action, fileName, fileSize, meta = {}) {
    const logData = {
      action,
      fileName,
      fileSize: `${fileSize} bytes`,
      ...meta
    };
    
    this.info(`Upload: ${action}`, logData);
  }

  // Error with stack trace
  errorWithStack(error, context = {}) {
    this.error(error.message, {
      stack: error.stack,
      code: error.code,
      statusCode: error.statusCode,
      ...context
    });
  }

  // Performance monitoring
  performance(operation, duration, meta = {}) {
    const logData = {
      duration: `${duration}ms`,
      ...meta
    };
    
    if (duration > 1000) {
      this.warn(`Slow operation: ${operation}`, logData);
    } else {
      this.debug(`Performance: ${operation}`, logData);
    }
  }

  // Security violations
  securityViolation(type, reason, meta = {}) {
    this.security(`SECURITY VIOLATION: ${type}`, {
      reason,
      ...meta,
      timestamp: new Date().toISOString()
    });
  }

  // Business logic events
  business(event, details) {
    this.info(`Business Event: ${event}`, details);
  }
}

// Create singleton instance
const logger = new Logger({
  logLevel: process.env.LOG_LEVEL || 'info',
  enableConsole: process.env.NODE_ENV !== 'test',
  enableFile: process.env.NODE_ENV === 'production'
});

// Express middleware for request logging
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.request(req, res, duration);
  });
  
  next();
};

// Error handler middleware
const errorLogger = (error, req, res, next) => {
  logger.errorWithStack(error, {
    method: req.method,
    url: req.url,
    user: req.user ? req.user._id : null,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  next(error);
};

// Security event middleware
const securityLogger = {
  logFailedLogin: (email, ip, userAgent) => {
    logger.securityViolation('FAILED_LOGIN', 'Invalid credentials', {
      email,
      ip,
      userAgent
    });
  },
  
  logSuspiciousActivity: (type, reason, meta) => {
    logger.securityViolation(type, reason, meta);
  },
  
  logRateLimitExceeded: (ip, endpoint) => {
    logger.securityViolation('RATE_LIMIT', 'Too many requests', {
      ip,
      endpoint
    });
  },
  
  logFileUploadAttempt: (fileName, fileSize, ip, userAgent, success) => {
    const action = success ? 'SUCCESS' : 'FAILED';
    logger.security(`File upload ${action}`, {
      fileName,
      fileSize,
      ip,
      userAgent
    });
  }
};

module.exports = {
  Logger,
  logger,
  requestLogger,
  errorLogger,
  securityLogger,
  LOG_LEVELS
};
