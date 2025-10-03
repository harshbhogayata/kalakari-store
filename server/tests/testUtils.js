// Test utilities for server-side testing
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

class TestUtils {
  constructor(app) {
    this.app = app;
    this.authTokens = new Map();
  }

  // Generate test JWT token
  generateTestToken(userId = 'test_user_1', role = 'customer') {
    const payload = {
      id: userId,
      role: role,
      email: `${role}@test.com`,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
    };

    return jwt.sign(payload, process.env.JWT_SECRET || 'HARSHBHOGAYATAKALAKARI');
  }

  // Set up authenticated request
  authenticatedRequest(method, url, token = null) {
    const req = request(this.app)[method](url);
    
    if (token) {
      req.set('Authorization', `Bearer ${token}`);
    } else {
      req.set('Authorization', `Bearer ${this.generateTestToken()}`);
    }
    
    return req;
  }

  // Create test user data
  createTestUser(overrides = {}) {
    return {
      _id: 'test_user_1',
      name: 'Test User',
      email: 'test@example.com',
      phone: '9876543210',
      password: 'TestPassword123!',
      role: 'customer',
      ...overrides
    };
  }

  // Create test product data
  createTestProduct(overrides = {}) {
    return {
      _id: 'test_product_1',
      name: 'Test Product',
      description: 'A test product for testing purposes',
      category: 'Pottery',
      price: 1000,
      artisanId: 'artisan_1',
      inventory: {
        total: 10,
        available: 10,
        reserved: 0
      },
      images: [{
        url: 'https://example.com/image.jpg',
        alt: 'Test product image',
        isPrimary: true
      }],
      ...overrides
    };
  }

  // Create test order data
  createTestOrder(overrides = {}) {
    return {
      orderId: 'ORD_TEST_001',
      customerId: 'test_user_1',
      items: [{
        productId: 'test_product_1',
        quantity: 2,
        price: 1000
      }],
      shippingAddress: {
        name: 'Test User',
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        phone: '9876543210'
      },
      payment: {
        method: 'razorpay',
        status: 'pending',
        transactionId: 'txn_test_001'
      },
      total: 2000,
      status: 'pending',
      ...overrides
    };
  }

  // Clean up test data
  async cleanup() {
    // Clear auth tokens
    this.authTokens.clear();
    
    // Clean up database collections
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }

  // Wait for async operations
  async wait(ms = 100) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Mock external services
  mockExternalServices() {
    // Mock Razorpay
    jest.mock('razorpay', () => {
      return jest.fn().mockImplementation(() => ({
        orders: {
          create: jest.fn().mockResolvedValue({
            id: 'order_test_123',
            amount: 2000,
            currency: 'INR',
            status: 'created'
          })
        },
        payments: {
          verify: jest.fn().mockResolvedValue(true)
        }
      }));
    });

    // Mock email service
    jest.mock('../services/email', () => ({
      sendEmail: jest.fn().mockResolvedValue(true)
    }));
  }

  // Assert response structure
  expectValidResponse(response, expectedStatus = 200) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('success');
    expect(response.body).toHaveProperty('message');
    
    if (response.body.success) {
      expect(response.body).toHaveProperty('data');
    }
  }

  // Assert error response
  expectErrorResponse(response, expectedStatus = 400) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body.success).toBe(false);
    expect(response.body).toHaveProperty('message');
  }

  // Assert pagination response
  expectPaginatedResponse(response) {
    expect(response.body.data).toHaveProperty('items');
    expect(response.body.data).toHaveProperty('pagination');
    expect(response.body.data.pagination).toHaveProperty('page');
    expect(response.body.data.pagination).toHaveProperty('limit');
    expect(response.body.data.pagination).toHaveProperty('total');
  }
}

// Test data factories
class TestDataFactory {
  static users(count = 1) {
    return Array.from({ length: count }, (_, i) => ({
      _id: `test_user_${i + 1}`,
      name: `Test User ${i + 1}`,
      email: `test${i + 1}@example.com`,
      phone: `987654321${i}`,
      password: 'TestPassword123!',
      role: i === 0 ? 'admin' : i < 3 ? 'customer' : 'artisan',
      createdAt: new Date().toISOString()
    }));
  }

  static products(count = 1, artisanId = 'artisan_1') {
    const categories = ['Pottery', 'Textiles', 'Jewelry', 'Woodwork'];
    
    return Array.from({ length: count }, (_, i) => ({
      _id: `test_product_${i + 1}`,
      name: `Test Product ${i + 1}`,
      description: `Test product ${i + 1} description`,
      category: categories[i % categories.length],
      price: 500 + (i * 100),
      artisanId: artisanId,
      inventory: {
        total: 10,
        available: 10 - i,
        reserved: i
      },
      images: [{
        url: `https://example.com/image${i + 1}.jpg`,
        alt: `Test product ${i + 1} image`,
        isPrimary: true
      }],
      createdAt: new Date().toISOString()
    }));
  }

  static orders(count = 1, customerId = 'customer_1') {
    return Array.from({ length: count }, (_, i) => ({
      orderId: `ORD_TEST_${String(i + 1).padStart(3, '0')}`,
      customerId: customerId,
      items: [{
        productId: `test_product_${i + 1}`,
        quantity: i + 1,
        price: 500 + (i * 100)
      }],
      shippingAddress: {
        name: `Test User ${i + 1}`,
        street: `${i + 1} Test Street`,
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        phone: `987654321${i}`
      },
      payment: {
        method: 'razorpay',
        status: i % 2 === 0 ? 'completed' : 'pending',
        transactionId: `txn_test_${i + 1}`
      },
      total: (500 + (i * 100)) * (i + 1),
      status: i % 3 === 0 ? 'delivered' : i % 3 === 1 ? 'shipped' : 'pending',
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
    }));
  }
}

module.exports = {
  TestUtils,
  TestDataFactory
};
