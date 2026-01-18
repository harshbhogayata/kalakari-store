/**
 * Consolidated Middleware System
 * All middleware functions in one organized file
 */

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mongoose = require('mongoose');

// ==================== SECURITY MIDDLEWARE ====================

const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'", "blob:"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false
});

const corsConfig = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.CLIENT_URL,
      process.env.VERCEL_URL
    ].filter(Boolean);

    // SECURITY: In development, allow requests with no origin (e.g., mobile apps, Postman)
    // In production, reject unknown origins
    if (!origin) {
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      } else {
        return callback(new Error('CORS: Origin required in production'), false);
      }
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('CORS: Rejected origin:', origin);
      callback(new Error('CORS policy violation: Origin not allowed'), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Rate limiting configurations
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
});

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later.'
  }
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many upload attempts, please try again later.'
  }
});

const reviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many review submissions, please try again later.'
  }
});

// Security middleware stack
const securityMiddleware = [
  helmetConfig,
  cors(corsConfig),
  mongoSanitize(),
  xss(),
  hpp()
];

// ==================== AUTHENTICATION MIDDLEWARE ====================

const User = require('../models/User');

const getTokenFromCookie = (req) => {
  if (req.cookies && req.cookies['kalakari-token']) {
    return req.cookies['kalakari-token'];
  }
  return null;
};

const protect = async (req, res, next) => {
  try {
    let token = getTokenFromCookie(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is no longer valid.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    let token = getTokenFromCookie(req);

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// ==================== API MANAGEMENT MIDDLEWARE ====================

const generateRequestId = () => crypto.randomBytes(8).toString('hex');

const apiVersioning = (req, res, next) => {
  const version = req.headers['api-version'] || req.query.version || 'v1';
  req.apiVersion = version;
  res.set('API-Version', '1.0.0');
  next();
};

const standardizeResponse = (req, res, next) => {
  const originalSend = res.send;

  res.send = function (data) {
    if (res.get('Content-Type') === 'application/json' ||
      res.get('Content-Type')?.includes('application/json')) {

      let responseData;
      try {
        responseData = typeof data === 'string' ? JSON.parse(data) : data;
      } catch (e) {
        return originalSend.call(this, data);
      }

      if (responseData && responseData.success !== false) {
        responseData.meta = {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          ...responseData.meta
        };
      }

      if (responseData && responseData.success === false) {
        responseData.requestId = req.requestId;
      }

      return originalSend.call(this, JSON.stringify(responseData));
    }

    return originalSend.call(this, data);
  };

  next();
};

const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  req.requestId = generateRequestId();

  res.set('X-Request-ID', req.requestId);

  const logData = {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    apiVersion: req.apiVersion || 'v1'
  };

  if (req.user) {
    logData.userId = req.user._id;
    logData.userRole = req.user.role;
  }

  console.log('Request:', JSON.stringify(logData, null, 2));

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log('Response:', JSON.stringify({
      requestId: req.requestId,
      status: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    }, null, 2));

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

const rateLimitInfo = (req, res, next) => {
  res.set('X-RateLimit-Limit', '100');
  res.set('X-RateLimit-Remaining', '99');
  res.set('X-RateLimit-Reset', new Date(Date.now() + 15 * 60 * 1000).toISOString());
  next();
};

// ==================== CSRF PROTECTION ====================

const csrfProtection = (req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  const token = req.headers['x-csrf-token'];
  const sessionToken = req.session.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token mismatch'
    });
  }

  next();
};

const setCSRFTokenEndpoint = (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  req.session.csrfToken = token;

  res.json({
    success: true,
    csrfToken: token,  // Match client expectation (root level)
    data: { csrfToken: token }  // Also keep nested for compatibility
  });
};

// ==================== INPUT SANITIZATION ====================

const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    });
  }

  next();
};

// ==================== ERROR HANDLING ====================

const errorHandler = (err, req, res, next) => {
  const requestId = req.requestId || generateRequestId();

  console.error('Error:', {
    requestId,
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  const errorResponse = {
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    requestId,
    timestamp: new Date().toISOString()
  };

  if (err.name === 'ValidationError') {
    errorResponse.errors = Object.values(err.errors).map(e => e.message);
    errorResponse.message = 'Validation failed';
    return res.status(422).json(errorResponse);
  }

  if (err.name === 'JsonWebTokenError') {
    errorResponse.message = 'Invalid token';
    return res.status(401).json(errorResponse);
  }

  if (err.name === 'TokenExpiredError') {
    errorResponse.message = 'Token expired';
    return res.status(401).json(errorResponse);
  }

  res.status(err.status || 500).json(errorResponse);
};

// ==================== DATABASE HEALTH ====================

const checkDatabaseHealth = async (req, res, next) => {
  try {
    const state = mongoose.connection.readyState;
    if (state !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection not ready',
        status: state
      });
    }
    next();
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Database health check failed'
    });
  }
};

// ==================== EXPORTS ====================

module.exports = {
  // Security
  helmetConfig,
  corsConfig,
  securityMiddleware,
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  uploadLimiter,
  reviewLimiter,

  // Authentication
  protect,
  optionalAuth,
  authorize,
  getTokenFromCookie,

  // API Management
  apiVersioning,
  standardizeResponse,
  requestLogger,
  rateLimitInfo,
  generateRequestId,

  // CSRF
  csrfProtection,
  setCSRFTokenEndpoint,

  // Utilities
  sanitizeInput,
  errorHandler,
  checkDatabaseHealth
};
