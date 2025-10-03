const winston = require('winston');
const { createLogger, format, transports } = winston;

// Custom log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.json(),
  format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Create logger instance
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'kalakari-api' },
  transports: [
    // Console transport
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    }),
    
    // File transport for errors
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // File transport for all logs
    new transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      requestId: req.requestId,
    };
    
    if (res.statusCode >= 400) {
      logger.error('Request Error', logData);
    } else {
      logger.info('Request', logData);
    }
  });
  
  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  const errorData = {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    requestId: req.requestId,
  };
  
  logger.error('Unhandled Error', errorData);
  next(err);
};

// Performance monitoring
const performanceMonitor = (req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;
    
    if (duration > 1000) { // Log slow requests (>1s)
      logger.warn('Slow Request', {
        method: req.method,
        url: req.url,
        duration: `${duration.toFixed(2)}ms`,
        requestId: req.requestId,
      });
    }
  });
  
  next();
};

// Memory monitoring
const memoryMonitor = () => {
  const memoryUsage = process.memoryUsage();
  const memoryUsageMB = {
    rss: Math.round(memoryUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    external: Math.round(memoryUsage.external / 1024 / 1024)
  };
  
  // Log memory usage every 5 minutes
  setInterval(() => {
    logger.info('Memory Usage', memoryUsageMB);
    
    // Alert if memory usage is high
    if (memoryUsageMB.heapUsed > 500) { // 500MB
      logger.warn('High Memory Usage', memoryUsageMB);
    }
  }, 5 * 60 * 1000);
};

// Database monitoring
const dbMonitor = () => {
  const mongoose = require('mongoose');
  
  mongoose.connection.on('connected', () => {
    logger.info('Database Connected', {
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    });
  });
  
  mongoose.connection.on('disconnected', () => {
    logger.warn('Database Disconnected');
  });
  
  mongoose.connection.on('error', (err) => {
    logger.error('Database Error', {
      error: err.message,
      stack: err.stack
    });
  });
};

// Initialize monitoring
const initializeMonitoring = () => {
  // Create logs directory if it doesn't exist
  const fs = require('fs');
  const path = require('path');
  
  const logsDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Start monitoring
  memoryMonitor();
  dbMonitor();
  
  logger.info('Monitoring initialized');
};

module.exports = {
  logger,
  requestLogger,
  errorLogger,
  performanceMonitor,
  initializeMonitoring
};
