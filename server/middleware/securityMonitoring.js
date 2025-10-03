// Security Monitoring Middleware
const { securityLogger } = require('../utils/logger');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Track suspicious activities
const suspiciousActivities = new Map();
const BAN_THRESHOLD = 5; // Ban after 5 violations
const BAN_DURATION = 30 * 60 * 1000; // 30 minutes

// Monitor authentication attempts
exports.authMonitoring = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'unknown';

  // Track authentication patterns
  const authPattern = `${ip}_${userAgent}`;
  
  if (!suspiciousActivities.has(authPattern)) {
    suspiciousActivities.set(authPattern, {
      attempts: 0,
      failures: 0,
      lastAttempt: Date.now(),
      violations: []
    });
  }

  const activity = suspiciousActivities.get(authPattern);
  
  // Clean old entries (older than 1 hour)
  if (Date.now() - activity.lastAttempt > 60 * 60 * 1000) {
    suspiciousActivities.delete(authPattern);
    return next();
  }

  req.securityContext = {
    ip,
    userAgent,
    authPattern,
    activity,
    isBanned: activity.violations.length >= BAN_THRESHOLD
  };

  // Check if IP is banned
  if (req.securityContext.isBanned && Date.now() - activity.lastViolation < BAN_DURATION) {
    securityLogger.logSuspiciousActivity('BANNED_IP_ACCESS', 'Blocked banned IP', {
      ip,
      userAgent
    });
    return res.status(403).json({
      success: false,
      message: 'Access denied due to suspicious activity. Please try again later.'
    });
  }

  next();
};

// Monitor failed login attempts
exports.trackFailedLogin = async (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Check if this was a failed login
    if (res.statusCode === 401 && req.path.includes('/login')) {
      const { email } = req.body;
      const { ip, userAgent } = req.securityContext;
      
      securityLogger.logFailedLogin(email, ip, userAgent);
      
      // Update violation count
      const activity = req.securityContext.activity;
      activity.failures++;
      activity.lastAttempt = Date.now();
      activity.violations.push({
        type: 'FAILED_LOGIN',
        timestamp: Date.now(),
        email
      });
      
      // Check if should ban
      if (activity.violations.length >= BAN_THRESHOLD) {
        activity.lastViolation = Date.now();
        securityLogger.logSuspiciousActivity('AUTO_BAN', 'Excessive failed login attempts', {
          ip,
          userAgent,
          violations: activity.violations.length
        });
      }
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// Monitor file uploads
exports.monitorFileUploads = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    if (req.path.includes('/upload')) {
      const fileName = req.file ? req.file.originalname : 'unknown';
      const fileSize = req.file ? req.file.size : 0;
      const { ip, userAgent } = req.securityContext;
      const success = res.statusCode === 200;
      
      securityLogger.logFileUploadAttempt(fileName, fileSize, ip, userAgent, success);
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// Monitor payment attempts
exports.monitorPayments = (req, res, next) => {
  if (req.path.includes('/payment')) {
    const { amount } = req.body;
    const { ip, userAgent } = req.securityContext;
    
    // Log all payment attempts
    securityLogger.logSuspiciousActivity('PAYMENT_ATTEMPT', 'Payment request made', {
      amount,
      ip,
      userAgent,
      userId: req.user ? req.user._id : null
    });
  }
  
  next();
};

// Monitor slow requests (potential DoS)
exports.monitorSlowRequests = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // If request takes more than 10 seconds
    if (duration > 10000) {
      securityLogger.logSuspiciousActivity('SLOW_REQUEST', 'Request taking too long', {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
    }
  });
  
  next();
};

// Monitor token tampering
exports.monitorTokenIntegrity = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
  
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        securityLogger.logSuspiciousActivity('TOKEN_TAMPERING', 'Invalid token format', {
          error: error.message,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
      } else if (error.name === 'TokenExpiredError') {
        securityLogger.logSuspiciousActivity('EXPIRED_TOKEN', 'Expired token used', {
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
      }
    }
  }
  
  next();
};

// Monitor API abuse
exports.monitorAPIAbuse = (req, res, next) => {
  const apiUsage = new Map();
  const ABUSE_THRESHOLD = 100; // 100 requests per minute
  const windowMs = 60 * 1000; // 1 minute
  
  const key = `${req.ip}_${req.path}`;
  const now = Date.now();
  
  if (!apiUsage.has(key)) {
    apiUsage.set(key, { count: 0, resetTime: now + windowMs });
  }
  
  const usage = apiUsage.get(key);
  
  // Reset counter if window has passed
  if (now > usage.resetTime) {
    usage.count = 0;
    usage.resetTime = now + windowMs;
  }
  
  usage.count++;
  
  if (usage.count > ABUSE_THRESHOLD) {
    securityLogger.logRateLimitExceeded(req.ip, req.path);
    return res.status(429).json({
      success: false,
      message: 'Too many requests from this IP address'
    });
  }
  
  req.usageCount = usage.count;
  next();
};

// Monitor sensitive operations
exports.monitorSensitiveOperations = (req, res, next) => {
  const sensitivePaths = ['/admin', '/payment', '/upload', '/auth/register'];
  
  if (sensitivePaths.some(path => req.path.includes(path))) {
    securityLogger.logSuspiciousActivity('SENSITIVE_ACCESS', 'Access to sensitive operation', {
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user ? req.user._id : null,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

// Cleanup old monitoring data
setInterval(() => {
  const now = Date.now();
  const maxAge = 60 * 60 * 1000; // 1 hour
  
  for (const [key, activity] of suspiciousActivities) {
    if (now - activity.lastAttempt > maxAge) {
      suspiciousActivities.delete(key);
    }
  }
}, 30 * 60 * 1000); // Clean up every 30 minutes

module.exports = {
  authMonitoring,
  trackFailedLogin,
  monitorFileUploads,
  monitorPayments,
  monitorSlowRequests,
  monitorTokenIntegrity,
  monitorAPIAbuse,
  monitorSensitiveOperations
};
