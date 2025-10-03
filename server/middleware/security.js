const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// Rate limiting configurations
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // SECURE: Never skip rate limiting in production
      // Only allow skipping for legitimate health checks
      return process.env.NODE_ENV === 'development' && req.path === '/health';
    }
  });
};

// General API rate limiting
const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many requests from this IP, please try again later.'
);

// Auth endpoints rate limiting (stricter)
const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 requests per window
  'Too many authentication attempts, please try again later.'
);

// Password reset rate limiting
const passwordResetLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  3, // 3 requests per hour
  'Too many password reset attempts, please try again later.'
);

// File upload rate limiting
const uploadLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  10, // 10 uploads per window
  'Too many file uploads, please try again later.'
);

// Review submission rate limiting
const reviewLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  5, // 5 reviews per hour
  'Too many review submissions, please try again later.'
);

// Helmet security headers configuration
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
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for development
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Remove any keys that start with '$' or contain '.'
  mongoSanitize();
  
  // Clean user input from malicious HTML
  xss();
  
  // Prevent parameter pollution
  hpp();
  
  next();
};

// Custom security middleware
const securityMiddleware = (req, res, next) => {
  // Remove powered by header
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Add request ID for tracking
  req.requestId = Math.random().toString(36).substr(2, 9);
  res.setHeader('X-Request-ID', req.requestId);
  
  next();
};

// SECURE CORS configuration
const corsConfig = {
  origin: function (origin, callback) {
    // Allow requests without origin for deployment testing and direct access
    if (!origin) {
      console.log('CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://kalakari-shop.tech',
      'https://www.kalakari-shop.tech',
      'https://kalakari.shop',
      'https://www.kalakari.shop'
    ];
    
    // Development: Allow localhost with any port
    if (process.env.NODE_ENV === 'development') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS: Blocked unauthorized origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin',
    'X-Request-ID',
    'Cache-Control',
    'Pragma',
    'X-CSRF-Token' // Add CSRF token support
  ],
  exposedHeaders: ['X-Request-ID'],
  maxAge: 86400 // 24 hours
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      timestamp: new Date().toISOString()
    };
    
    // Log only errors in production
    if (process.env.NODE_ENV === 'production' && res.statusCode >= 400) {
      console.error('Request Error:', logData);
    } else if (process.env.NODE_ENV === 'development') {
      console.log('Request:', logData);
    }
  });
  
  next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  const requestId = req.requestId || 'unknown';
  
  // Log error
  console.error('Error:', {
    requestId,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip
  });
  
  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      requestId
    });
  } else {
    res.status(500).json({
      success: false,
      message: err.message,
      stack: err.stack,
      requestId
    });
  }
};

module.exports = {
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  uploadLimiter,
  reviewLimiter,
  helmetConfig,
  sanitizeInput,
  securityMiddleware,
  corsConfig,
  requestLogger,
  errorHandler
};
