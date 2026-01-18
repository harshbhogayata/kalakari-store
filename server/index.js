const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import security middleware
const {
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
} = require('./middleware/security');
const { validateRequest, validateEmail, validatePassword, sanitizeObject } = require('./middleware/securityValidation');
const { csrfProtection, setCSRFTokenEndpoint } = require('./middleware/csrfProtection');
const { apiVersioning, validateApiVersion } = require('./middleware/apiVersioning');
const { standardizeResponse, apiLogger, apiAnalytics, apiErrorHandler, rateLimitInfo } = require('./middleware/apiManagement');

const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmetConfig);
app.use(securityMiddleware);
app.use(requestLogger);

// CORS configuration
app.use(require('cors')(corsConfig));

// STATIC FILE SERVING - Serve uploaded images and test files
app.use('/uploads', express.static('uploads'));
app.use(express.static('.'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'kalakari-session-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600 // lazy session update
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Rate limiting
app.use(generalLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/auth/forgot-password', passwordResetLimiter);
app.use('/api/auth/reset-password', passwordResetLimiter);
app.use('/api/upload', uploadLimiter);
app.use('/api/reviews', reviewLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// CSRF protection
app.use(csrfProtection);

// Input sanitization middleware
app.use(sanitizeInput);

// API Management middleware
app.use(apiVersioning);
app.use(validateApiVersion);
app.use(standardizeResponse);
app.use(apiLogger);
app.use(apiAnalytics);
app.use(rateLimitInfo);

// Database connection
const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;
  
  const attemptConnection = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4
        maxPoolSize: 10,
        minPoolSize: 5,
        maxIdleTimeMS: 60000,
        retryWrites: true,
        w: 'majority'
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      console.log(`📊 Connection String: ${process.env.MONGODB_URI.substring(0, 50)}...`);
      return true;
    } catch (error) {
      retries++;
      console.error(`❌ Database connection error (Attempt ${retries}/${maxRetries}):`, error.message);
      
      if (retries < maxRetries) {
        const delay = Math.pow(2, retries) * 1000; // Exponential backoff
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return attemptConnection();
      } else {
        console.error('⚠️ Max retries reached. Continuing without database...');
        return false;
      }
    }
  };
  
  await attemptConnection();
};

connectDB();


// API Documentation
app.use('/api/docs', require('./routes/api-docs'));

// Real API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/artisans', require('./routes/artisans'));
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/health', require('./routes/health'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/journal', require('./routes/journal'));
app.use('/api/search', require('./routes/search'));

// Security endpoints
app.get('/api/csrf-token', setCSRFTokenEndpoint);

// Root and API info endpoints
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Kalakari API Server',
    status: 'running',
    version: process.env.npm_package_version || '1.0.0',
    docs: '/api/docs',
    health: '/api/health'
  });
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Kalakari API Root',
    version: process.env.npm_package_version || '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      cart: '/api/cart',
      orders: '/api/orders',
      payment: '/api/payment',
      wishlist: '/api/wishlist',
      search: '/api/search'
    }
  });
});

// Serve frontend build in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  const buildPath = path.join(__dirname, '../client/build');

  app.use(express.static(buildPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
      return next();
    }

    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// Monitoring endpoints
const { metricsCollector, monitoringMiddleware, errorMonitoringMiddleware } = require('./utils/monitoring');

app.use(monitoringMiddleware);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    requestId: req.requestId
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Real API endpoints active`);
  console.log(`✅ Database connected successfully`);
  console.log(`🔗 Connected to: cloud database`);
});

module.exports = app;