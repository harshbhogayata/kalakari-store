// Comprehensive integration tests
const request = require('supertest');
const { TestUtils, TestDataFactory } = require('./testUtils');

describe('Kalakari E-commerce API', () => {
  let app;
  let testUtils;
  let authToken;

  beforeAll(async () => {
    // Import app after setting up test environment
    process.env.NODE_ENV = 'test';
    app = require('../index');
    testUtils = new TestUtils(app);
    
    // Generate auth token
    authToken = testUtils.generateTestToken('customer_1', 'customer');
    
    // Wait for server to be ready
    await testUtils.wait(1000);
  });

  afterAll(async () => {
    await testUtils.cleanup();
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/dev/auth/login', () => {
      it('should login with valid credentials', async () => {
        const response = await request(app)
          .post('/api/dev/auth/login')
          .send({
            email: 'priya@gmail.com',
            password: 'Kalakari2024!'
          });

        testUtils.expectValidResponse(response, 200);
        expect(response.body.data).toHaveProperty('user');
        expect(response.body.data).toHaveProperty('token');
        expect(response.body.data.user.email).toBe('priya@gmail.com');
      });

      it('should reject invalid credentials', async () => {
        const response = await request(app)
          .post('/api/dev/auth/login')
          .send({
            email: 'invalid@example.com',
            password: 'wrongpassword'
          });

        testUtils.expectErrorResponse(response, 401);
        expect(response.body.message).toContain('Invalid credentials');
      });

      it('should validate required fields', async () => {
        const response = await request(app)
          .post('/api/dev/auth/login')
          .send({});

        testUtils.expectErrorResponse(response, 400);
        expect(response.body.message).toContain('Email and password are required');
      });
    });

    describe('GET /api/dev/auth/me', () => {
      it('should return user data with valid token', async () => {
        const response = await testUtils.authenticatedRequest('get', '/api/dev/auth/me', authToken);

        testUtils.expectValidResponse(response, 200);
        expect(response.body.data).toHaveProperty('user');
        expect(response.body.data.user).toHaveProperty('email');
      });

      it('should reject request without token', async () => {
        const response = await request(app)
          .get('/api/dev/auth/me');

        testUtils.expectErrorResponse(response, 401);
        expect(response.body.message).toContain('No token, authorization denied');
      });
    });
  });

  describe('Product Endpoints', () => {
    describe('GET /api/dev/products', () => {
      it('should return products list', async () => {
        const response = await request(app)
          .get('/api/dev/products');

        testUtils.expectValidResponse(response, 200);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
      });

      it('should support pagination', async () => {
        const response = await request(app)
          .get('/api/dev/products?page=1&limit=5');

        testUtils.expectValidResponse(response, 200);
        expect(response.body.data.length).toBeLessThanOrEqual(5);
      });

      it('should support category filtering', async () => {
        const response = await request(app)
          .get('/api/dev/products?category=Pottery');

        testUtils.expectValidResponse(response, 200);
        expect(response.body.data.every(product => product.category === 'Pottery')).toBe(true);
      });

      it('should support price range filtering', async () => {
        const response = await request(app)
          .get('/api/dev/products?minPrice=1000&maxPrice=3000');

        testUtils.expectValidResponse(response, 200);
        expect(response.body.data.every(product => 
          product.price >= 1000 && product.price <= 3000
        )).toBe(true);
      });
    });

    describe('GET /api/dev/products/:id', () => {
      it('should return product details', async () => {
        const response = await request(app)
          .get('/api/dev/products/product_1');

        testUtils.expectValidResponse(response, 200);
        expect(response.body.data).toHaveProperty('name');
        expect(response.body.data).toHaveProperty('description');
        expect(response.body.data).toHaveProperty('price');
      });

      it('should return 404 for non-existent product', async () => {
        const response = await request(app)
          .get('/api/dev/products/nonexistent');

        testUtils.expectErrorResponse(response, 404);
      });
    });
  });

  describe('Cart and Order Endpoints', () => {
    let orderData;

    beforeEach(() => {
      orderData = testUtils.createTestOrder();
    });

    describe('POST /api/dev/orders', () => {
      it('should create order with valid data', async () => {
        const response = await request(app)
          .post('/api/dev/orders')
          .send(orderData);

        testUtils.expectValidResponse(response, 201);
        expect(response.body.data.order).toHaveProperty('orderId');
        expect(response.body.data.order.items).toHaveLength(1);
      });

      it('should validate required fields', async () => {
        const invalidOrder = { ...orderData };
        delete invalidOrder.items;

        const response = await request(app)
          .post('/api/dev/orders')
          .send(invalidOrder);

        testUtils.expectErrorResponse(response, 400);
        expect(response.body.message).toContain('Items array is required');
      });

      it('should validate shipping address', async () => {
        const invalidOrder = { ...orderData };
        invalidOrder.shippingAddress.name = '';

        const response = await request(app)
          .post('/api/dev/orders')
          .send(invalidOrder);

        testUtils.expectErrorResponse(response, 400);
        expect(response.body.message).toContain('Missing required address fields');
      });
    });

    describe('GET /api/dev/orders/user', () => {
      it('should return user orders', async () => {
        const response = await testUtils.authenticatedRequest('get', '/api/dev/orders/user', authToken);

        testUtils.expectValidResponse(response, 200);
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });
  });

  describe('Payment Endpoints', () => {
    describe('POST /api/dev/payments/create-order', () => {
      it('should create Razorpay order', async () => {
        const response = await request(app)
          .post('/api/dev/payments/create-order')
          .send({
            amount: 2000,
            currency: 'INR'
          });

        testUtils.expectValidResponse(response, 200);
        expect(response.body.data).toHaveProperty('orderId');
        expect(response.body.data).toHaveProperty('amount');
      });

      it('should validate amount', async () => {
        const response = await request(app)
          .post('/api/dev/payments/create-order')
          .send({
            amount: 0,
            currency: 'INR'
          });

        testUtils.expectErrorResponse(response, 400);
        expect(response.body.message).toContain('Amount must be greater than 0');
      });
    });

    describe('POST /api/dev/payments/verify', () => {
      it('should verify payment', async () => {
        const response = await request(app)
          .post('/api/dev/payments/verify')
          .send({
            orderId: 'test_order_123',
            paymentId: 'pay_test_123',
            signature: 'test_signature_123'
          });

        testUtils.expectValidResponse(response, 200);
        expect(response.body.data).toHaveProperty('verified');
        expect(response.body.data.verified).toBe(true);
      });
    });
  });

  describe('Wishlist Endpoints', () => {
    describe('GET /api/dev/wishlist', () => {
      it('should return user wishlist', async () => {
        const response = await testUtils.authenticatedRequest('get', '/api/dev/wishlist', authToken);

        testUtils.expectValidResponse(response, 200);
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });

    describe('POST /api/dev/wishlist', () => {
      it('should add product to wishlist', async () => {
        const response = await testUtils.authenticatedRequest('post', '/api/dev/wishlist', authToken)
          .send({
            productId: 'product_1'
          });

        testUtils.expectValidResponse(response, 201);
        expect(response.body.message).toContain('added to wishlist');
      });
    });

    describe('DELETE /api/dev/wishlist/:productId', () => {
      it('should remove product from wishlist', async () => {
        const response = await testUtils.authenticatedRequest('delete', '/api/dev/wishlist/product_1', authToken);

        testUtils.expectValidResponse(response, 200);
        expect(response.body.message).toContain('removed from wishlist');
      });
    });
  });

  describe('Review Endpoints', () => {
    describe('GET /api/dev/products/:productId/reviews', () => {
      it('should return product reviews', async () => {
        const response = await request(app)
          .get('/api/dev/products/product_1/reviews');

        testUtils.expectValidResponse(response, 200);
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });

    describe('POST /api/dev/products/:productId/reviews', () => {
      it('should create review with valid data', async () => {
        const reviewData = {
          rating: 5,
          comment: 'Great product!',
          title: 'Excellent quality'
        };

        const response = await testUtils.authenticatedRequest('post', '/api/dev/products/product_1/reviews', authToken)
          .send(reviewData);

        testUtils.expectValidResponse(response, 201);
        expect(response.body.data.review).toHaveProperty('rating');
        expect(response.body.data.review.rating).toBe(5);
      });

      it('should validate rating range', async () => {
        const response = await testUtils.authenticatedRequest('post', '/api/dev/products/product_1/reviews', authToken)
          .send({
            rating: 6,
            comment: 'Invalid rating'
          });

        testUtils.expectErrorResponse(response, 400);
        expect(response.body.message).toContain('Rating must be between 1 and 5');
      });
    });
  });

  describe('Admin Endpoints', () => {
    let adminToken;

    beforeAll(() => {
      adminToken = testUtils.generateTestToken('admin_1', 'admin');
    });

    describe('GET /api/dev/admin/products', () => {
      it('should return all products for admin', async () => {
        const response = await testUtils.authenticatedRequest('get', '/api/dev/admin/products', adminToken);

        testUtils.expectValidResponse(response, 200);
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('should reject non-admin users', async () => {
        const response = await testUtils.authenticatedRequest('get', '/api/dev/admin/products', authToken);

        testUtils.expectErrorResponse(response, 403);
        expect(response.body.message).toContain('Access denied');
      });
    });

    describe('POST /api/dev/admin/products', () => {
      it('should create product with valid data', async () => {
        const productData = testUtils.createTestProduct();

        const response = await testUtils.authenticatedRequest('post', '/api/dev/admin/products', adminToken)
          .send(productData);

        testUtils.expectValidResponse(response, 201);
        expect(response.body.data.product).toHaveProperty('_id');
        expect(response.body.data.product.name).toBe(productData.name);
      });
    });
  });

  describe('Search Endpoints', () => {
    describe('GET /api/dev/search', () => {
      it('should search products by query', async () => {
        const response = await request(app)
          .get('/api/dev/search?q=pottery');

        testUtils.expectValidResponse(response, 200);
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('should return empty array for no results', async () => {
        const response = await request(app)
          .get('/api/dev/search?q=nonexistentproduct');

        testUtils.expectValidResponse(response, 200);
        expect(response.body.data).toHaveLength(0);
      });
    });

    describe('GET /api/dev/search/suggestions', () => {
      it('should return search suggestions', async () => {
        const response = await request(app)
          .get('/api/dev/search/suggestions?q=pot');

        testUtils.expectValidResponse(response, 200);
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/dev/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should handle server errors gracefully', async () => {
      // This would require mocking a server error
      const response = await request(app)
        .get('/api/dev/products/invalid-id');

      // Should not crash the server
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Performance Tests', () => {
    it('should respond within acceptable time limits', async () => {
      const start = Date.now();
      
      const response = await request(app)
        .get('/api/dev/products');
      
      const duration = Date.now() - start;
      
      testUtils.expectValidResponse(response, 200);
      expect(duration).toBeLessThan(1000); // Should respond within 1 second
    });

    it('should handle concurrent requests', async () => {
      const promises = Array.from({ length: 10 }, () => 
        request(app).get('/api/dev/products')
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        testUtils.expectValidResponse(response, 200);
      });
    });
  });
});

// Performance benchmarking
describe('Performance Benchmarks', () => {
  let app;

  beforeAll(async () => {
    app = require('../index');
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  it('should handle 100 concurrent requests', async () => {
    const start = Date.now();
    
    const promises = Array.from({ length: 100 }, () => 
      request(app).get('/api/dev/products')
    );

    const responses = await Promise.all(promises);
    const duration = Date.now() - start;
    
    console.log(`100 concurrent requests completed in ${duration}ms`);
    console.log(`Average response time: ${duration / 100}ms`);
    
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
    
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
  });
});
