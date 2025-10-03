const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');

// Import models
const User = require('./models/User');
const Artisan = require('./models/Artisan');
const Product = require('./models/Product');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kalakari-shop', {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000
    });

    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Artisan.deleteMany({});
    await Product.deleteMany({});

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@kalakari.shop',
      phone: '9876543210',
      password: hashedPassword,
      role: 'admin'
    });

    const customer1 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@gmail.com',
      phone: '9876543211',
      password: hashedPassword,
      role: 'customer'
    });

    const customer2 = await User.create({
      name: 'Arjun Singh',
      email: 'arjun@gmail.com',
      phone: '9876543212',
      password: hashedPassword,
      role: 'customer'
    });

    // Create sample artisans
    const artisan1 = await Artisan.create({
      userId: (await User.findOne({ email: 'priya@gmail.com' }))._id,
      businessName: 'CraftVille Studios',
      description: 'Traditional Indian pottery and ceramics with modern design',
      craftType: 'Pottery',
      state: 'Rajasthan',
      city: 'Jaipur',
      experience: 10,
      languages: ['Hindi', 'English'],
      isVerified: true,
      isApproved: true,
      commissionRate: 15,
      totalSales: 0,
      rating: { average: 4.5, count: 20 }
    });

    const artisan2 = await Artisan.create({
      userId: (await User.findOne({ email: 'arjun@gmail.com' }))._id,
      businessName: 'Textile Heritage',
      description: 'Handwoven textiles and block printing from Gujarat',
      craftType: 'Textiles',
      state: 'Gujarat',
      city: 'Ahmedabad',
      experience: 12,
      languages: ['Gujarati', 'Hindi', 'English'],
      isVerified: true,
      isApproved: true,
      commissionRate: 18,
      totalSales: 0,
      rating: { average: 4.8, count: 35 }
    });

    // Create sample products
    const products = [
      {
        artisanId: artisan1._id,
        name: 'Royal Terracotta Vase',
        description: 'Handcrafted terracotta vase with intricate Rajasthani patterns. Perfect for both traditional and modern decor.',
        category: 'Pottery',
        price: 2500,
        originalPrice: 3000,
        discount: 17,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1887&auto=format&fit=crop',
            alt: 'Royal Terracotta Vase'
          }
        ],
        inventory: { total: 10, available: 10, reserved: 0 },
        dimensions: { length: 25, width: 25, height: 40, weight: 2.5, unit: 'cm' },
        materials: ['Clay', 'Natural Dyes'],
        colors: ['Terracotta', 'Brown', 'Cream'],
        tags: ['Terracotta', 'Traditional', 'Vase', 'Decor'],
        isActive: true,
        isApproved: true,
        isFeatured: true,
        shipping: {
          weight: 2.5,
          dimensions: { length: 25, width: 25, height: 40 },
          fragile: true,
          estimatedDays: 7
        },
        stats: { views: 0, likes: 0, shares: 0, orders: 0 }
      },
      {
        artisanId: artisan1._id,
        name: 'Blue Pottery Bowl Set',
        description: 'Authentic blue pottery bowls from Jaipur. Each piece is hand-painted with traditional motifs.',
        category: 'Pottery',
        price: 1800,
        originalPrice: 2200,
        discount: 18,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1600661633315-7389108b31a1?q=80&w=1887&auto=format&fit=crop',
            alt: 'Blue Pottery Bowl Set'
          }
        ],
        inventory: { total: 15, available: 15, reserved: 0 },
        dimensions: { length: 30, width: 30, height: 15, weight: 1.8, unit: 'cm' },
        materials: ['Clay', 'Cobalt Oxide', 'Quartz'],
        colors: ['Blue', 'White'],
        tags: ['Blue Pottery', 'Bowls', 'Set', 'Traditional'],
        isActive: true,
        isApproved: true,
        isFeatured: true,
        shipping: {
          weight: 1.8,
          dimensions: { length: 30, width: 30, height: 15 },
          fragile: true,
          estimatedDays: 7
        },
        stats: { views: 0, likes: 0, shares: 0, orders: 0 }
      },
      {
        artisanId: artisan2._id,
        name: 'Banarasi Silk Saree',
        description: 'Elegant Banarasi silk saree with intricate golden zari work. Perfect for special occasions.',
        category: 'Textiles',
        price: 8500,
        originalPrice: 12000,
        discount: 29,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1619521441258-501a6b0f1b2a?q=80&w=1887&auto=format&fit=crop',
            alt: 'Banarasi Silk Saree'
          }
        ],
        inventory: { total: 5, available: 5, reserved: 0 },
        dimensions: { length: 550, width: 120, height: 1, weight: 0.8, unit: 'cm' },
        materials: ['Silk', 'Gold Zari', 'Silver Thread'],
        colors: ['Maroon', 'Gold'],
        tags: ['Banarasi', 'Silk', 'Saree', 'Special Occasion'],
        isActive: true,
        isApproved: true,
        isFeatured: true,
        shipping: {
          weight: 0.8,
          dimensions: { length: 55, width: 12, height: 1 },
          fragile: false,
          estimatedDays: 5
        },
        stats: { views: 0, likes: 0, shares: 0, orders: 0 }
      },
      {
        artisanId: artisan2._id,
        name: 'Block Print Cotton Kurta',
        description: 'Comfortable cotton kurta with traditional block print patterns. Perfect for everyday wear.',
        category: 'Textiles',
        price: 1200,
        originalPrice: 1500,
        discount: 20,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=2005&auto=format&fit|crop',
            alt: 'Block Print Cotton Kurta'
          }
        ],
        inventory: { total: 25, available: 25, reserved: 0 },
        dimensions: { length: 70, width: 50, height: 2, weight: 0.3, unit: 'cm' },
        materials: ['Cotton', 'Natural Dyes'],
        colors: ['Indigo', 'White', 'Red'],
        tags: ['Cotton', 'Block Print', 'Kurta', 'Casual'],
        isActive: true,
        isApproved: true,
        isFeatured: false,
        shipping: {
          weight: 0.3,
          dimensions: { length: 70, width: 50, height: 2 },
          fragile: false,
          estimatedDays: 5
        },
        stats: { views: 0, likes: 0, shares: 0, orders: 0 }
      },
      {
        artisanId: artisan1._id,
        name: 'Handmade Ceramic Dinner Set',
        description: 'Complete dinner set for 6 people with traditional Rajasthani pottery designs.',
        category: 'Pottery',
        price: 4500,
        originalPrice: 6000,
        discount: 25,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1594917862029-31b62ec4be5c?q=80&w=1964&auto=format&fit=crop',
            alt: 'Handmade Ceramic Dinner Set'
          }
        ],
        inventory: { total: 8, available: 8, reserved: 0 },
        dimensions: { length: 40, width: 40, height: 12, weight: 4.2, unit: 'cm' },
        materials: ['Ceramic Clay', 'Glaze'],
        colors: ['White', 'Brown', 'Cream'],
        tags: ['Dinner Set', 'Ceramic', 'Complete Set'],
        isActive: true,
        isApproved: true,
        isFeatured: true,
        shipping: {
          weight: 4.2,
          dimensions: { length: 40, width: 40, height: 12 },
          fragile: true,
          estimatedDays: 7
        },
        stats: { views: 0, likes: 0, shares: 0, orders: 0 }
      }
    ];

    // Add products
    for (const productData of products) {
      await Product.create(productData);
    }

    console.log('✅ Seed data created successfully!');
    console.log(`Created ${products.length} products`);
    console.log(`Created ${await User.countDocuments()} users`);
    console.log(`Created ${await Artisan.countDocuments()} artisans`);
    
    console.log('\n📝 Login Credentials:');
    console.log('Admin: admin@kalakari.shop / password123');
    console.log('Customer: priya@gmail.com / password123');
    console.log('Customer: arjun@gmail.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
