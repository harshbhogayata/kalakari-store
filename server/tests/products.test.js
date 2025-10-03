const request = require('supertest');
const app = require('../index');
const { Product, User } = require('../models');

describe('Product Routes', () => {
  let authToken;
  let testUser;

  beforeEach(async () => {
    // Clean up test data
    await Product.deleteMany({});
    await User.deleteMany({});

    // Create test user and get auth token
    const userData = {
      name: 'Test Artisan',
      email: 'artisan@example.com',
      phone: '9876543210',
      password: 'TestPassword123',
      confirmPassword: 'TestPassword123',
      role: 'artisan'
    };

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);

    authToken = registerResponse.body.data.token;
    testUser = registerResponse.body.data.user;
  });

  describe('GET /api/products', () => {
    beforeEach(async () => {
      // Create test products
      const products = [
        {
          name: 'Test Product 1',
          description: 'A test product',
          price: 1000,
          category: 'Pottery',
          artisanId: testUser._id,
          inventory: { total: 10, available: 5, reserved: 0 },
          isActive: true,
          isApproved: true
        },
        {
          name: 'Test Product 2',
          description: 'Another test product',
          price: 2000,
          category: 'Textiles',
          artisanId: testUser._id,
          inventory: { total: 5, available: 3, reserved: 0 },
          isActive: true,
          isApproved: true
        }
      ];

      await Product.insertMany(products);
    });

    it('should get all products', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toHaveLength(2);
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/products?category=Pottery')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.products[0].category).toBe('Pottery');
    });

    it('should filter products by price range', async () => {
      const response = await request(app)
        .get('/api/products?minPrice=1500&maxPrice=2500')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.products[0].price).toBe(2000);
    });

    it('should search products by name', async () => {
      const response = await request(app)
        .get('/api/products?search=Product 1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.products[0].name).toBe('Test Product 1');
    });

    it('should paginate products', async () => {
      const response = await request(app)
        .get('/api/products?page=1&limit=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.pagination.current).toBe(1);
      expect(response.body.data.pagination.total).toBe(2);
    });
  });

  describe('GET /api/products/:id', () => {
    let testProduct;

    beforeEach(async () => {
      testProduct = await Product.create({
        name: 'Test Product',
        description: 'A test product',
        price: 1000,
        category: 'Pottery',
        artisanId: testUser._id,
        inventory: { total: 10, available: 5, reserved: 0 },
        isActive: true,
        isApproved: true
      });
    });

    it('should get a single product', async () => {
      const response = await request(app)
        .get(`/api/products/${testProduct._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.product.name).toBe('Test Product');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/products/507f1f77bcf86cd799439011')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid product ID', async () => {
      const response = await request(app)
        .get('/api/products/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const productData = {
        name: 'New Test Product',
        description: 'A new test product',
        price: 1500,
        category: 'Pottery',
        inventory: {
          total: 10,
          available: 10,
          reserved: 0
        },
        materials: ['Clay'],
        colors: ['Blue'],
        tags: ['Handmade', 'Traditional']
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.product.name).toBe(productData.name);
    });

    it('should fail without authentication', async () => {
      const productData = {
        name: 'New Test Product',
        description: 'A new test product',
        price: 1500,
        category: 'Pottery'
      };

      const response = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid data', async () => {
      const productData = {
        name: '', // Invalid: empty name
        description: 'A new test product',
        price: -100, // Invalid: negative price
        category: 'InvalidCategory' // Invalid category
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/products/:id', () => {
    let testProduct;

    beforeEach(async () => {
      testProduct = await Product.create({
        name: 'Test Product',
        description: 'A test product',
        price: 1000,
        category: 'Pottery',
        artisanId: testUser._id,
        inventory: { total: 10, available: 5, reserved: 0 },
        isActive: true,
        isApproved: true
      });
    });

    it('should update a product', async () => {
      const updateData = {
        name: 'Updated Test Product',
        price: 1200
      };

      const response = await request(app)
        .put(`/api/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.product.name).toBe(updateData.name);
      expect(response.body.data.product.price).toBe(updateData.price);
    });

    it('should fail to update product of another artisan', async () => {
      // Create another user
      const anotherUser = await User.create({
        name: 'Another Artisan',
        email: 'another@example.com',
        phone: '9876543211',
        password: 'TestPassword123',
        role: 'artisan'
      });

      // Create product for another user
      const anotherProduct = await Product.create({
        name: 'Another Product',
        description: 'Another test product',
        price: 1000,
        category: 'Pottery',
        artisanId: anotherUser._id,
        inventory: { total: 10, available: 5, reserved: 0 },
        isActive: true,
        isApproved: true
      });

      const updateData = {
        name: 'Unauthorized Update'
      };

      const response = await request(app)
        .put(`/api/products/${anotherProduct._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/products/:id', () => {
    let testProduct;

    beforeEach(async () => {
      testProduct = await Product.create({
        name: 'Test Product',
        description: 'A test product',
        price: 1000,
        category: 'Pottery',
        artisanId: testUser._id,
        inventory: { total: 10, available: 5, reserved: 0 },
        isActive: true,
        isApproved: true
      });
    });

    it('should delete a product', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify product is deleted
      const deletedProduct = await Product.findById(testProduct._id);
      expect(deletedProduct).toBeNull();
    });

    it('should fail to delete non-existent product', async () => {
      const response = await request(app)
        .delete('/api/products/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
