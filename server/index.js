const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
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
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// Rate limiting
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization and validation
app.use(sanitizeInput);
app.use(validateRequest);

// CSRF Protection - Apply after session middleware
app.use(csrfProtection);

// Database connection with timeout options
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kalakari-shop';

// SECURE: Remove sensitive database URLs from logs
console.log('Attempting to connect to database...');

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 15000, // 15 seconds
  connectTimeoutMS: 15000,
  socketTimeoutMS: 15000,
  maxPoolSize: 5,
  retryWrites: true,
  retryReads: true
})
.then(() => {
  console.log('✅ Database connected successfully');
  // SECURE: Don't log connection details that could reveal sensitive info
  const dbType = mongoUri.includes('mongodb+srv') ? 'cloud database' : 'local database';
  console.log(`Connected to: ${dbType}`);
})
.catch(err => {
  console.error('❌ Database connection error:', err.message);
  console.log('💡 Troubleshooting tips:');
  console.log('   1. Check database connection configuration');
  console.log('   2. Verify network connectivity');
  console.log('   3. Check credentials and permissions');
  // SECURE: Don't log specific connection strings
});

// Routes with specific rate limiting
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/upload', uploadLimiter, require('./routes/upload'));
app.use('/api/reviews', reviewLimiter, require('./routes/reviews'));

