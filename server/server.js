/**
 * Kalakari Server - Consolidated and Efficient
 * Single entry point with organized middleware and routes
 */

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import consolidated middleware and routes
const {
  helmetConfig,
  corsConfig,
  securityMiddleware,
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  uploadLimiter,
  reviewLimiter,
  protect,
  optionalAuth,
  authorize,
  apiVersioning,
  standardizeResponse,
  requestLogger,
  rateLimitInfo,
  csrfProtection,
  setCSRFTokenEndpoint,
  sanitizeInput,
  errorHandler,
  checkDatabaseHealth
} = require('./core/middleware');

const {
  authRoutes,
  productRoutes,
  orderRoutes,
  healthRoutes,
  docsRoutes
} = require('./core/routes');

// Initialize Express app
const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// ==================== MIDDLEWARE SETUP ====================

// Security middleware
app.use(helmetConfig);
securityMiddleware.forEach(middleware => app.use(middleware));

// CORS
app.use(require('cors')(corsConfig));

// Rate limiting
app.use(generalLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/auth/forgot-password', passwordResetLimiter);
app.use('/api/auth/reset-password', passwordResetLimiter);
app.use('/api/upload', uploadLimiter);
app.use('/api/reviews', reviewLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'kalakari-session-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// CSRF protection
app.use(csrfProtection);

// Input sanitization
app.use(sanitizeInput);

// API Management
app.use(apiVersioning);
app.use(standardizeResponse);
app.use(requestLogger);
app.use(rateLimitInfo);

// Static file serving
app.use('/uploads', express.static('uploads'));
app.use(express.static('.'));

// ==================== DATABASE CONNECTION ====================

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log('⚠️  No MongoDB URI configured, skipping database connection');
      return;
    }

    // Use a simpler connection approach to avoid DNS issues
    let mongoUri = process.env.MONGODB_URI;
    
    // For development, try a simpler connection string
    if (mongoUri.includes('mongodb+srv://')) {
      // Extract just the basic connection without complex options
      const match = mongoUri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)/);
      if (match) {
        const [, username, password, cluster, database] = match;
        mongoUri = `mongodb+srv://${username}:${password}@${cluster}/${database}?retryWrites=true&w=majority`;
      }
    }
    
    console.log('Connecting to MongoDB...');
    
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000
    });
    
    console.log(`✅ Database connected successfully`);
    console.log(`🔗 Connected to: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('💡 Server will continue without database connection');
    console.log('💡 Some features may not work until database is connected');
    // Don't exit - let server continue
  }
};

connectDB();

// ==================== ROUTES ====================

// Health check (before other middleware)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      database: 'disabled',
      message: 'Database connection temporarily disabled to prevent crashes'
    }
  });
});

// API Documentation
app.use('/api/docs', docsRoutes);

// Database health check middleware
const checkDBConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database connection not available. Please try again later.',
      requestId: req.requestId
    });
  }
  next();
};

// Main API routes with database check
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', checkDBConnection, orderRoutes);
app.use('/api/health', healthRoutes);

// Additional routes with database checks
app.use('/api/upload', checkDBConnection, require('./routes/upload'));
app.use('/api/artisans', checkDBConnection, require('./routes/artisans'));
app.use('/api/addresses', checkDBConnection, require('./routes/addresses'));
app.use('/api/payment', checkDBConnection, require('./routes/payment'));
app.use('/api/reviews', checkDBConnection, require('./routes/reviews'));
app.use('/api/wishlist', checkDBConnection, require('./routes/wishlist'));
app.use('/api/testimonials', checkDBConnection, require('./routes/testimonials'));
app.use('/api/newsletter', checkDBConnection, require('./routes/newsletter'));
app.use('/api/contact', checkDBConnection, require('./routes/contact'));
app.use('/api/cart', checkDBConnection, require('./routes/cart'));
app.use('/api/journal', checkDBConnection, require('./routes/journal'));
app.use('/api/search', checkDBConnection, require('./routes/search'));

// Security endpoints
app.get('/api/csrf-token', setCSRFTokenEndpoint);

// ==================== ERROR HANDLING ====================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    requestId: req.requestId,
    path: req.originalUrl
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// ==================== SERVER START ====================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Real API endpoints active`);
  console.log(`🔒 Security middleware enabled`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    mongoose.connection.close();
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    mongoose.connection.close();
  });
});

module.exports = app;
