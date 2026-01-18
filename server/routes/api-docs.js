const express = require('express');
const router = express.Router();

/**
 * API Documentation Route
 * Provides comprehensive API documentation and management
 */

// API Documentation
router.get('/', (req, res) => {
  const apiDoc = {
    name: 'Kalakari API',
    version: '1.0.0',
    description: 'E-commerce API for traditional Indian handicrafts marketplace',
    baseUrl: `${req.protocol}://${req.get('host')}/api`,
    documentation: `${req.protocol}://${req.get('host')}/api/docs`,
    
    endpoints: {
      authentication: {
        base: '/auth',
        endpoints: [
          { method: 'POST', path: '/register', description: 'Register new user', access: 'Public' },
          { method: 'POST', path: '/login', description: 'User login', access: 'Public' },
          { method: 'POST', path: '/logout', description: 'User logout', access: 'Private' },
          { method: 'GET', path: '/me', description: 'Get current user profile', access: 'Private' },
          { method: 'POST', path: '/forgot-password', description: 'Request password reset', access: 'Public' },
          { method: 'POST', path: '/reset-password', description: 'Reset password with token', access: 'Public' }
        ]
      },
      
      products: {
        base: '/products',
        endpoints: [
          { method: 'GET', path: '/', description: 'Get all products with filters', access: 'Public' },
          { method: 'GET', path: '/:id', description: 'Get single product details', access: 'Public' },
          { method: 'POST', path: '/', description: 'Create new product', access: 'Private (Artisan)' },
          { method: 'PUT', path: '/:id', description: 'Update product', access: 'Private (Owner)' },
          { method: 'DELETE', path: '/:id', description: 'Delete product', access: 'Private (Owner)' },
          { method: 'GET', path: '/artisan/my-products', description: 'Get artisan products', access: 'Private (Artisan)' },
          { method: 'GET', path: '/featured', description: 'Get featured products', access: 'Public' },
          { method: 'GET', path: '/categories', description: 'Get product categories', access: 'Public' }
        ]
      },
      
      orders: {
        base: '/orders',
        endpoints: [
          { method: 'POST', path: '/', description: 'Create new order', access: 'Private (Customer)' },
          { method: 'GET', path: '/', description: 'Get user orders', access: 'Private (Customer)' },
          { method: 'GET', path: '/:id', description: 'Get order details', access: 'Private (Owner)' },
          { method: 'PUT', path: '/:id/status', description: 'Update order status', access: 'Private (Admin/Artisan)' },
          { method: 'GET', path: '/artisan/orders', description: 'Get artisan orders', access: 'Private (Artisan)' }
        ]
      },
      
      artisans: {
        base: '/artisans',
        endpoints: [
          { method: 'POST', path: '/register', description: 'Register as artisan', access: 'Private' },
          { method: 'GET', path: '/', description: 'Get all artisans', access: 'Public' },
          { method: 'GET', path: '/:id', description: 'Get artisan profile', access: 'Public' },
          { method: 'PUT', path: '/profile', description: 'Update artisan profile', access: 'Private (Artisan)' },
          { method: 'GET', path: '/dashboard/stats', description: 'Get artisan dashboard stats', access: 'Private (Artisan)' }
        ]
      },
      
      cart: {
        base: '/cart',
        endpoints: [
          { method: 'GET', path: '/', description: 'Get cart items', access: 'Private' },
          { method: 'POST', path: '/add', description: 'Add item to cart', access: 'Private' },
          { method: 'PUT', path: '/update/:productId', description: 'Update cart item quantity', access: 'Private' },
          { method: 'DELETE', path: '/remove/:productId', description: 'Remove item from cart', access: 'Private' },
          { method: 'DELETE', path: '/clear', description: 'Clear cart', access: 'Private' }
        ]
      },
      
      wishlist: {
        base: '/wishlist',
        endpoints: [
          { method: 'GET', path: '/', description: 'Get wishlist items', access: 'Private' },
          { method: 'POST', path: '/add/:productId', description: 'Add item to wishlist', access: 'Private' },
          { method: 'DELETE', path: '/remove/:productId', description: 'Remove item from wishlist', access: 'Private' }
        ]
      },
      
      reviews: {
        base: '/reviews',
        endpoints: [
          { method: 'POST', path: '/', description: 'Create product review', access: 'Private (Customer)' },
          { method: 'GET', path: '/product/:productId', description: 'Get product reviews', access: 'Public' },
          { method: 'PUT', path: '/:id', description: 'Update review', access: 'Private (Owner)' },
          { method: 'DELETE', path: '/:id', description: 'Delete review', access: 'Private (Owner/Admin)' }
        ]
      },
      
      admin: {
        base: '/admin',
        endpoints: [
          { method: 'GET', path: '/dashboard', description: 'Get admin dashboard stats', access: 'Private (Admin)' },
          { method: 'GET', path: '/products', description: 'Get all products for approval', access: 'Private (Admin)' },
          { method: 'PUT', path: '/products/:id/approve', description: 'Approve product', access: 'Private (Admin)' },
          { method: 'GET', path: '/artisans', description: 'Get all artisans for approval', access: 'Private (Admin)' },
          { method: 'PUT', path: '/artisans/:id/approve', description: 'Approve artisan', access: 'Private (Admin)' },
          { method: 'GET', path: '/orders', description: 'Get all orders', access: 'Private (Admin)' }
        ]
      },
      
      search: {
        base: '/search',
        endpoints: [
          { method: 'GET', path: '/products', description: 'Search products', access: 'Public' },
          { method: 'GET', path: '/suggestions', description: 'Get search suggestions', access: 'Public' },
          { method: 'GET', path: '/artisans', description: 'Search artisans', access: 'Public' }
        ]
      },
      
      health: {
        base: '/health',
        endpoints: [
          { method: 'GET', path: '/', description: 'API health check', access: 'Public' },
          { method: 'GET', path: '/database', description: 'Database health check', access: 'Public' }
        ]
      }
    },
    
    authentication: {
      type: 'Bearer Token (JWT)',
      header: 'Authorization: Bearer <token>',
      cookie: 'kalakari-token (HTTP-only)',
      csrf: 'X-CSRF-Token header required for state-changing operations'
    },
    
    rateLimits: {
      general: '100 requests per 15 minutes',
      auth: '5 requests per 15 minutes',
      passwordReset: '3 requests per 15 minutes',
      upload: '10 requests per 15 minutes',
      reviews: '5 requests per 15 minutes'
    },
    
    responseFormat: {
      success: {
        success: true,
        data: {},
        message: 'Optional success message'
      },
      error: {
        success: false,
        message: 'Error description',
        errors: 'Validation errors (if applicable)',
        requestId: 'Unique request identifier'
      }
    },
    
    statusCodes: {
      200: 'Success',
      201: 'Created',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Validation Error',
      429: 'Too Many Requests',
      500: 'Internal Server Error'
    },
    
    filters: {
      products: [
        'category', 'artisanId', 'minPrice', 'maxPrice', 'search', 'state',
        'minRating', 'materials', 'colors', 'inStock', 'featured', 'page', 'limit'
      ]
    },
    
    pagination: {
      defaultLimit: 12,
      maxLimit: 100,
      format: {
        current: 1,
        pages: 10,
        total: 100,
        limit: 12
      }
    }
  };
  
  res.json(apiDoc);
});

// API Status
router.get('/status', (req, res) => {
  res.json({
    status: 'operational',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;