// General routes
app.use('/api/artisans', require('./routes/artisans'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/health', require('./routes/health'));
app.use('/api/email', require('./routes/email'));
app.use('/api/journal', require('./routes/journal'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/contact', require('./routes/contact'));

// Development endpoints
if (process.env.NODE_ENV === 'development') {
  const { createDevData } = require('./dev-data');
  const { mockUsers, mockProducts, mockWishlists, mockOrders, mockAddresses, generateToken, mockAuthMiddleware } = require('./mock-auth');
  const { loggerMiddleware, performanceMiddleware } = require('./middleware/logger');
  const errorHandler = require('./middleware/errorHandler');
  
  // Apply middleware
  app.use(loggerMiddleware);
  app.use(performanceMiddleware);
  
  // Data validation endpoint
  app.get('/api/dev/validate-data', (req, res) => {
    try {
      const { validateMockData } = require('./utils/dataValidator');
      const validationResult = validateMockData();
      
      res.json({
        success: true,
        message: 'Data validation completed',
        data: validationResult,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Data validation failed',
        error: error.message,
        requestId: req.id
      });
    }
  });

  // Security endpoints
  app.get('/api/dev/csrf-token', setCSRFTokenEndpoint);

  // Monitoring endpoints
  const { metricsCollector, monitoringMiddleware, errorMonitoringMiddleware } = require('./utils/monitoring');
  
  app.use(monitoringMiddleware);
  
  app.get('/api/dev/metrics', (req, res) => {
    try {
      const metrics = metricsCollector.getMetrics();
      res.json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve metrics',
        error: error.message,
        requestId: req.id
      });
    }
  });

  app.get('/api/dev/health', (req, res) => {
    try {
      const healthStatus = metricsCollector.getHealthStatus();
      const statusCode = healthStatus.status === 'healthy' ? 200 : 
                        healthStatus.status === 'degraded' ? 200 : 503;
      
      res.status(statusCode).json({
        success: healthStatus.status === 'healthy' || healthStatus.status === 'degraded',
        data: healthStatus,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Health check failed',
        error: error.message,
        requestId: req.id
      });
    }
  });

  app.post('/api/dev/metrics/reset', (req, res) => {
    try {
      metricsCollector.resetMetrics();
      res.json({
        success: true,
        message: 'Metrics reset successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to reset metrics',
        error: error.message,
        requestId: req.id
      });
    }
  });
  
  // Seed data endpoint
  app.post('/api/dev/seeded', async (req, res) => {
    try {
      const result = await createDevData();
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Mock artisans endpoint
  app.get('/api/dev/artisans', (req, res) => {
    const { craftType, state, page = 1, limit = 12 } = req.query;
    
    const mockArtisans = [
      {
        _id: 'artisan1',
        businessName: 'Rajasthani Pottery House',
        craftType: 'Pottery',
        city: 'Jaipur',
        state: 'Rajasthan',
        description: 'Traditional Rajasthani pottery with modern designs. Handcrafted by skilled artisans for over 3 generations.',
        profileImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=150&h=150&fit=crop&crop=face',
        rating: { average: 4.8, count: 127 },
        experience: 15,
        isVerified: true
      },
      {
        _id: 'artisan2',
        businessName: 'Kerala Textile Weavers',
        craftType: 'Textiles',
        city: 'Kochi',
        state: 'Kerala',
        description: 'Authentic Kerala handloom textiles. Weaving traditional patterns with natural dyes.',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        rating: { average: 4.6, count: 89 },
        experience: 12,
        isVerified: true
      },
      {
        _id: 'artisan3',
        businessName: 'Gujarat Jewelry Crafts',
        craftType: 'Jewelry',
        city: 'Ahmedabad',
        state: 'Gujarat',
        description: 'Traditional Gujarati jewelry making. Silver and gold ornaments with intricate designs.',
        profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        rating: { average: 4.9, count: 203 },
        experience: 20,
        isVerified: true
      },
      {
        _id: 'artisan4',
        businessName: 'Kashmir Woodwork',
        craftType: 'Woodwork',
        city: 'Srinagar',
        state: 'Jammu and Kashmir',
        description: 'Hand-carved wooden furniture and decorative items from Kashmir valley.',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        rating: { average: 4.7, count: 156 },
        experience: 18,
        isVerified: true
      },
      {
        _id: 'artisan5',
        businessName: 'Tamil Nadu Metalwork',
        craftType: 'Metalwork',
        city: 'Chennai',
        state: 'Tamil Nadu',
        description: 'Traditional Tamil metalwork including bronze sculptures and utensils.',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        rating: { average: 4.5, count: 94 },
        experience: 14,
        isVerified: true
      },
      {
        _id: 'artisan6',
        businessName: 'West Bengal Leather Crafts',
        craftType: 'Leather',
        city: 'Kolkata',
        state: 'West Bengal',
        description: 'Handcrafted leather goods including bags, wallets, and accessories.',
        profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        rating: { average: 4.4, count: 78 },
        experience: 10,
        isVerified: true
      }
    ];

    let filteredArtisans = mockArtisans;

    // Apply filters
    if (craftType) {
      filteredArtisans = filteredArtisans.filter(artisan => 
        artisan.craftType.toLowerCase().includes(craftType.toLowerCase())
      );
    }

    if (state) {
      filteredArtisans = filteredArtisans.filter(artisan => 
        artisan.state.toLowerCase().includes(state.toLowerCase())
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedArtisans = filteredArtisans.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        artisans: paginatedArtisans,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(filteredArtisans.length / limit),
          total: filteredArtisans.length
        }
      }
    });
  });

  // Mock artisan detail endpoint
  app.get('/api/dev/artisans/:id', (req, res) => {
    const { id } = req.params;
    
    const mockArtisan = {
      _id: id,
      businessName: 'Rajasthani Pottery House',
      craftType: 'Pottery',
      city: 'Jaipur',
      state: 'Rajasthan',
      description: 'Traditional Rajasthani pottery with modern designs. Handcrafted by skilled artisans for over 3 generations. Our family has been creating beautiful pottery pieces for over 50 years, preserving the rich cultural heritage of Rajasthan.',
      profileImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop&crop=face',
      rating: { average: 4.8, count: 127 },
      experience: 15,
      isVerified: true,
      products: [
        {
          _id: 'product1',
          name: 'Traditional Blue Pottery Vase',
          price: 2500,
          image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
          category: 'Pottery'
        },
        {
          _id: 'product2',
          name: 'Hand-painted Ceramic Bowl',
          price: 1800,
          image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
          category: 'Pottery'
        }
      ],
      story: 'Our journey began in 1970 when my grandfather started this pottery business. We have been creating beautiful pottery pieces that blend traditional techniques with contemporary designs. Each piece is handcrafted with love and attention to detail.',
      achievements: [
        'National Award for Excellence in Handicrafts (2019)',
        'Rajasthan State Craft Award (2017)',
        'Featured in Craft Council of India (2015)'
      ]
    };

    res.json({
      success: true,
      data: {
        artisan: mockArtisan
      }
    });
  });

  // Comprehensive products endpoint
  app.get('/api/dev/comprehensive-products', async (req, res) => {
    try {
      const { mockComprehensiveProducts } = require('./mock-comprehensive-products');
      const products = mockComprehensiveProducts();
      res.json({ 
        success: true, 
        count: products.length,
        products: products.slice(0, 50) // Return first 50 for preview
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Mock reviews endpoints for development
  app.get('/api/dev/products/:productId/reviews', (req, res) => {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = 'createdAt', rating } = req.query;
    
    // Mock reviews data
    const mockReviews = [
      {
        _id: 'review_1',
        productId,
        customerId: {
          _id: 'user_1',
          name: 'Priya Sharma',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100'
        },
        rating: 5,
        title: 'Beautiful craftsmanship!',
        comment: 'This product exceeded my expectations. The quality is outstanding and the artisan\'s attention to detail is remarkable. Highly recommended!',
        images: [
          { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300', alt: 'Product review image' }
        ],
        isVerified: true,
        helpful: { count: 12, users: [] },
        status: 'approved',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'review_2',
        productId,
        customerId: {
          _id: 'user_2',
          name: 'Rajesh Kumar',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
        },
        rating: 4,
        title: 'Good quality, fast delivery',
        comment: 'The product arrived quickly and was well packaged. Quality is good for the price. Would buy again.',
        images: [],
        isVerified: true,
        helpful: { count: 8, users: [] },
        status: 'approved',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'review_3',
        productId,
        customerId: {
          _id: 'user_3',
          name: 'Anita Patel',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'
        },
        rating: 5,
        title: 'Absolutely love it!',
        comment: 'This is exactly what I was looking for. The traditional design is authentic and the quality is excellent. Thank you for preserving our heritage!',
        images: [
          { url: 'https://images.unsplash.com/photo-1600661633315-7389108b31a1?w=300', alt: 'Product review image' },
          { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300', alt: 'Product review image' }
        ],
        isVerified: true,
        helpful: { count: 15, users: [] },
        response: {
          text: 'Thank you so much for your kind words! We\'re delighted that you love the product. Your support helps us continue our traditional craft.',
          respondedBy: {
            _id: 'artisan_1',
            name: 'Master Artisan'
          },
          respondedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        status: 'approved',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Filter by rating if specified
    let filteredReviews = mockReviews;
    if (rating) {
      filteredReviews = mockReviews.filter(review => review.rating === parseInt(rating));
    }

    // Sort reviews
    filteredReviews.sort((a, b) => {
      if (sort === 'createdAt') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === '-createdAt') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === 'rating') return b.rating - a.rating;
      if (sort === '-rating') return a.rating - b.rating;
      if (sort === 'helpful.count') return b.helpful.count - a.helpful.count;
      return 0;
    });

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

    // Calculate stats
    const totalReviews = filteredReviews.length;
    const averageRating = totalReviews > 0 
      ? filteredReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    const breakdown = [1, 2, 3, 4, 5].map(rating => ({
      _id: rating,
      count: filteredReviews.filter(review => review.rating === rating).length
    }));

    const stats = {
      average: averageRating,
      total: totalReviews,
      breakdown
    };

    res.json({
      success: true,
      data: {
        reviews: paginatedReviews,
        stats,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(totalReviews / parseInt(limit)),
          total: totalReviews,
          hasMore: endIndex < totalReviews
        }
      }
    });
  });

  app.post('/api/dev/products/:productId/reviews', (req, res) => {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;
    
    // Mock review creation
    const newReview = {
      _id: `review_${Date.now()}`,
      productId,
      customerId: {
        _id: 'user_current',
        name: 'Current User',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
      },
      rating: parseInt(rating),
      title,
      comment,
      images: [],
      isVerified: false,
      helpful: { count: 0, users: [] },
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully and is pending approval',
      data: { review: newReview }
    });
  });

  app.post('/api/dev/reviews/:reviewId/helpful', (req, res) => {
    const { reviewId } = req.params;
    
    res.json({
      success: true,
      message: 'Marked as helpful',
      data: {
        helpful: {
          count: Math.floor(Math.random() * 20) + 1,
          users: []
        }
      }
    });
  });

  app.post('/api/dev/reviews/:reviewId/respond', (req, res) => {
    const { reviewId } = req.params;
    const { response } = req.body;
    
    res.json({
      success: true,
      message: 'Response added successfully',
      data: {
        review: {
          _id: reviewId,
          response: {
            text: response,
            respondedBy: {
              _id: 'artisan_1',
              name: 'Master Artisan'
            },
            respondedAt: new Date().toISOString()
          }
        }
      }
    });
  });

  // Mock address endpoints

  app.get('/api/dev/addresses', mockAuthMiddleware, (req, res) => {
    try {
      const userId = req.user?._id || 'customer_1';
      const userAddresses = mockAddresses[userId] || [];
      
      res.json({
        success: true,
        data: {
          addresses: userAddresses
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching addresses'
      });
    }
  });

  app.post('/api/dev/addresses', (req, res) => {
    const newAddress = {
      _id: `addr_${Date.now()}`,
      ...req.body
    };
    
    // If setting as default, unset others
    if (newAddress.isDefault) {
      mockAddresses = mockAddresses.map(addr => ({ ...addr, isDefault: false }));
    }
    
    mockAddresses.push(newAddress);
    
    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: { address: newAddress }
    });
  });

  app.put('/api/dev/addresses/:id', (req, res) => {
    const { id } = req.params;
    const index = mockAddresses.findIndex(addr => addr._id === id);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }
    
    // If setting as default, unset others
    if (req.body.isDefault) {
      mockAddresses = mockAddresses.map(addr => ({ ...addr, isDefault: false }));
    }
    
    mockAddresses[index] = { _id: id, ...req.body };
    
    res.json({
      success: true,
      message: 'Address updated successfully',
      data: { address: mockAddresses[index] }
    });
  });

  app.delete('/api/dev/addresses/:id', (req, res) => {
    const { id } = req.params;
    const index = mockAddresses.findIndex(addr => addr._id === id);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }
    
    const wasDefault = mockAddresses[index].isDefault;
    mockAddresses.splice(index, 1);
    
    // If deleted address was default, set first address as default
    if (wasDefault && mockAddresses.length > 0) {
      mockAddresses[0].isDefault = true;
    }
    
    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  });

  app.patch('/api/dev/addresses/:id/default', (req, res) => {
    const { id } = req.params;
    const index = mockAddresses.findIndex(addr => addr._id === id);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }
    
    // Unset all default addresses
    mockAddresses = mockAddresses.map(addr => ({ ...addr, isDefault: false }));
    mockAddresses[index].isDefault = true;
    
    res.json({
      success: true,
      message: 'Default address updated',
      data: { address: mockAddresses[index] }
    });
  });

  // Helper functions for order tracking
  const generateTrackingTimeline = (status, createdAt) => {
    const timeline = [
      {
        status: 'order_placed',
        title: 'Order Placed',
        description: 'Your order has been successfully placed',
        timestamp: createdAt,
        completed: true
      }
    ];

    const statusOrder = ['order_placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(status);

    const statusMap = {
      'confirmed': { title: 'Order Confirmed', description: 'Your order has been confirmed and is being prepared' },
      'processing': { title: 'Processing', description: 'Your order is being processed and packed' },
      'shipped': { title: 'Shipped', description: 'Your order has been shipped and is on its way' },
      'out_for_delivery': { title: 'Out for Delivery', description: 'Your order is out for delivery' },
      'delivered': { title: 'Delivered', description: 'Your order has been delivered successfully' }
    };

    statusOrder.forEach((statusKey, index) => {
      if (index <= currentIndex && statusKey !== 'order_placed') {
        const statusInfo = statusMap[statusKey];
        const timestamp = new Date(Date.now() - (statusOrder.length - index) * 2 * 60 * 60 * 1000).toISOString();
        
        timeline.push({
          status: statusKey,
          title: statusInfo.title,
          description: statusInfo.description,
          timestamp: timestamp,
          completed: index <= currentIndex
        });
      }
    });

    return timeline;
  };

  const getCurrentLocation = (status) => {
    const locations = {
      'pending': 'Warehouse - Mumbai',
      'confirmed': 'Warehouse - Mumbai',
      'processing': 'Warehouse - Mumbai',
      'shipped': 'In Transit - Delhi Hub',
      'out_for_delivery': 'Local Delivery Center',
      'delivered': 'Delivered to Customer'
    };
    return locations[status] || 'Warehouse - Mumbai';
  };

  // Email confirmation function
  const sendOrderConfirmationEmail = async (order, user) => {
    try {
      const emailData = {
        to: user?.email || 'test@example.com',
        subject: `Order Confirmation - ${order.orderId}`,
        template: 'order-confirmation',
        data: {
          orderId: order.orderId,
          customerName: user?.name || 'Customer',
          orderDate: new Date(order.createdAt).toLocaleDateString(),
          items: order.items,
          total: order.pricing.total,
          paymentStatus: order.payment.status,
          shippingAddress: order.shippingAddress
        }
      };
      
      // Mock email sending (in production, integrate with actual email service)
      console.log('📧 Order confirmation email sent:', {
        to: emailData.to,
        subject: emailData.subject,
        orderId: order.orderId,
        total: order.pricing.total,
        paymentStatus: order.payment.status
      });
      
      return { success: true, messageId: `email_${Date.now()}` };
    } catch (error) {
      console.error('Email sending error:', error);
      throw error;
    }
  };

  // Mock order endpoints
  
  app.post('/api/dev/orders', async (req, res) => {
    try {
      // Input validation
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Invalid request body',
          code: 'INVALID_REQUEST_BODY',
          requestId: req.id
        });
      }

      const { 
        items, 
        shippingAddress, 
        paymentMethod, 
        subtotal, 
        shipping, 
        discount, 
        total, 
        guestCheckout,
        paymentId  // For Razorpay payment verification
      } = req.body;

      // Validate required fields
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Items array is required and must not be empty',
          code: 'INVALID_ITEMS',
          requestId: req.id
        });
      }

      if (!shippingAddress || typeof shippingAddress !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Shipping address is required',
          code: 'MISSING_SHIPPING_ADDRESS',
          requestId: req.id
        });
      }

      // Validate shipping address fields
      const requiredAddressFields = ['name', 'street', 'city', 'state', 'pincode', 'phone'];
      const missingFields = requiredAddressFields.filter(field => !shippingAddress[field] || typeof shippingAddress[field] !== 'string');
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required address fields: ${missingFields.join(', ')}`,
          code: 'INVALID_ADDRESS',
          requestId: req.id
        });
      }

      // Validate monetary values
      if (typeof subtotal !== 'number' || subtotal < 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subtotal value',
          code: 'INVALID_SUBTOTAL',
          requestId: req.id
        });
      }
      
      console.log('Order creation request:', {
        items: items?.length,
        paymentMethod,
        paymentId,
        total
      });
      
      const newOrder = {
        _id: `order_${Date.now()}`,
        orderId: `ORD${Date.now()}`,
        customerId: guestCheckout ? 'guest_user' : (req.user?._id || 'mock_customer_id'),
        items: items.map(item => ({
          ...item,
          artisanId: 'artisan_1',
          status: 'pending'
        })),
        shippingAddress,
        pricing: {
          subtotal: subtotal || 0,
          shipping: shipping || 0,
          discount: discount || 0,
          tax: Math.round((subtotal || 0) * 0.18),
          total: total || 0
        },
        payment: {
          method: paymentMethod || 'razorpay',
          status: paymentMethod === 'cod' ? 'pending' : 'completed',
          transactionId: paymentId || `TXN${Date.now()}`,
          razorpayPaymentId: paymentId,
          paidAt: paymentMethod !== 'cod' ? new Date().toISOString() : null
        },
        status: paymentId ? 'confirmed' : 'pending',
        statusHistory: [{
          status: paymentId ? 'confirmed' : 'pending',
          comment: paymentId ? 'Payment verified and order confirmed' : 'Order placed, awaiting payment',
          updatedAt: new Date().toISOString()
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add to mock orders - mockOrders is an object, not array
      const customerId = guestCheckout ? 'guest_user' : (req.user?._id || 'mock_customer_id');
      if (!mockOrders[customerId]) {
        mockOrders[customerId] = [];
      }
      mockOrders[customerId].push(newOrder);
      
      console.log('Order created successfully:', newOrder.orderId);
      
      // Send order confirmation email
      try {
        const userForEmail = req.user || { name: 'Customer', email: 'customer@kalakari.shop' };
        await sendOrderConfirmationEmail(newOrder, userForEmail);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the order if email fails
      }
      
      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: { order: newOrder }
      });
    } catch (error) {
      console.error('Order creation error:', {
        message: error.message,
        stack: error.stack,
        requestId: req.id,
        url: req.url,
        method: req.method,
        ip: req.ip
      });
      
      res.status(500).json({
        success: false,
        message: 'Error creating order',
        code: 'ORDER_CREATION_FAILED',
        requestId: req.id,
        ...(process.env.NODE_ENV === 'development' && { 
          error: error.message,
          stack: error.stack 
        })
      });
    }
  });

  // Mock user orders (must be before generic /:id route)
  app.get('/api/dev/orders/user', mockAuthMiddleware, (req, res) => {
    try {
      const userId = req.user?._id || 'customer_1';
      const userOrders = mockOrders[userId] || [];

      res.json({
        success: true,
        data: { orders: userOrders }
      });
    } catch (error) {
      console.error('Error fetching user orders:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching orders',
        error: error.message
      });
    }
  });

  app.get('/api/dev/orders/:id', (req, res) => {
    // mockOrders is an object with user IDs as keys, not an array
    let order = null;
    
    // Search through all user orders
    for (const userId in mockOrders) {
      if (mockOrders[userId]) {
        order = mockOrders[userId].find(o => o._id === req.params.id || o.orderId === req.params.id);
        if (order) break;
      }
    }
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: { order }
    });
  });

  app.get('/api/dev/orders', (req, res) => {
    // Return mock orders for the logged-in user
    res.json({
      success: true,
      data: {
        orders: mockOrders.length > 0 ? mockOrders : [
          {
            _id: 'order_sample',
            orderId: 'ORD202501011234',
            customerId: 'customer_1',
            items: [
              {
                productId: mockProducts[0]._id,
                quantity: 2,
                price: mockProducts[0].price,
                status: 'confirmed'
              }
            ],
            shippingAddress: {
              name: 'Test User',
              street: '123 Main St',
              city: 'Mumbai',
              state: 'Maharashtra',
              pincode: '400001',
              phone: '9876543210'
            },
            pricing: {
              subtotal: 2000,
              shipping: 0,
              discount: 0,
              total: 2000
            },
            payment: {
              method: 'upi',
              status: 'completed',
              transactionId: 'TXN123456',
              paidAt: new Date().toISOString()
            },
            status: 'confirmed',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        pagination: {
          current: 1,
          pages: 1,
          total: mockOrders.length || 1
        }
      }
    });
  });

  app.patch('/api/dev/orders/:id/cancel', (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const order = mockOrders.find(o => o._id === id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    order.status = 'cancelled';
    order.cancellation = {
      reason,
      cancelledAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });
  });

  app.post('/api/dev/payment/initiate', (req, res) => {
    const { amount, orderId, paymentMethod } = req.body;
    
    res.json({
      success: true,
      data: {
        paymentId: `PAY_${Date.now()}`,
        orderId,
        amount,
        method: paymentMethod,
        status: 'initiated'
      }
    });
  });

  app.post('/api/dev/payment/verify', (req, res) => {
    const { paymentId } = req.body;
    
    res.json({
      success: true,
      data: {
        paymentId,
        status: 'verified',
        verified: true
      }
    });
  });

  // Mock admin product endpoints
  app.get('/api/dev/admin/products', mockAuthMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { status, category } = req.query;
    let filteredProducts = [...mockProducts];

    // Filter by status
    if (status === 'pending') {
      filteredProducts = filteredProducts.filter(p => !p.isApproved);
    } else if (status === 'approved') {
      filteredProducts = filteredProducts.filter(p => p.isApproved);
    } else if (status === 'rejected') {
      filteredProducts = filteredProducts.filter(p => p.isRejected);
    }

    // Filter by category
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    res.json({
      success: true,
      data: {
        products: filteredProducts,
        pagination: {
          current: 1,
          pages: 1,
          total: filteredProducts.length
        }
      }
    });
  });

  app.put('/api/dev/admin/products/:id/approve', mockAuthMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { id } = req.params;
    const { isApproved, notes } = req.body;
    
    const productIndex = mockProducts.findIndex(p => p._id === id);
    if (productIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Update product approval status
    mockProducts[productIndex].isApproved = isApproved;
    mockProducts[productIndex].isRejected = !isApproved;
    mockProducts[productIndex].approvedAt = isApproved ? new Date().toISOString() : null;
    mockProducts[productIndex].approvedBy = isApproved ? req.user._id : null;
    mockProducts[productIndex].approvalNotes = notes;

    res.json({
      success: true,
      message: `Product ${isApproved ? 'approved' : 'rejected'} successfully`,
      data: { product: mockProducts[productIndex] }
    });
  });

  // Mock artisan products endpoint
  app.get('/api/dev/products/artisan/my-products', mockAuthMiddleware, (req, res) => {
    if (req.user.role !== 'artisan') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { status } = req.query;
    let filteredProducts = mockProducts.filter(p => p.artisanId === req.user._id);

    // Filter by status
    if (status === 'pending') {
      filteredProducts = filteredProducts.filter(p => !p.isApproved);
    } else if (status === 'approved') {
      filteredProducts = filteredProducts.filter(p => p.isApproved);
    } else if (status === 'rejected') {
      filteredProducts = filteredProducts.filter(p => p.isRejected);
    }

    res.json({
      success: true,
      data: {
        products: filteredProducts,
        pagination: {
          current: 1,
          pages: 1,
          total: filteredProducts.length
        }
      }
    });
  });

  // Mock product creation endpoint
  app.post('/api/dev/products', mockAuthMiddleware, (req, res) => {
    if (req.user.role !== 'artisan') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const newProduct = {
      _id: `product_${Date.now()}`,
      ...req.body,
      artisanId: req.user._id,
      isApproved: false,
      isRejected: false,
      isActive: true,
      isFeatured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: { views: 0, likes: 0, shares: 0, orders: 0 }
    };

    mockProducts.push(newProduct);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product: newProduct }
    });
  });

  // Mock product update endpoint
  app.put('/api/dev/products/:id', mockAuthMiddleware, (req, res) => {
    if (req.user.role !== 'artisan') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { id } = req.params;
    const productIndex = mockProducts.findIndex(p => p._id === id);
    
    if (productIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (mockProducts[productIndex].artisanId !== req.user._id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Update product
    mockProducts[productIndex] = {
      ...mockProducts[productIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product: mockProducts[productIndex] }
    });
  });

  // Mock product deletion endpoint
  app.delete('/api/dev/products/:id', mockAuthMiddleware, (req, res) => {
    if (req.user.role !== 'artisan') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { id } = req.params;
    const productIndex = mockProducts.findIndex(p => p._id === id);
    
    if (productIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (mockProducts[productIndex].artisanId !== req.user._id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    mockProducts.splice(productIndex, 1);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  });

  // Real artisan registration endpoint
  app.post('/api/dev/auth/artisan-register', async (req, res) => {
    try {
      const { name, email, password, phone, businessName, craftType, state, city, experience, description, portfolioLinks } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Create user account
      const user = await User.create({
        name,
        email,
        password,
        phone,
        role: 'artisan'
      });

      // Create artisan profile
      const artisan = await Artisan.create({
        userId: user._id,
        businessName,
        craftType,
        state,
        city,
        experience,
        description,
        portfolioLinks: portfolioLinks ? portfolioLinks.split(',') : [],
        status: 'pending',
        isApproved: false
      });

      // Generate JWT token
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        message: 'Artisan registration submitted successfully. We will review your application and get back to you within 5-7 business days.',
        data: { 
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          artisan: {
            id: artisan._id,
            businessName: artisan.businessName,
            craftType: artisan.craftType,
            status: artisan.status
          },
          token
        }
      });
    } catch (error) {
      console.error('Artisan registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed. Please try again.',
        error: error.message
      });
    }
  });

  // Mock admin artisans endpoint
  app.get('/api/dev/admin/artisans', mockAuthMiddleware, (req, res) => {
    const { page = 1, limit = 10, status, craftType, state } = req.query;
    
    // Mock artisans data
    const mockArtisans = [
      {
        _id: 'artisan1',
        businessName: 'Rajasthani Pottery House',
        craftType: 'Pottery',
        city: 'Jaipur',
        state: 'Rajasthan',
        description: 'Traditional Rajasthani pottery with modern designs.',
        profileImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=150&h=150&fit=crop&crop=face',
        rating: { average: 4.8, count: 127 },
        experience: 15,
        isApproved: true,
        isVerified: true,
        userId: {
          _id: 'user1',
          name: 'Rajesh Kumar',
          email: 'rajesh@example.com',
          phone: '9876543210',
          createdAt: new Date().toISOString()
        }
      },
      {
        _id: 'artisan2',
        businessName: 'Kerala Textile Weavers',
        craftType: 'Textiles',
        city: 'Kochi',
        state: 'Kerala',
        description: 'Authentic Kerala handloom textiles.',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        rating: { average: 4.6, count: 89 },
        experience: 12,
        isApproved: false,
        isVerified: false,
        userId: {
          _id: 'user2',
          name: 'Priya Nair',
          email: 'priya@example.com',
          phone: '9876543211',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      }
    ];
    
    // Filter artisans based on query parameters
    let filteredArtisans = mockArtisans;
    if (status === 'pending') {
      filteredArtisans = mockArtisans.filter(artisan => !artisan.isApproved);
    } else if (status === 'approved') {
      filteredArtisans = mockArtisans.filter(artisan => artisan.isApproved);
    }
    
    if (craftType) {
      filteredArtisans = filteredArtisans.filter(artisan => artisan.craftType === craftType);
    }
    
    if (state) {
      filteredArtisans = filteredArtisans.filter(artisan => artisan.state === state);
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedArtisans = filteredArtisans.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        artisans: paginatedArtisans,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(filteredArtisans.length / limit),
          total: filteredArtisans.length
        }
      }
    });
  });

  // Mock artisan orders endpoint
  app.get('/api/dev/orders/artisan/my-orders', mockAuthMiddleware, (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    
    // Mock artisan orders data
    const mockOrders = [
      {
        _id: 'order1',
        orderNumber: 'ORD-2024-001',
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        pricing: {
          subtotal: 2500,
          shipping: 50,
          tax: 459,
          total: 3009
        },
        customerId: {
          _id: 'customer1',
          name: 'Priya Sharma',
          email: 'priya@example.com',
          phone: '9876543210'
        },
        items: [
          {
            _id: 'item1',
            productId: {
              _id: 'product1',
              name: 'Handcrafted Pottery Set',
              images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop'],
              price: 2500
            },
            quantity: 1,
            price: 2500,
            artisanId: 'artisan1'
          }
        ]
      },
      {
        _id: 'order2',
        orderNumber: 'ORD-2024-002',
        status: 'shipped',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        pricing: {
          subtotal: 1800,
          shipping: 0,
          tax: 324,
          total: 2124
        },
        customerId: {
          _id: 'customer2',
          name: 'Rajesh Kumar',
          email: 'rajesh@example.com',
          phone: '9876543211'
        },
        items: [
          {
            _id: 'item2',
            productId: {
              _id: 'product2',
              name: 'Traditional Textile Scarf',
              images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop'],
              price: 1800
            },
            quantity: 1,
            price: 1800,
            artisanId: 'artisan1'
          }
        ]
      }
    ];
    
    // Filter by status if provided
    let filteredOrders = mockOrders;
    if (status) {
      filteredOrders = mockOrders.filter(order => order.status === status);
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        orders: paginatedOrders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredOrders.length,
          pages: Math.ceil(filteredOrders.length / limit)
        }
      }
    });
  });

  // Mock journal detail endpoint
  app.get('/api/dev/journal/:id', (req, res) => {
    const { id } = req.params;
    
    // Mock journal articles data
    const journalArticles = [
      {
        id: '1',
        title: 'The Ancient Art of Block Printing',
        content: `Block printing is one of India's oldest and most beloved textile traditions, dating back over 2,000 years. This intricate art form combines creativity, craftsmanship, and cultural heritage in a way that continues to captivate artisans and admirers alike.

## The Origins of Block Printing

The art of block printing in India can be traced back to the Indus Valley Civilization, where evidence of textile printing has been found. However, it was during the Mughal period that block printing truly flourished, with royal patronage helping to refine and perfect the techniques that are still used today.

## The Process

The block printing process is both an art and a science, requiring precision, patience, and a deep understanding of natural dyes and fabrics.`,
        excerpt: 'Explore the history and intricate process behind one of India\'s most beloved textile traditions.',
        image: 'https://images.unsplash.com/photo-1600661633315-7389108b31a1?q=80&w=1887&auto=format&fit=crop',
        category: 'TEXTILES',
        date: '2024-01-15',
        readTime: '5 min read',
        author: 'Priya Sharma',
        tags: ['Block Printing', 'Textiles', 'Traditional Crafts', 'Rajasthan'],
        likes: 127,
        shares: 23
      },
      {
        id: '2',
        title: 'A Day with the Meenakari Masters',
        content: `Meenakari, the ancient art of enameling metal with intricate designs, is one of India's most exquisite jewelry traditions. This painstaking craft requires exceptional skill and patience, with master artisans dedicating decades to perfecting their techniques.`,
        excerpt: 'We sit down with a family that has been practicing the art of enamel jewelry for five generations.',
        image: 'https://images.unsplash.com/photo-1599408226244-5d0718ac8e99?q=80&w=1887&auto=format&fit=crop',
        category: 'BEHIND THE CRAFT',
        date: '2024-01-10',
        readTime: '7 min read',
        author: 'Amit Patel',
        tags: ['Meenakari', 'Jewelry', 'Enameling', 'Jaipur'],
        likes: 89,
        shares: 15
      }
    ];
    
    const article = journalArticles.find(a => a.id === id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Journal article not found'
      });
    }
    
    res.json({
      success: true,
      data: { article }
    });
  });

  // Mock auth endpoints for when MongoDB is not available
  app.post('/api/dev/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Simple password check (in real app, use bcrypt.compare)
    if (password === user.password) {
      const token = generateToken(user._id);
      res.json({
        success: true,
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
          },
          token
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  });

  // Mock products endpoint with search and filtering
  app.get('/api/dev/products', (req, res) => {
    const { 
      featured, page = 1, limit = 12, category, search, state, 
      minPrice, maxPrice, minRating, materials, colors, inStock,
      sort = 'createdAt', order = 'desc'
    } = req.query;
    let products = [...mockProducts]; // Create a copy to avoid modifying original
    
    // Search functionality
    if (search) {
      const searchTerm = search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    // Filter by category
    if (category && category !== 'all') {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    
    // Filter by state/region
    if (state) {
      products = products.filter(p => p.name.toLowerCase().includes(state.toLowerCase()));
    }
    
    // Filter by price range
    if (minPrice) {
      products = products.filter(p => p.price >= parseInt(minPrice));
    }
    if (maxPrice) {
      products = products.filter(p => p.price <= parseInt(maxPrice));
    }
    
    // Filter by rating
    if (minRating) {
      products = products.filter(p => (p.rating?.average || 0) >= parseInt(minRating));
    }
    
    // Filter by materials
    if (materials) {
      const materialList = materials.split(',');
      products = products.filter(p => 
        materialList.some(material => 
          p.description.toLowerCase().includes(material.toLowerCase()) ||
          p.tags.some(tag => tag.toLowerCase().includes(material.toLowerCase()))
        )
      );
    }
    
    // Filter by colors
    if (colors) {
      const colorList = colors.split(',');
      products = products.filter(p => 
        colorList.some(color => 
          p.description.toLowerCase().includes(color.toLowerCase()) ||
          p.tags.some(tag => tag.toLowerCase().includes(color.toLowerCase()))
        )
      );
    }
    
    // Filter by stock availability
    if (inStock === 'true') {
      products = products.filter(p => p.inventory?.available > 0);
    }
    
    // Filter by colors
    if (colors) {
      const colorList = colors.split(',');
      products = products.filter(p => 
        p.colors && colorList.some(color => 
          p.colors.some(pColor => 
            pColor.toLowerCase().includes(color.toLowerCase())
          )
        )
      );
    }
    
    // Filter by stock
    if (inStock === 'true') {
      products = products.filter(p => (p.inventory?.available || 0) > 0);
    }
    
    // Filter by search query
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }
    
    // Filter by featured
    if (featured === 'true') {
      products = products.filter(p => p.isFeatured);
    }
    
    // Sort products
    products.sort((a, b) => {
      let aValue, bValue;
      
      switch (sort) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'rating':
          aValue = a.rating?.average || 0;
          bValue = b.rating?.average || 0;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
      }
      
      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedProducts = products.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        products: paginatedProducts,
        pagination: {
          current: pageNum,
          pages: Math.ceil(products.length / limitNum),
          total: products.length
        }
      }
    });
  });

  // Mock trending products endpoints (must be before generic /:id route)
  app.get('/api/dev/products/trending_1', (req, res) => {
    try {
      // Return first available product as trending
      const trendingProduct = mockProducts[0];
      res.json({
        success: true,
        data: { product: trendingProduct }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching trending product'
      });
    }
  });

  app.get('/api/dev/products/trending_2', (req, res) => {
    try {
      // Return second available product as trending
      const trendingProduct = mockProducts[1] || mockProducts[0];
      res.json({
        success: true,
        data: { product: trendingProduct }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching trending product'
      });
    }
  });

  app.get('/api/dev/products/trending_3', (req, res) => {
    try {
      // Return third available product as trending
      const trendingProduct = mockProducts[2] || mockProducts[0];
      res.json({
        success: true,
        data: { product: trendingProduct }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching trending product'
      });
    }
  });

  app.get('/api/dev/products/trending_4', (req, res) => {
    try {
      // Return fourth available product as trending
      const trendingProduct = mockProducts[3] || mockProducts[0];
      res.json({
        success: true,
        data: { product: trendingProduct }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching trending product'
      });
    }
  });

  app.get('/api/dev/products/trending_5', (req, res) => {
    try {
      // Return fifth available product as trending
      const trendingProduct = mockProducts[4] || mockProducts[0];
      res.json({
        success: true,
        data: { product: trendingProduct }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching trending product'
      });
    }
  });

  app.get('/api/dev/products/trending_6', (req, res) => {
    try {
      // Return first available product as trending
      const trendingProduct = mockProducts[0];
      res.json({
        success: true,
        data: { product: trendingProduct }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching trending product'
      });
    }
  });

  app.get('/api/dev/products/trending_7', (req, res) => {
    try {
      // Return second available product as trending
      const trendingProduct = mockProducts[1] || mockProducts[0];
      res.json({
        success: true,
        data: { product: trendingProduct }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching trending product'
      });
    }
  });

  // Mock products by ID
  app.get('/api/dev/products/:id', (req, res) => {
    const product = mockProducts.find(p => p._id === req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, data: { product } });
  });

  // Mock admin dashboard
  app.get('/api/dev/admin/dashboard', mockAuthMiddleware, (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const stats = {
      totalUsers: 1250,
      totalArtisans: 85,
      totalProducts: mockProducts.length,
      totalOrders: 3420,
      pendingArtisans: 12,
      pendingProducts: 28,
      totalRevenue: 1250000
    };

    const recentOrders = [
      {
        _id: 'order_1',
        orderId: 'ORD-001',
        customerId: { name: 'Priya Sharma', email: 'priya@gmail.com' },
        pricing: { total: 2500 },
        status: 'delivered',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        _id: 'order_2',
        orderId: 'ORD-002',
        customerId: { name: 'Raj Mehta', email: 'raj@craftville.com' },
        pricing: { total: 1800 },
        status: 'processing',
        createdAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];

    const topArtisans = [
      {
        _id: 'artisan_1',
        businessName: 'Rajasthan Pottery',
        craftType: 'Pottery',
        city: 'Jaipur',
        state: 'Rajasthan',
        totalSales: 125000,
        profileImage: null
      },
      {
        _id: 'artisan_2',
        businessName: 'Gujarat Textiles',
        craftType: 'Textiles',
        city: 'Ahmedabad',
        state: 'Gujarat',
        totalSales: 98000,
        profileImage: null
      }
    ];

    res.json({
      success: true,
      data: { stats, recentOrders, topArtisans }
    });
  });

  // Mock artisan dashboard
  app.get('/api/dev/artisans/dashboard/stats', mockAuthMiddleware, (req, res) => {
    if (req.user.role !== 'artisan') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const stats = {
      totalProducts: 12,
      activeProducts: 8,
      totalSales: 45000,
      rating: {
        average: 4.2,
        count: 28
      }
    };

    res.json({
      success: true,
      data: { stats }
    });
  });

  // Mock artisan products
  app.get('/api/dev/products/artisan/my-products', mockAuthMiddleware, (req, res) => {
    if (req.user.role !== 'artisan') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get some products for the artisan
    const artisanProducts = mockProducts.slice(0, 5).map(product => ({
      ...product,
      artisanId: req.user._id
    }));
    const limit = parseInt(req.query.limit) || 5;
    
    res.json({
      success: true,
      data: { products: artisanProducts.slice(0, limit) }
    });
  });


  // Mock order tracking endpoints
  app.get('/api/dev/orders/:orderId/tracking', mockAuthMiddleware, (req, res) => {
    try {
      const { orderId } = req.params;
      const userId = req.user?._id || 'customer_1';
      
      // Find the order
      const userOrders = mockOrders[userId] || [];
      const order = userOrders.find(o => o._id === orderId || o.orderId === orderId);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Generate tracking information based on order status
      const trackingInfo = {
        orderId: order.orderId,
        status: order.status,
        trackingNumber: order.trackingNumber || `TRK${order.orderId.slice(-6)}`,
        carrier: order.carrier || 'BlueDart Express',
        estimatedDelivery: order.estimatedDelivery || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        timeline: generateTrackingTimeline(order.status, order.createdAt),
        currentLocation: getCurrentLocation(order.status),
        deliveryAddress: order.shippingAddress
      };

      res.json({
        success: true,
        data: { tracking: trackingInfo }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching tracking information'
      });
    }
  });

  // Mock order detail endpoint
  app.get('/api/dev/orders/:orderId', mockAuthMiddleware, (req, res) => {
    const { orderId } = req.params;
    
    const mockOrder = {
      _id: orderId,
      orderId: orderId.toUpperCase(),
      customerId: req.user?._id || 'mock_customer_id',
      items: [
        {
          productId: 'product_1',
          name: 'Rajasthan Pottery Bowl',
          price: 1200,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
        },
        {
          productId: 'product_2',
          name: 'Gujarat Textile Scarf',
          price: 800,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=300&fit=crop'
        }
      ],
      shippingAddress: {
        name: 'Priya Sharma',
        street: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        phone: '9876543210'
      },
      pricing: {
        subtotal: 2000,
        shipping: 100,
        tax: 200,
        total: 2300
      },
      status: 'delivered',
      paymentStatus: 'paid',
      paymentMethod: 'razorpay',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString()
    };

    res.json({
      success: true,
      data: { order: mockOrder }
    });
  });

  // Mock auth/me endpoint
  app.get('/api/dev/auth/me', mockAuthMiddleware, (req, res) => {
    const user = mockUsers.find(u => u._id === req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          addresses: []
        },
        artisanProfile: user.role === 'artisan' ? {
          _id: 'artisan_profile',
          businessName: 'Craft Studio',
          craftType: 'Pottery',
          city: 'Jaipur',
          state: 'Rajasthan'
        } : null
      }
    });
  });

  // Mock wishlist endpoints
  app.get('/api/dev/wishlist', mockAuthMiddleware, (req, res) => {
    try {
      const userId = req.user?._id || 'customer_1';
      const wishlistProductIds = mockWishlists[userId] || [];
      
      // Get full product details for wishlist items
      const wishlistProducts = wishlistProductIds.map(productId => {
        const product = mockProducts.find(p => p._id === productId);
        return product ? {
          _id: `wishlist_${productId}_${userId}`,
          productId: product._id,
          product: product,
          customerId: userId,
          createdAt: new Date().toISOString()
        } : null;
      }).filter(Boolean);

      res.json({
        success: true,
        data: { 
          items: wishlistProducts,
          count: wishlistProducts.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching wishlist'
      });
    }
  });

  app.post('/api/dev/wishlist', mockAuthMiddleware, async (req, res) => {
    try {
      const { productId } = req.body;
      
      // Mock adding to wishlist
      const wishlistItem = {
        _id: `wishlist_${Date.now()}`,
        productId,
        customerId: req.user._id,
        createdAt: new Date().toISOString()
      };

      res.json({
        success: true,
        message: 'Product added to wishlist',
        data: wishlistItem
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error adding to wishlist'
      });
    }
  });

  app.delete('/api/dev/wishlist/:productId', mockAuthMiddleware, async (req, res) => {
    try {
      const { productId } = req.params;
      
      // Mock removing from wishlist
      res.json({
        success: true,
        message: 'Product removed from wishlist'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error removing from wishlist'
      });
    }
  });

  app.get('/api/dev/wishlist/check/:productId', mockAuthMiddleware, async (req, res) => {
    try {
      const { productId } = req.params;
      
      // Mock checking if product is in wishlist
      const isInWishlist = Math.random() > 0.5; // Random for demo
      
      res.json({
        success: true,
        data: {
          isInWishlist
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error checking wishlist status'
      });
    }
  });

  // Mock address endpoints
  app.get('/api/dev/addresses', mockAuthMiddleware, (req, res) => {
    try {
      const mockAddresses = [
        {
          _id: 'addr_1',
          customerId: req.user._id,
          name: 'Priya Sharma',
          street: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          phone: '9876543210',
          isDefault: true,
          type: 'home',
          createdAt: new Date().toISOString()
        },
        {
          _id: 'addr_2',
          customerId: req.user._id,
          name: 'Priya Sharma',
          street: '456 Office Building',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400002',
          phone: '9876543210',
          isDefault: false,
          type: 'work',
          createdAt: new Date().toISOString()
        }
      ];

      res.json({
        success: true,
        data: { addresses: mockAddresses }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching addresses'
      });
    }
  });

  app.post('/api/dev/addresses', mockAuthMiddleware, async (req, res) => {
    try {
      const { name, street, city, state, pincode, phone, type, isDefault } = req.body;
      
      const newAddress = {
        _id: `addr_${Date.now()}`,
        customerId: req.user._id,
        name,
        street,
        city,
        state,
        pincode,
        phone,
        type: type || 'home',
        isDefault: isDefault || false,
        createdAt: new Date().toISOString()
      };

      res.status(201).json({
        success: true,
        message: 'Address added successfully',
        data: newAddress
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error adding address'
      });
    }
  });

  app.patch('/api/dev/addresses/:addressId/default', mockAuthMiddleware, async (req, res) => {
    try {
      const { addressId } = req.params;
      
      // Mock setting address as default
      res.json({
        success: true,
        message: 'Default address updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating default address'
      });
    }
  });

  app.put('/api/dev/addresses/:addressId', mockAuthMiddleware, async (req, res) => {
    try {
      const { addressId } = req.params;
      const { name, street, city, state, pincode, phone, type, isDefault } = req.body;
      
      // Mock updating address
      const updatedAddress = {
        _id: addressId,
        customerId: req.user._id,
        name,
        street,
        city,
        state,
        pincode,
        phone,
        type: type || 'home',
        isDefault: isDefault || false,
        updatedAt: new Date().toISOString()
      };

      res.json({
        success: true,
        message: 'Address updated successfully',
        data: updatedAddress
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating address'
      });
    }
  });

  app.delete('/api/dev/addresses/:addressId', mockAuthMiddleware, async (req, res) => {
    try {
      const { addressId } = req.params;
      
      // Mock deleting address
      res.json({
        success: true,
        message: 'Address deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting address'
      });
    }
  });

  // Mock review endpoints
  app.get('/api/dev/products/:productId/reviews', (req, res) => {
    try {
      const { productId } = req.params;
      const { page = 1, limit = 10, sort = 'createdAt' } = req.query;
      
      // Mock reviews data
      const mockReviews = [
        {
          _id: 'review_1',
          productId,
          customerId: {
            _id: 'customer_1',
            name: 'Priya Sharma',
            avatar: null
          },
          rating: 5,
          title: 'Beautiful craftsmanship!',
          comment: 'Absolutely love this product. The quality is exceptional and the craftsmanship is outstanding.',
          helpful: 12,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          _id: 'review_2',
          productId,
          customerId: {
            _id: 'customer_2',
            name: 'Raj Mehta',
            avatar: null
          },
          rating: 4,
          title: 'Good quality',
          comment: 'Very nice product. Good quality and fast shipping.',
          helpful: 8,
          createdAt: new Date(Date.now() - 172800000).toISOString()
        }
      ];
      
      res.json({
        success: true,
        data: {
          reviews: mockReviews,
          pagination: {
            current: parseInt(page),
            pages: 1,
            total: mockReviews.length
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching reviews'
      });
    }
  });

  app.post('/api/dev/products/:productId/reviews', mockAuthMiddleware, async (req, res) => {
    try {
      const { productId } = req.params;
      const { rating, title, comment } = req.body;
      
      // Mock creating a review
      const review = {
        _id: `review_${Date.now()}`,
        productId,
        customerId: req.user._id,
        rating,
        title,
        comment,
        helpful: 0,
        createdAt: new Date().toISOString()
      };
      
      res.json({
        success: true,
        message: 'Review submitted successfully',
        data: review
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error submitting review'
      });
    }
  });

  app.post('/api/dev/reviews/:reviewId/helpful', mockAuthMiddleware, async (req, res) => {
    try {
      const { reviewId } = req.params;
      
      // Mock marking review as helpful
      res.json({
        success: true,
        message: 'Review marked as helpful'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error marking review as helpful'
      });
    }
  });

  app.post('/api/dev/reviews/:reviewId/respond', mockAuthMiddleware, async (req, res) => {
    try {
      const { reviewId } = req.params;
      const { response } = req.body;
      
      // Mock responding to review
      res.json({
        success: true,
        message: 'Response added to review'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error responding to review'
      });
    }
  });


  // Mock payment & checkout endpoints (removed duplicate - using the one above)

  app.post('/api/dev/payments/create-order', async (req, res) => {
    try {
      const { amount, currency = 'INR', orderId } = req.body;
      
      // Mock Razorpay order creation
      const razorpayOrder = {
        id: `order_${Date.now()}`,
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        receipt: orderId,
        status: 'created',
        created_at: Date.now()
      };

      res.json({
        success: true,
        message: 'Razorpay order created successfully',
        data: { order: razorpayOrder }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating payment order'
      });
    }
  });

  app.post('/api/dev/payments/verify', async (req, res) => {
    try {
      // Support both field name formats for compatibility
      const { 
        orderId, 
        paymentId, 
        signature,
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature 
      } = req.body;
      
      // Use the correct field names (frontend sends orderId, paymentId, signature)
      const finalOrderId = orderId || razorpay_order_id;
      const finalPaymentId = paymentId || razorpay_payment_id;
      const finalSignature = signature || razorpay_signature;
      
      console.log('Payment verification request:', {
        orderId: finalOrderId,
        paymentId: finalPaymentId,
        signature: finalSignature,
        rawBody: req.body
      });
      
      // Mock payment verification (in production, verify with Razorpay)
      const paymentVerification = {
        verified: true,
        paymentId: finalPaymentId,
        orderId: finalOrderId,
        signature: finalSignature,
        amount: 2300,
        currency: 'INR',
        status: 'captured',
        capturedAt: new Date().toISOString()
      };

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: paymentVerification
      });
    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Payment verification failed',
        error: error.message
      });
    }
  });

  app.post('/api/dev/coupons/validate', async (req, res) => {
    try {
      const { code } = req.body;
      
      // Mock coupon validation
      const validCoupons = {
        'WELCOME10': { discount: 10, type: 'percentage', minAmount: 500 },
        'SAVE50': { discount: 50, type: 'fixed', minAmount: 1000 },
        'FREESHIP': { discount: 0, type: 'shipping', minAmount: 300 }
      };

      const coupon = validCoupons[code];
      
      if (!coupon) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coupon code'
        });
      }

      res.json({
        success: true,
        message: 'Coupon code is valid',
        data: { coupon: { code, ...coupon } }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error validating coupon'
      });
    }
  });

  // Mock search and category endpoints
  app.get('/api/dev/search', (req, res) => {
    try {
      const { q, category, limit = 10 } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const searchTerm = q.toLowerCase();
      let results = mockProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );

      if (category && category !== 'all') {
        results = results.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }

      results = results.slice(0, parseInt(limit));

      res.json({
        success: true,
        data: {
          products: results,
          total: results.length,
          query: q
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error performing search'
      });
    }
  });

  app.get('/api/dev/categories', (req, res) => {
    try {
      // Extract unique categories from products
      const categories = [...new Set(mockProducts.map(p => p.category))].map(category => ({
        name: category,
        slug: category.toLowerCase().replace(/\s+/g, '-'),
        count: mockProducts.filter(p => p.category === category).length
      }));

      res.json({
        success: true,
        data: { categories }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching categories'
      });
    }
  });

  app.get('/api/dev/search/suggestions', (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q || q.length < 2) {
        return res.json({
          success: true,
          data: { suggestions: [] }
        });
      }

      const searchTerm = q.toLowerCase();
      const suggestions = [];

      // Get product name suggestions
      const productNames = mockProducts
        .filter(p => p.name.toLowerCase().includes(searchTerm))
        .slice(0, 5)
        .map(p => ({ type: 'product', text: p.name, id: p._id }));

      // Get category suggestions
      const categories = [...new Set(mockProducts.map(p => p.category))]
        .filter(cat => cat.toLowerCase().includes(searchTerm))
        .slice(0, 3)
        .map(cat => ({ type: 'category', text: cat, slug: cat.toLowerCase().replace(/\s+/g, '-') }));

      suggestions.push(...productNames, ...categories);

      res.json({
        success: true,
        data: { suggestions }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching suggestions'
      });
    }
  });

  // Mock admin product management endpoints
  app.post('/api/dev/admin/products', mockAuthMiddleware, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      const { name, description, price, category, images, tags, inventory, variants } = req.body;
      
      const newProduct = {
        _id: `product_${Date.now()}`,
        name,
        description,
        price: parseInt(price),
        category,
        images: images || [],
        tags: tags || [],
        inventory: inventory || { available: 0, reserved: 0 },
        variants: variants || [],
        isActive: true,
        artisanId: 'admin',
        rating: { average: 0, count: 0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: { product: newProduct }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating product'
      });
    }
  });

  app.put('/api/dev/admin/products/:productId', mockAuthMiddleware, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      const { productId } = req.params;
      const updates = req.body;
      
      // Mock updating product
      const updatedProduct = {
        _id: productId,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: { product: updatedProduct }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating product'
      });
    }
  });

  app.delete('/api/dev/admin/products/:productId', mockAuthMiddleware, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      const { productId } = req.params;
      
      // Mock deleting product
      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting product'
      });
    }
  });

  app.get('/api/dev/admin/orders', mockAuthMiddleware, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      const { page = 1, limit = 20, status, dateFrom, dateTo } = req.query;
      
      // Mock admin orders with more details
      const mockAdminOrders = [
        {
          _id: 'order_1',
          orderId: 'ORD-001',
          customerId: {
            _id: 'customer_1',
            name: 'Priya Sharma',
            email: 'priya@gmail.com',
            phone: '9876543210'
          },
          items: [
            { name: 'Rajasthan Pottery Bowl', price: 1200, quantity: 1 },
            { name: 'Gujarat Textile Scarf', price: 800, quantity: 1 }
          ],
          pricing: { subtotal: 2000, shipping: 100, tax: 200, total: 2300 },
          status: 'processing',
          paymentStatus: 'paid',
          shippingAddress: {
            name: 'Priya Sharma',
            street: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001'
          },
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          _id: 'order_2',
          orderId: 'ORD-002',
          customerId: {
            _id: 'customer_2',
            name: 'Raj Mehta',
            email: 'raj@craftville.com',
            phone: '9876543211'
          },
          items: [
            { name: 'Kerala Wooden Sculpture', price: 2500, quantity: 1 }
          ],
          pricing: { subtotal: 2500, shipping: 0, tax: 250, total: 2750 },
          status: 'shipped',
          paymentStatus: 'paid',
          shippingAddress: {
            name: 'Raj Mehta',
            street: '456 Office Building',
            city: 'Delhi',
            state: 'Delhi',
            pincode: '110001'
          },
          createdAt: new Date(Date.now() - 172800000).toISOString()
        }
      ];

      res.json({
        success: true,
        data: { 
          orders: mockAdminOrders,
          pagination: {
            current: parseInt(page),
            pages: 1,
            total: mockAdminOrders.length
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching admin orders'
      });
    }
  });

  app.patch('/api/dev/admin/orders/:orderId/status', mockAuthMiddleware, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      const { orderId } = req.params;
      const { status } = req.body;
      
      // Mock updating order status
      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: { orderId, status }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating order status'
      });
    }
  });

  // Mock email notification endpoints
  app.post('/api/dev/email/order-confirmation', async (req, res) => {
    try {
      const { orderId, customerEmail, customerName, orderDetails } = req.body;
      
      // Mock sending order confirmation email
      console.log('Order confirmation email sent:', {
        to: customerEmail,
        orderId,
        customerName,
        total: orderDetails.total
      });
      
      res.json({
        success: true,
        message: 'Order confirmation email sent successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error sending order confirmation email'
      });
    }
  });

  app.post('/api/dev/email/shipping-update', async (req, res) => {
    try {
      const { orderId, customerEmail, customerName, trackingNumber, status } = req.body;
      
      // Mock sending shipping update email
      console.log('Shipping update email sent:', {
        to: customerEmail,
        orderId,
        trackingNumber,
        status
      });
      
      res.json({
        success: true,
        message: 'Shipping update email sent successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error sending shipping update email'
      });
    }
  });

  app.post('/api/dev/email/welcome', async (req, res) => {
    try {
      const { customerEmail, customerName } = req.body;
      
      // Mock sending welcome email
      console.log('Welcome email sent:', {
        to: customerEmail,
        customerName
      });
      
      res.json({
        success: true,
        message: 'Welcome email sent successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error sending welcome email'
      });
    }
  });

  // Mock inventory management endpoints
  app.get('/api/dev/inventory', mockAuthMiddleware, (req, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'artisan') {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      // Get low stock products (less than 10 items)
      const lowStockProducts = mockProducts.filter(p => p.inventory?.available < 10).map(product => ({
        _id: product._id,
        name: product.name,
        currentStock: product.inventory?.available || 0,
        minStock: 10,
        category: product.category,
        artisanId: product.artisanId,
        status: product.inventory?.available === 0 ? 'out_of_stock' : 'low_stock'
      }));

      // Get out of stock products
      const outOfStockProducts = mockProducts.filter(p => p.inventory?.available === 0).map(product => ({
        _id: product._id,
        name: product.name,
        currentStock: 0,
        category: product.category,
        artisanId: product.artisanId,
        status: 'out_of_stock'
      }));

      // Inventory summary
      const inventorySummary = {
        totalProducts: mockProducts.length,
        inStock: mockProducts.filter(p => p.inventory?.available > 0).length,
        lowStock: lowStockProducts.length,
        outOfStock: outOfStockProducts.length,
        totalValue: mockProducts.reduce((sum, p) => sum + (p.price * (p.inventory?.available || 0)), 0)
      };

      res.json({
        success: true,
        data: {
          summary: inventorySummary,
          lowStockProducts,
          outOfStockProducts
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching inventory data'
      });
    }
  });

  app.patch('/api/dev/inventory/:productId/stock', mockAuthMiddleware, (req, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'artisan') {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      const { productId } = req.params;
      const { quantity, operation } = req.body; // operation: 'add', 'subtract', 'set'

      const product = mockProducts.find(p => p._id === productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Update stock based on operation
      let newStock = product.inventory?.available || 0;
      switch (operation) {
        case 'add':
          newStock += quantity;
          break;
        case 'subtract':
          newStock = Math.max(0, newStock - quantity);
          break;
        case 'set':
          newStock = Math.max(0, quantity);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid operation. Use: add, subtract, or set'
          });
      }

      // Update the product inventory
      product.inventory = {
        available: newStock,
        reserved: product.inventory?.reserved || 0
      };

      res.json({
        success: true,
        message: 'Stock updated successfully',
        data: {
          productId: product._id,
          productName: product.name,
          newStock: newStock,
          operation: operation,
          quantity: quantity
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating inventory'
      });
    }
  });

  // Mock returns and exchanges endpoints
  app.post('/api/dev/returns', mockAuthMiddleware, async (req, res) => {
    try {
      const { orderId, items, reason, type, description } = req.body; // type: 'return' or 'exchange'
      const userId = req.user._id;

      // Validate order belongs to user
      const userOrders = mockOrders[userId] || [];
      const order = userOrders.find(o => o._id === orderId || o.orderId === orderId);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Create return/exchange request
      const returnRequest = {
        _id: `return_${Date.now()}`,
        returnId: `RET${Date.now().toString().slice(-6)}`,
        orderId: order.orderId,
        customerId: userId,
        type: type, // 'return' or 'exchange'
        reason: reason,
        description: description,
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          reason: item.reason || reason
        })),
        status: 'pending',
        requestedAt: new Date().toISOString(),
        totalRefundAmount: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };

      res.status(201).json({
        success: true,
        message: `${type === 'return' ? 'Return' : 'Exchange'} request submitted successfully`,
        data: { returnRequest }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error submitting return/exchange request'
      });
    }
  });

  app.get('/api/dev/returns', mockAuthMiddleware, (req, res) => {
    try {
      const userId = req.user._id;
      
      // Mock return requests for the user
      const mockReturnRequests = [
        {
          _id: 'return_1',
          returnId: 'RET001',
          orderId: 'ORD-001',
          type: 'return',
          reason: 'Product damaged',
          status: 'approved',
          items: [
            { productId: 'product_1', name: 'Rajasthan Pottery Bowl', quantity: 1, price: 1200 }
          ],
          totalRefundAmount: 1200,
          requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          processedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      res.json({
        success: true,
        data: { returns: mockReturnRequests }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching return requests'
      });
    }
  });

  app.patch('/api/dev/returns/:returnId/status', mockAuthMiddleware, (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      const { returnId } = req.params;
      const { status, adminNotes } = req.body;

      // Mock updating return status
      res.json({
        success: true,
        message: 'Return status updated successfully',
        data: {
          returnId,
          status,
          adminNotes,
          updatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating return status'
      });
    }
  });

  // Mock shipping calculator endpoint
  app.post('/api/dev/shipping/calculate', (req, res) => {
    try {
      const { address, items } = req.body;
      const { city, state, pincode } = address;
      
      // Calculate base shipping cost
      let baseShipping = 100; // Default shipping cost
      
      // Free shipping for orders over ₹1000
      const orderTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      if (orderTotal >= 1000) {
        baseShipping = 0;
      }
      
      // Distance-based shipping calculation
      const metroCities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];
      const isMetroCity = metroCities.some(metro => city.toLowerCase().includes(metro.toLowerCase()));
      
      if (isMetroCity) {
        baseShipping = baseShipping === 0 ? 0 : Math.min(baseShipping, 80); // Cheaper for metro cities
      } else {
        baseShipping = baseShipping === 0 ? 0 : baseShipping + 50; // Extra cost for non-metro
      }
      
      // Express delivery option
      const expressDelivery = {
        available: true,
        cost: baseShipping + 100,
        estimatedDays: 1
      };
      
      // Standard delivery
      const standardDelivery = {
        cost: baseShipping,
        estimatedDays: isMetroCity ? 3 : 5
      };
      
      const shippingOptions = [
        {
          type: 'standard',
          name: 'Standard Delivery',
          cost: standardDelivery.cost,
          estimatedDays: standardDelivery.estimatedDays,
          description: `Delivered in ${standardDelivery.estimatedDays} business days`
        }
      ];
      
      // Add express option if cost is reasonable
      if (expressDelivery.cost <= 200) {
        shippingOptions.push({
          type: 'express',
          name: 'Express Delivery',
          cost: expressDelivery.cost,
          estimatedDays: expressDelivery.estimatedDays,
          description: `Delivered in ${expressDelivery.estimatedDays} business day`
        });
      }
      
      res.json({
        success: true,
        data: {
          shippingOptions,
          freeShippingThreshold: 1000,
          orderTotal,
          eligibleForFreeShipping: orderTotal >= 1000
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error calculating shipping'
      });
    }
  });

  // Mock SMS notification endpoints
  app.post('/api/dev/sms/send', mockAuthMiddleware, async (req, res) => {
    try {
      const { to, message, type } = req.body;
      
      // Mock SMS sending
      console.log('SMS sent:', {
        to,
        message,
        type,
        timestamp: new Date().toISOString()
      });
      
      res.json({
        success: true,
        message: 'SMS sent successfully',
        data: {
          messageId: `sms_${Date.now()}`,
          status: 'sent',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error sending SMS'
      });
    }
  });

  // Mock advanced analytics endpoints
  app.get('/api/dev/analytics/sales', mockAuthMiddleware, (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      // Mock sales analytics data
      const salesAnalytics = {
        totalRevenue: 1250000,
        totalOrders: 342,
        averageOrderValue: 3655,
        conversionRate: 3.2,
        topSellingProducts: [
          { productId: 'product_1', name: 'Rajasthan Pottery Bowl', sales: 45, revenue: 54000 },
          { productId: 'product_5', name: 'Gujarat Textile Scarf', sales: 38, revenue: 30400 },
          { productId: 'product_12', name: 'Kashmir Shawl', sales: 32, revenue: 112000 },
          { productId: 'product_3', name: 'Kerala Wooden Sculpture', sales: 28, revenue: 70000 },
          { productId: 'product_7', name: 'Madhubani Painting', sales: 25, revenue: 45000 }
        ],
        salesByCategory: [
          { category: 'Pottery', revenue: 320000, orders: 120 },
          { category: 'Textiles', revenue: 280000, orders: 95 },
          { category: 'Wooden Crafts', revenue: 250000, orders: 78 },
          { category: 'Paintings', revenue: 200000, orders: 65 },
          { category: 'Jewelry', revenue: 200000, orders: 84 }
        ],
        monthlySales: [
          { month: 'Jan', revenue: 95000, orders: 28 },
          { month: 'Feb', revenue: 110000, orders: 32 },
          { month: 'Mar', revenue: 125000, orders: 38 },
          { month: 'Apr', revenue: 140000, orders: 42 },
          { month: 'May', revenue: 135000, orders: 40 },
          { month: 'Jun', revenue: 150000, orders: 45 }
        ],
        customerAnalytics: {
          totalCustomers: 156,
          newCustomers: 23,
          returningCustomers: 133,
          averageCustomerValue: 8012
        }
      };

      res.json({
        success: true,
        data: salesAnalytics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching sales analytics'
      });
    }
  });

  // Mock content management endpoints
  app.get('/api/dev/content/:page', (req, res) => {
    try {
      const { page } = req.params;
      
      const contentData = {
        about: {
          title: 'About Kalakari',
          content: 'Kalakari is India\'s premier platform for authentic handicrafts and traditional art forms. We connect skilled artisans with customers who appreciate quality craftsmanship.',
          lastUpdated: new Date().toISOString()
        },
        contact: {
          title: 'Contact Us',
          content: 'Get in touch with us for any queries or support. We\'re here to help!',
          email: 'support@kalakari.shop',
          phone: '+91-9876543210',
          address: '123 Artisan Street, Mumbai, Maharashtra 400001',
          lastUpdated: new Date().toISOString()
        },
        terms: {
          title: 'Terms of Service',
          content: 'By using Kalakari, you agree to our terms of service...',
          lastUpdated: new Date().toISOString()
        },
        privacy: {
          title: 'Privacy Policy',
          content: 'We respect your privacy and are committed to protecting your personal information...',
          lastUpdated: new Date().toISOString()
        }
      };

      const pageContent = contentData[page];
      if (!pageContent) {
        return res.status(404).json({
          success: false,
          message: 'Page not found'
        });
      }

      res.json({
        success: true,
        data: pageContent
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching page content'
      });
    }
  });

  app.put('/api/dev/content/:page', mockAuthMiddleware, (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      const { page } = req.params;
      const { title, content } = req.body;

      // Mock updating page content
      res.json({
        success: true,
        message: 'Page content updated successfully',
        data: {
          page,
          title,
          content,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating page content'
      });
    }
  });

  // Mock multiple payment methods endpoints
  app.post('/api/dev/payments/methods', (req, res) => {
    try {
      const paymentMethods = [
        {
          id: 'razorpay',
          name: 'Razorpay',
          type: 'card',
          icon: '💳',
          enabled: true,
          description: 'Credit/Debit Cards, UPI, Net Banking'
        },
        {
          id: 'upi',
          name: 'UPI',
          type: 'upi',
          icon: '📱',
          enabled: true,
          description: 'PhonePe, Google Pay, Paytm, BHIM'
        },
        {
          id: 'netbanking',
          name: 'Net Banking',
          type: 'netbanking',
          icon: '🏦',
          enabled: true,
          description: 'All major banks'
        },
        {
          id: 'wallet',
          name: 'Digital Wallets',
          type: 'wallet',
          icon: '💰',
          enabled: true,
          description: 'Paytm, MobiKwik, Freecharge'
        },
        {
          id: 'cod',
          name: 'Cash on Delivery',
          type: 'cod',
          icon: '💵',
          enabled: true,
          description: 'Pay when delivered (₹50 extra charge)'
        }
      ];

      res.json({
        success: true,
        data: paymentMethods
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching payment methods'
      });
    }
  });

  // Mock guest order tracking
  app.get('/api/dev/orders/guest/:orderId', (req, res) => {
    try {
      const { orderId } = req.params;
      
      // Mock guest order data
      const guestOrder = {
        _id: orderId,
        orderId: orderId,
        status: 'shipped',
        trackingNumber: `TRK${Date.now()}`,
        items: [
          {
            productId: 'product_1',
            name: 'Rajasthan Pottery Bowl',
            quantity: 1,
            price: 1200,
            image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
          }
        ],
        pricing: {
          subtotal: 1200,
          shipping: 100,
          tax: 120,
          total: 1420
        },
        shippingAddress: {
          name: 'Guest User',
          street: '123 Guest Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001'
        },
        tracking: {
          status: 'shipped',
          currentLocation: 'Mumbai Hub',
          estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          timeline: [
            {
              status: 'ordered',
              timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              location: 'Order Placed'
            },
            {
              status: 'processing',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              location: 'Processing Center'
            },
            {
              status: 'shipped',
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              location: 'Mumbai Hub'
            }
          ]
        },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      };

      res.json({
        success: true,
        data: guestOrder
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching guest order'
      });
    }
  });

  // Mock admin review management endpoints
  app.get('/api/dev/admin/reviews', mockAuthMiddleware, (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      // Mock pending reviews for admin approval
      const pendingReviews = [
        {
          _id: 'review_pending_1',
          productId: 'product_1',
          productName: 'Rajasthan Pottery Bowl',
          userId: 'customer_2',
          userName: 'Arjun Patel',
          rating: 5,
          title: 'Excellent quality!',
          comment: 'Beautiful pottery, exactly as described. Fast shipping too!',
          status: 'pending',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          helpful: 0,
          verified: false
        },
        {
          _id: 'review_pending_2',
          productId: 'product_5',
          productName: 'Gujarat Textile Scarf',
          userId: 'customer_3',
          userName: 'Sneha Reddy',
          rating: 4,
          title: 'Nice product',
          comment: 'Good quality fabric, colors are vibrant. Would recommend.',
          status: 'pending',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          helpful: 0,
          verified: false
        },
        {
          _id: 'review_pending_3',
          productId: 'product_12',
          productName: 'Kashmir Shawl',
          userId: 'customer_1',
          userName: 'Priya Sharma',
          rating: 3,
          title: 'Average quality',
          comment: 'The shawl is okay but not as soft as expected. Shipping was delayed.',
          status: 'pending',
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          helpful: 0,
          verified: false
        }
      ];

      res.json({
        success: true,
        data: {
          pendingReviews,
          totalPending: pendingReviews.length,
          approvedToday: 12,
          rejectedToday: 2
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching pending reviews'
      });
    }
  });

  app.patch('/api/dev/admin/reviews/:reviewId/approve', mockAuthMiddleware, (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      const { reviewId } = req.params;
      const { status } = req.body; // 'approved' or 'rejected'

      // Mock approving/rejecting review
      res.json({
        success: true,
        message: `Review ${status} successfully`,
        data: {
          reviewId,
          status,
          approvedBy: req.user._id,
          approvedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating review status'
      });
    }
  });

  app.delete('/api/dev/admin/reviews/:reviewId', mockAuthMiddleware, (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      const { reviewId } = req.params;

      // Mock deleting review
      res.json({
        success: true,
        message: 'Review deleted successfully',
        data: {
          reviewId,
          deletedBy: req.user._id,
          deletedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting review'
      });
    }
  });

  // Mock contact/email endpoints
  app.post('/api/dev/email/contact', async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      
      // Mock sending contact email
      console.log('Contact form submission:', { name, email, subject, message });
      
      res.json({
        success: true,
        message: 'Thank you for your message! We will get back to you soon.'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error sending contact message'
      });
    }
  });

  app.post('/api/dev/email/newsletter', async (req, res) => {
    try {
      const { email, name } = req.body;
      
      // Mock newsletter subscription
      console.log('Newsletter subscription:', { email, name });
      
      res.json({
        success: true,
        message: 'Successfully subscribed to newsletter!'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error subscribing to newsletter'
      });
    }
  });

  console.log('🚀 Development mode: Mock endpoints available');
  console.log('📱 AUTHENTICATION:');
  console.log('   POST /api/dev/auth/login');
  console.log('   GET /api/dev/auth/me');
  console.log('');
  console.log('🛍️ PRODUCTS & SEARCH:');
  console.log('   GET /api/dev/products (with filters)');
  console.log('   GET /api/dev/products/:id');
  console.log('   GET /api/dev/search');
  console.log('   GET /api/dev/search/suggestions');
  console.log('   GET /api/dev/categories');
  console.log('');
  console.log('⭐ REVIEWS:');
  console.log('   GET /api/dev/products/:productId/reviews');
  console.log('   POST /api/dev/products/:productId/reviews');
  console.log('');
  console.log('🛒 ORDERS & CHECKOUT:');
  console.log('   POST /api/dev/orders (supports guest checkout)');
  console.log('   GET /api/dev/orders/user');
  console.log('   GET /api/dev/orders/:orderId');
  console.log('   GET /api/dev/orders/:orderId/tracking');
  console.log('   POST /api/dev/payments/create-order');
  console.log('   POST /api/dev/payments/verify');
  console.log('   POST /api/dev/coupons/validate');
  console.log('');
  console.log('📦 RETURNS & EXCHANGES:');
  console.log('   POST /api/dev/returns');
  console.log('   GET /api/dev/returns');
  console.log('   PATCH /api/dev/returns/:returnId/status');
  console.log('');
  console.log('📊 INVENTORY MANAGEMENT:');
  console.log('   GET /api/dev/inventory');
  console.log('   PATCH /api/dev/inventory/:productId/stock');
  console.log('');
  console.log('📍 ADDRESSES:');
  console.log('   GET /api/dev/addresses');
  console.log('   POST /api/dev/addresses');
  console.log('   PUT /api/dev/addresses/:addressId');
  console.log('   DELETE /api/dev/addresses/:addressId');
  console.log('');
  console.log('❤️ WISHLIST:');
  console.log('   GET /api/dev/wishlist');
  console.log('   POST /api/dev/wishlist');
  console.log('   DELETE /api/dev/wishlist/:productId');
  console.log('');
  console.log('👑 ADMIN:');
  console.log('   GET /api/dev/admin/dashboard');
  console.log('   GET /api/dev/admin/products');
  console.log('   POST /api/dev/admin/products');
  console.log('   PUT /api/dev/admin/products/:productId');
  console.log('   DELETE /api/dev/admin/products/:productId');
  console.log('   GET /api/dev/admin/orders');
  console.log('   PATCH /api/dev/admin/orders/:orderId/status');
  console.log('');
  console.log('📧 EMAIL NOTIFICATIONS:');
  console.log('   POST /api/dev/email/order-confirmation');
  console.log('   POST /api/dev/email/shipping-update');
  console.log('   POST /api/dev/email/welcome');
  console.log('   POST /api/dev/email/contact');
  console.log('   POST /api/dev/email/newsletter');
  console.log('');
  console.log('🚚 SHIPPING & PAYMENTS:');
  console.log('   POST /api/dev/shipping/calculate');
  console.log('   GET /api/dev/payments/methods');
  console.log('   GET /api/dev/orders/guest/:orderId');
  console.log('');
  console.log('📊 ANALYTICS & CMS:');
  console.log('   GET /api/dev/analytics/sales');
  console.log('   GET /api/dev/content/:page');
  console.log('   PUT /api/dev/content/:page');
  console.log('');
  console.log('📱 SMS NOTIFICATIONS:');
  console.log('   POST /api/dev/sms/send');
  console.log('');
  console.log('⭐ REVIEW MANAGEMENT:');
  console.log('   GET /api/dev/admin/reviews');
  console.log('   PATCH /api/dev/admin/reviews/:reviewId/approve');
  console.log('   DELETE /api/dev/admin/reviews/:reviewId');
}

// Health check endpoint is handled by /routes/health.js

// Error handling middleware
if (process.env.NODE_ENV === 'development') {
  app.use(errorHandler);
} else {
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
      message: 'Something went wrong!',
      error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
  });
}

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

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
